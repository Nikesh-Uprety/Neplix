import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, mediaAssetsTable, mediaBucketsTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import { resolveTenantContext, type TenantRequest } from "../middlewares/tenant.js";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { uploadMediaAsset } from "../lib/media-upload.js";

const router: IRouter = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsRoot = resolve(__dirname, "../../uploads");

router.get("/files/:storeId/:fileName", async (req: Request, res: Response) => {
  const storeId = String(req.params.storeId ?? "");
  const fileName = String(req.params.fileName ?? "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!storeId || !fileName) {
    res.status(400).json({ error: "Invalid file path" });
    return;
  }
  const filePath = join(uploadsRoot, storeId, fileName);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "File not found" });
    }
  });
});

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

const uploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  dataBase64: z.string().min(1),
  title: z.string().optional(),
  bucketId: z.string().uuid().optional(),
  isStorefront: z.boolean().default(true),
});

router.post("/upload", requireAdminPage("images"), async (req: TenantRequest, res: Response) => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const storeId = req.tenant!.storeId;
  const uploaded = await uploadMediaAsset({
    storeId,
    fileName: parsed.data.fileName,
    contentType: parsed.data.contentType,
    dataBase64: parsed.data.dataBase64,
  });
  const fileUrl = uploaded.url;

  const [asset] = await db
    .insert(mediaAssetsTable)
    .values({
      storeId,
      title: parsed.data.title ?? parsed.data.fileName,
      url: fileUrl,
      mimeType: parsed.data.contentType,
      bucketId: parsed.data.bucketId,
      isStorefront: parsed.data.isStorefront,
    })
    .returning();

  res.status(201).json({ asset, url: fileUrl });
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
