import { Router, type IRouter, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, storefrontPagesTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import { resolveTenantContext, type TenantRequest } from "../middlewares/tenant.js";
import { STOREFRONT_PRESETS, getPresetById } from "../lib/storefront-presets.js";

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

router.get("/pages/:id", async (req: TenantRequest, res: Response) => {
  const [row] = await db
    .select()
    .from(storefrontPagesTable)
    .where(
      and(
        eq(storefrontPagesTable.id, req.params.id as string),
        eq(storefrontPagesTable.storeId, req.tenant!.storeId),
      ),
    )
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.json({ page: row });
});

router.get("/templates", async (_req: TenantRequest, res: Response) => {
  res.json({
    templates: STOREFRONT_PRESETS.map((template) => ({
      id: template.id,
      name: template.name,
      pageTitle: template.pageTitle,
    })),
  });
});

const pageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.any().optional(),
  sections: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.string().min(1),
        props: z.record(z.any()).default({}),
        styles: z.record(z.string()).optional(),
      }),
    )
    .default([]),
  templatePresetId: z.string().min(1).nullable().optional(),
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

const applyTemplateSchema = z.object({
  pageId: z.string().uuid().optional(),
  templateId: z.string().min(1),
  slug: z.string().min(1).optional(),
});

router.post("/templates/apply", async (req: TenantRequest, res: Response) => {
  const parsed = applyTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const preset = getPresetById(parsed.data.templateId);
  if (!preset) {
    res.status(404).json({ error: "Template not found" });
    return;
  }
  if (parsed.data.pageId) {
    const [page] = await db
      .update(storefrontPagesTable)
      .set({
        title: preset.pageTitle,
        sections: preset.sections.map((s) => ({ ...s, id: crypto.randomUUID() })),
        templatePresetId: preset.id,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(storefrontPagesTable.id, parsed.data.pageId),
          eq(storefrontPagesTable.storeId, req.tenant!.storeId),
        ),
      )
      .returning();
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json({ page });
    return;
  }
  const [page] = await db
    .insert(storefrontPagesTable)
    .values({
      storeId: req.tenant!.storeId,
      slug: parsed.data.slug ?? "home",
      title: preset.pageTitle,
      sections: preset.sections.map((s) => ({ ...s, id: crypto.randomUUID() })),
      templatePresetId: preset.id,
      content: { schemaVersion: 1 },
      isPublished: false,
    })
    .returning();
  res.status(201).json({ page });
});

export default router;
