import { Router, type IRouter, type Response } from "express";
import { db, productsTable } from "@workspace/db";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";
import { incrementStoreUsage } from "../lib/usage.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("products"));

const listQuery = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { q, status, limit, offset } = parsed.data;

  const filters = [];
  if (storeId) filters.push(eq(productsTable.storeId, storeId));
  if (q) filters.push(ilike(productsTable.name, `%${q}%`));
  if (status) filters.push(eq(productsTable.status, status));

  const where = filters.length ? and(...filters) : undefined;

  const rowsQ = db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.createdAt))
    .limit(limit)
    .offset(offset);
  const totalQ = db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable);

  const [rows, totalRows] = await Promise.all([
    where ? rowsQ.where(where) : rowsQ,
    where ? totalQ.where(where) : totalQ,
  ]);

  res.json({ products: rows, total: totalRows[0]?.count ?? 0 });
});

router.get("/:id", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const [row] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product: row });
});

const upsertSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().int().min(0).default(0),
  comparePrice: z.coerce.number().int().min(0).optional(),
  currency: z.string().default("NPR"),
  stock: z.coerce.number().int().min(0).default(0),
  images: z.array(z.string()).default([]),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  isActive: z.boolean().default(true),
});

router.post("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [row] = await db
    .insert(productsTable)
    .values({ ...parsed.data, storeId })
    .returning();
  await incrementStoreUsage(storeId, "products", 1);
  res.status(201).json({ product: row });
});

router.patch("/:id", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .update(productsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product: row });
});

router.delete("/:id", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const [row] = await db
    .delete(productsTable)
    .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
