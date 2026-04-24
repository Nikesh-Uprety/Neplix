import { Router, type IRouter, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, mediaAssetsTable, mediaBucketsTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import { resolveTenantContext, type TenantRequest } from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext);

router.get("/images", requireAdminPage("images"), async (req: TenantRequest, res: Response) => {
  const rows = await db
    .select()
    .from(mediaAssetsTable)
    .where(eq(mediaAssetsTable.storeId, req.tenant!.storeId))
    .orderBy(desc(mediaAssetsTable.createdAt))
    .limit(300);
  res.json({ assets: rows });
});

const createAssetSchema = z.object({
  title: z.string().optional(),
  url: z.string().url(),
  bucketId: z.string().uuid().optional(),
  mimeType: z.string().optional(),
  isStorefront: z.boolean().default(false),
});

router.post("/images", requireAdminPage("images"), async (req: TenantRequest, res: Response) => {
  const parsed = createAssetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [row] = await db
    .insert(mediaAssetsTable)
    .values({ ...parsed.data, storeId: req.tenant!.storeId })
    .returning();
  res.status(201).json({ asset: row });
});

router.delete("/images/:id", requireAdminPage("images"), async (req: TenantRequest, res: Response) => {
  const [row] = await db
    .delete(mediaAssetsTable)
    .where(and(eq(mediaAssetsTable.id, req.params.id as string), eq(mediaAssetsTable.storeId, req.tenant!.storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  res.json({ success: true });
});

router.get("/buckets", requireAdminPage("buckets"), async (req: TenantRequest, res: Response) => {
  const rows = await db
    .select()
    .from(mediaBucketsTable)
    .where(eq(mediaBucketsTable.storeId, req.tenant!.storeId))
    .orderBy(desc(mediaBucketsTable.createdAt));
  res.json({ buckets: rows });
});

const bucketSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

router.post("/buckets", requireAdminPage("buckets"), async (req: TenantRequest, res: Response) => {
  const parsed = bucketSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [row] = await db
    .insert(mediaBucketsTable)
    .values({ ...parsed.data, storeId: req.tenant!.storeId })
    .returning();
  res.status(201).json({ bucket: row });
});

router.get(
  "/storefront-images",
  requireAdminPage("storefront-images"),
  async (req: TenantRequest, res: Response) => {
    const rows = await db
      .select()
      .from(mediaAssetsTable)
      .where(and(eq(mediaAssetsTable.storeId, req.tenant!.storeId), eq(mediaAssetsTable.isStorefront, true)))
      .orderBy(desc(mediaAssetsTable.createdAt))
      .limit(200);
    res.json({ assets: rows });
  },
);

export default router;
