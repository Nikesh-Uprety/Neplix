import { Router, type IRouter, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, storefrontPagesTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import { resolveTenantContext, type TenantRequest } from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("landing-page"));

router.get("/pages", async (req: TenantRequest, res: Response) => {
  const rows = await db
    .select()
    .from(storefrontPagesTable)
    .where(eq(storefrontPagesTable.storeId, req.tenant!.storeId))
    .orderBy(desc(storefrontPagesTable.updatedAt));
  res.json({ pages: rows });
});

const pageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.any().optional(),
  isPublished: z.boolean().default(false),
});

router.post("/pages", async (req: TenantRequest, res: Response) => {
  const parsed = pageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [row] = await db
    .insert(storefrontPagesTable)
    .values({ ...parsed.data, storeId: req.tenant!.storeId })
    .returning();
  res.status(201).json({ page: row });
});

router.patch("/pages/:id", async (req: TenantRequest, res: Response) => {
  const parsed = pageSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const [row] = await db
    .update(storefrontPagesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(storefrontPagesTable.id, req.params.id as string), eq(storefrontPagesTable.storeId, req.tenant!.storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.json({ page: row });
});

router.delete("/pages/:id", async (req: TenantRequest, res: Response) => {
  await db
    .delete(storefrontPagesTable)
    .where(and(eq(storefrontPagesTable.id, req.params.id as string), eq(storefrontPagesTable.storeId, req.tenant!.storeId)));
  res.json({ success: true });
});

export default router;
