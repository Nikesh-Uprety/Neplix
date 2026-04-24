import { Router, type IRouter, type Response } from "express";
import { db, marketingCampaignsTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("marketing"));

router.get("/", async (req: TenantRequest, res: Response) => {
  const where = eq(marketingCampaignsTable.storeId, req.tenant!.storeId);
  const q = db
    .select()
    .from(marketingCampaignsTable)
    .orderBy(desc(marketingCampaignsTable.createdAt))
    .limit(200);
  const rows = where ? await q.where(where) : await q;
  res.json({ campaigns: rows });
});

const upsertSchema = z.object({
  name: z.string().min(1),
  channel: z.enum(["email", "sms", "whatsapp", "push"]).default("email"),
  status: z.enum(["draft", "scheduled", "sent", "paused"]).default("draft"),
  subject: z.string().optional(),
  content: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
});

router.post("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .insert(marketingCampaignsTable)
    .values({ ...parsed.data, storeId })
    .returning();
  res.status(201).json({ campaign: row });
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
    .update(marketingCampaignsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(marketingCampaignsTable.id, id), eq(marketingCampaignsTable.storeId, storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json({ campaign: row });
});

router.delete("/:id", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  await db
    .delete(marketingCampaignsTable)
    .where(and(eq(marketingCampaignsTable.id, id), eq(marketingCampaignsTable.storeId, req.tenant!.storeId)));
  res.json({ success: true });
});

export default router;
