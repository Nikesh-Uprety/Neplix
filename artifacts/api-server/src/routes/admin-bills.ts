import { Router, type IRouter, type Response } from "express";
import { db, paymentsTable, usersTable, plansTable } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("bills"));

router.get("/", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const rows = await db
    .select({
      id: paymentsTable.id,
      userId: paymentsTable.userId,
      userEmail: usersTable.email,
      userName: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
      planSlug: plansTable.slug,
      planName: plansTable.name,
      provider: paymentsTable.provider,
      providerTxnId: paymentsTable.providerTxnId,
      amount: paymentsTable.amount,
      currency: paymentsTable.currency,
      status: paymentsTable.status,
      createdAt: paymentsTable.createdAt,
    })
    .from(paymentsTable)
    .leftJoin(usersTable, eq(paymentsTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(paymentsTable.planId, plansTable.id))
    .where(eq(usersTable.storeId, storeId))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(200);

  const [agg] = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${paymentsTable.status}='verified' THEN ${paymentsTable.amount} ELSE 0 END),0)::int`,
      pending: sql<number>`COUNT(*) FILTER (WHERE ${paymentsTable.status}='pending')::int`,
      verified: sql<number>`COUNT(*) FILTER (WHERE ${paymentsTable.status}='verified')::int`,
      failed: sql<number>`COUNT(*) FILTER (WHERE ${paymentsTable.status}='failed')::int`,
    })
    .from(paymentsTable)
    .leftJoin(usersTable, eq(paymentsTable.userId, usersTable.id))
    .where(and(eq(usersTable.storeId, storeId)));

  res.json({ bills: rows, summary: agg });
});

export default router;
