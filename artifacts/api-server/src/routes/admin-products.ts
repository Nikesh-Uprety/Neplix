import { Router, type IRouter, type Response } from "express";
import {
  db,
  productImagesTable,
  productVariantsTable,
  productsTable,
} from "@workspace/db";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
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
  const [variants, images] = await Promise.all([
    db
      .select()
      .from(productVariantsTable)
      .where(
        and(
          eq(productVariantsTable.productId, id),
          eq(productVariantsTable.storeId, storeId),
        ),
      )
      .orderBy(asc(productVariantsTable.createdAt)),
    db
      .select()
      .from(productImagesTable)
      .where(and(eq(productImagesTable.productId, id), eq(productImagesTable.storeId, storeId)))
      .orderBy(asc(productImagesTable.sortOrder), asc(productImagesTable.createdAt)),
  ]);
  res.json({ product: row, variants, images });
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
  variants: z
    .array(
      z.object({
        sku: z.string().trim().min(1).optional(),
        title: z.string().trim().min(1),
        attributes: z.record(z.string()).optional(),
        price: z.coerce.number().int().min(0).default(0),
        comparePrice: z.coerce.number().int().min(0).optional(),
        costPrice: z.coerce.number().int().min(0).optional(),
        currency: z.string().default("NPR"),
        stock: z.coerce.number().int().min(0).default(0),
        lowStockThreshold: z.coerce.number().int().min(0).default(10),
        isActive: z.boolean().default(true),
      }),
    )
    .default([]),
  productImages: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        sortOrder: z.coerce.number().int().min(0).default(0),
        isPrimary: z.boolean().default(false),
      }),
    )
    .default([]),
});

router.post("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const { variants, productImages, ...productPayload } = parsed.data;
  const [row] = await db
    .insert(productsTable)
    .values({ ...productPayload, storeId })
    .returning();
  if (variants.length > 0) {
    await db.insert(productVariantsTable).values(
      variants.map((variant) => ({
        ...variant,
        storeId,
        productId: row.id,
        attributes: variant.attributes ?? {},
      })),
    );
  }
  if (productImages.length > 0) {
    await db.insert(productImagesTable).values(
      productImages.map((image) => ({
        ...image,
        storeId,
        productId: row.id,
      })),
    );
  }
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
  const { variants, productImages, ...productPatch } = parsed.data;
  const [row] = await db
    .update(productsTable)
    .set({ ...productPatch, updatedAt: new Date() })
    .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  if (Array.isArray(variants)) {
    await db
      .delete(productVariantsTable)
      .where(and(eq(productVariantsTable.productId, id), eq(productVariantsTable.storeId, storeId)));
    if (variants.length > 0) {
      await db.insert(productVariantsTable).values(
        variants.map((variant) => ({
          ...variant,
          storeId,
          productId: id,
          attributes: variant.attributes ?? {},
        })),
      );
    }
  }
  if (Array.isArray(productImages)) {
    await db
      .delete(productImagesTable)
      .where(and(eq(productImagesTable.productId, id), eq(productImagesTable.storeId, storeId)));
    if (productImages.length > 0) {
      await db.insert(productImagesTable).values(
        productImages.map((image) => ({
          ...image,
          storeId,
          productId: id,
        })),
      );
    }
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

const variantSchema = z.object({
  sku: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1),
  attributes: z.record(z.string()).optional(),
  price: z.coerce.number().int().min(0).default(0),
  comparePrice: z.coerce.number().int().min(0).optional(),
  costPrice: z.coerce.number().int().min(0).optional(),
  currency: z.string().default("NPR"),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  isActive: z.boolean().default(true),
});

router.get("/:id/variants", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const variants = await db
    .select()
    .from(productVariantsTable)
    .where(
      and(
        eq(productVariantsTable.productId, productId),
        eq(productVariantsTable.storeId, storeId),
      ),
    )
    .orderBy(asc(productVariantsTable.createdAt));
  res.json({ variants });
});

router.post("/:id/variants", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = variantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [product] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.id, productId), eq(productsTable.storeId, storeId)))
    .limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [variant] = await db
    .insert(productVariantsTable)
    .values({
      ...parsed.data,
      attributes: parsed.data.attributes ?? {},
      storeId,
      productId,
    })
    .returning();
  res.status(201).json({ variant });
});

router.patch("/:id/variants/:variantId", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;
  const storeId = req.tenant!.storeId;
  const parsed = variantSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const patch: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.attributes) patch.attributes = parsed.data.attributes;
  const [variant] = await db
    .update(productVariantsTable)
    .set(patch)
    .where(
      and(
        eq(productVariantsTable.id, variantId),
        eq(productVariantsTable.productId, productId),
        eq(productVariantsTable.storeId, storeId),
      ),
    )
    .returning();
  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }
  res.json({ variant });
});

router.delete("/:id/variants/:variantId", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;
  const storeId = req.tenant!.storeId;
  const [variant] = await db
    .delete(productVariantsTable)
    .where(
      and(
        eq(productVariantsTable.id, variantId),
        eq(productVariantsTable.productId, productId),
        eq(productVariantsTable.storeId, storeId),
      ),
    )
    .returning();
  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }
  res.json({ success: true });
});

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

router.get("/:id/images", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const images = await db
    .select()
    .from(productImagesTable)
    .where(and(eq(productImagesTable.productId, productId), eq(productImagesTable.storeId, storeId)))
    .orderBy(asc(productImagesTable.sortOrder), asc(productImagesTable.createdAt));
  res.json({ images });
});

router.post("/:id/images", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const parsed = imageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [image] = await db
    .insert(productImagesTable)
    .values({ ...parsed.data, storeId, productId })
    .returning();
  res.status(201).json({ image });
});

router.patch("/:id/images/:imageId", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const imageId = req.params.imageId as string;
  const storeId = req.tenant!.storeId;
  const parsed = imageSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [image] = await db
    .update(productImagesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(productImagesTable.id, imageId),
        eq(productImagesTable.productId, productId),
        eq(productImagesTable.storeId, storeId),
      ),
    )
    .returning();
  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  res.json({ image });
});

router.delete("/:id/images/:imageId", async (req: TenantRequest, res: Response) => {
  const productId = req.params.id as string;
  const imageId = req.params.imageId as string;
  const storeId = req.tenant!.storeId;
  const [image] = await db
    .delete(productImagesTable)
    .where(
      and(
        eq(productImagesTable.id, imageId),
        eq(productImagesTable.productId, productId),
        eq(productImagesTable.storeId, storeId),
      ),
    )
    .returning();
  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
