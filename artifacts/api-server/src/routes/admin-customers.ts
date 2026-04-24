import { Router, type IRouter, type Response } from "express";
import { db, customersTable, ordersTable } from "@workspace/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";
import { incrementStoreUsage } from "../lib/usage.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("customers"));

const listQuery = z.object({
  q: z.string().trim().min(1).optional(),
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
  const { q, limit, offset } = parsed.data;
  const filters = [];
  if (storeId) filters.push(eq(customersTable.storeId, storeId));
  if (q)
    filters.push(
      or(
        ilike(customersTable.email, `%${q}%`),
        ilike(customersTable.firstName, `%${q}%`),
        ilike(customersTable.lastName, `%${q}%`),
      )!,
    );

  const where = filters.length ? and(...filters) : undefined;

  const rowsQ = db
    .select({
      id: customersTable.id,
      firstName: customersTable.firstName,
      lastName: customersTable.lastName,
      email: customersTable.email,
      phone: customersTable.phone,
      notes: customersTable.notes,
      createdAt: customersTable.createdAt,
      ordersCount: sql<number>`(SELECT COUNT(*)::int FROM ${ordersTable} WHERE ${ordersTable.customerId} = ${customersTable.id})`,
      totalSpent: sql<number>`(SELECT COALESCE(SUM(${ordersTable.total}),0)::int FROM ${ordersTable} WHERE ${ordersTable.customerId} = ${customersTable.id})`,
    })
    .from(customersTable)
    .orderBy(desc(customersTable.createdAt))
    .limit(limit)
    .offset(offset);
  const totalQ = db
    .select({ count: sql<number>`count(*)::int` })
    .from(customersTable);

  const [rows, totalRows] = await Promise.all([
    where ? rowsQ.where(where) : rowsQ,
    where ? totalQ.where(where) : totalQ,
  ]);

  res.json({ customers: rows, total: totalRows[0]?.count ?? 0 });
});

router.get("/:id", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const [row] = await db
    .select()
    .from(customersTable)
    .where(and(eq(customersTable.id, id), eq(customersTable.storeId, storeId)))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  const orders = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.customerId, id), eq(ordersTable.storeId, storeId)))
    .orderBy(desc(ordersTable.createdAt))
    .limit(50);
  res.json({ customer: row, orders });
});

const upsertSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

router.post("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db
    .insert(customersTable)
    .values({ ...parsed.data, storeId })
    .returning();
  await incrementStoreUsage(storeId, "customers", 1);
  res.status(201).json({ customer: row });
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
    .update(customersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(customersTable.id, id), eq(customersTable.storeId, storeId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json({ customer: row });
});

router.delete("/:id", async (req: TenantRequest, res: Response) => {
  const id = req.params.id as string;
  await db
    .delete(customersTable)
    .where(and(eq(customersTable.id, id), eq(customersTable.storeId, req.tenant!.storeId)));
  res.json({ success: true });
});

export default router;
