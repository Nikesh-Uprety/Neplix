import { Router, type IRouter, type Response } from "express";
import { db, promoCodesTable } from "@workspace/db";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("promo-codes"));

router.get("/", async (req: TenantRequest, res: Response) => {
  const where = eq(promoCodesTable.storeId, req.tenant!.storeId);
  const q = db
    .select()
    .from(promoCodesTable)
    .orderBy(desc(promoCodesTable.createdAt))
    .limit(200);
  const rows = where ? await q.where(where) : await q;
  res.json({ promoCodes: rows });
});

const upsertSchema = z.object({
  code: z.string().min(2).transform((s) => s.toUpperCase()),
  description: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]).default("percent"),
  discountValue: z.coerce.number().int().min(0),
  minOrderAmount: z.coerce.number().int().min(0).default(0),
  usageLimit: z.coerce.number().int().min(0).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
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
    .insert(promoCodesTable)
    .values({ ...parsed.data, storeId })
    .returning();
  res.status(201).json({ promoCode: row });
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
    .update(promoCodesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(promoCodesTable.id, id), eq(promoCodesTable.storeId, storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Promo code not found" });
    return;
  }
  res.json({ promoCode: row });
});

router.delete("/:id", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  await db
    .delete(promoCodesTable)
    .where(and(eq(promoCodesTable.id, id), eq(promoCodesTable.storeId, req.tenant!.storeId)));
  res.json({ success: true });
});

void and;
export default router;
