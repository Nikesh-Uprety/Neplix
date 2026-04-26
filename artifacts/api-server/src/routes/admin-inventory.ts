import { Router, type IRouter, type Response } from "express";
import {
  db,
  inventoryMovementsTable,
  productVariantsTable,
  productsTable,
} from "@workspace/db";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("inventory"));

const listQuery = z.object({
  threshold: z.coerce.number().int().min(0).default(10),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

router.get("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { limit } = parsed.data;
  const where = storeId ? eq(productVariantsTable.storeId, storeId) : undefined;
  const rowsQ = db
    .select({
      id: productVariantsTable.id,
      productId: productVariantsTable.productId,
      title: productVariantsTable.title,
      sku: productVariantsTable.sku,
      attributes: productVariantsTable.attributes,
      stock: productVariantsTable.stock,
      price: productVariantsTable.price,
      currency: productVariantsTable.currency,
      lowStockThreshold: productVariantsTable.lowStockThreshold,
      isActive: productVariantsTable.isActive,
    })
    .from(productVariantsTable)
    .orderBy(asc(productVariantsTable.stock))
    .limit(limit);
  const rows = where ? await rowsQ.where(where) : await rowsQ;
  res.json({ items: rows });
});

router.get("/low-stock", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = listQuery.safeParse(req.query);
  const threshold = parsed.success ? parsed.data.threshold : 10;
  const filters = [lte(productVariantsTable.stock, threshold)];
  if (storeId) filters.push(eq(productVariantsTable.storeId, storeId));
  const rows = await db
    .select({
      id: productVariantsTable.id,
      productId: productVariantsTable.productId,
      title: productVariantsTable.title,
      sku: productVariantsTable.sku,
      stock: productVariantsTable.stock,
      lowStockThreshold: productVariantsTable.lowStockThreshold,
    })
    .from(productVariantsTable)
    .where(and(...filters))
    .orderBy(asc(productVariantsTable.stock))
    .limit(200);
  res.json({ items: rows, threshold });
});

const adjustBodySchema = z.object({
  delta: z.coerce.number().int(),
  reason: z.string().trim().min(1).default("manual_adjustment"),
  note: z.string().optional(),
});

router.post("/skus/:id/adjust", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = adjustBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [variant] = await db
    .select()
    .from(productVariantsTable)
    .where(and(eq(productVariantsTable.id, id), eq(productVariantsTable.storeId, storeId)))
    .limit(1);
  if (!variant) {
    res.status(404).json({ error: "SKU not found" });
    return;
  }
  const nextStock = Math.max(0, variant.stock + parsed.data.delta);
  const [updated] = await db
    .update(productVariantsTable)
    .set({ stock: nextStock, updatedAt: new Date() })
    .where(and(eq(productVariantsTable.id, id), eq(productVariantsTable.storeId, storeId)))
    .returning();
  const [movement] = await db
    .insert(inventoryMovementsTable)
    .values({
      storeId,
      variantId: id,
      delta: nextStock - variant.stock,
      stockBefore: variant.stock,
      stockAfter: nextStock,
      reason: parsed.data.reason,
      note: parsed.data.note,
      createdByUserId: req.user?.id,
    })
    .returning();
  res.json({ sku: updated, movement });
});

const setSchema = z.object({ stock: z.coerce.number().int().min(0) });
router.post("/skus/:id/set", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = setSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [variant] = await db
    .select()
    .from(productVariantsTable)
    .where(and(eq(productVariantsTable.id, id), eq(productVariantsTable.storeId, storeId)))
    .limit(1);
  if (!variant) {
    res.status(404).json({ error: "SKU not found" });
    return;
  }
  const [updated] = await db
    .update(productVariantsTable)
    .set({ stock: parsed.data.stock, updatedAt: new Date() })
    .where(and(eq(productVariantsTable.id, id), eq(productVariantsTable.storeId, storeId)))
    .returning();
  const [movement] = await db
    .insert(inventoryMovementsTable)
    .values({
      storeId,
      variantId: id,
      delta: parsed.data.stock - variant.stock,
      stockBefore: variant.stock,
      stockAfter: parsed.data.stock,
      reason: "manual_set",
      createdByUserId: req.user?.id,
    })
    .returning();
  res.json({ sku: updated, movement });
});

router.get("/movements", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const rows = await db
    .select()
    .from(inventoryMovementsTable)
    .where(eq(inventoryMovementsTable.storeId, storeId))
    .orderBy(desc(inventoryMovementsTable.createdAt))
    .limit(200);
  res.json({ movements: rows });
});

// Legacy compatibility endpoints for existing frontend calls.
router.post("/:id/adjust", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = z
    .object({ delta: z.coerce.number().int() })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
    .limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const stock = Math.max(0, product.stock + parsed.data.delta);
  const [updated] = await db
    .update(productsTable)
    .set({ stock, updatedAt: new Date() })
    .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
    .returning();
  res.json({ product: updated });
});

router.post("/:id/set", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = z
    .object({ stock: z.coerce.number().int().min(0) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [updated] = await db
    .update(productsTable)
    .set({ stock: parsed.data.stock, updatedAt: new Date() })
    .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product: updated });
});

export default router;
