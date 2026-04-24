import { Router, type IRouter, type Response } from "express";
import { db, ordersTable, productsTable, customersTable } from "@workspace/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import {
  resolveTenantContext,
  type TenantRequest,
} from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("analytics"));

router.get("/overview", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const storeWhere = eq(ordersTable.storeId, storeId);
  const custWhere = eq(customersTable.storeId, storeId);
  const prodWhere = eq(productsTable.storeId, storeId);

  const ordersAggQ = db
    .select({
      orders: sql<number>`COUNT(*)::int`,
      revenue: sql<number>`COALESCE(SUM(${ordersTable.total}),0)::int`,
    })
    .from(ordersTable);
  const custCountQ = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(customersTable);
  const prodCountQ = db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(productsTable);

  const [ordersAgg, custCount, prodCount] = await Promise.all([
    ordersAggQ.where(storeWhere),
    custCountQ.where(custWhere),
    prodCountQ.where(prodWhere),
  ]);

  res.json({
    orders: ordersAgg[0]?.orders ?? 0,
    revenue: ordersAgg[0]?.revenue ?? 0,
    customers: custCount[0]?.count ?? 0,
    products: prodCount[0]?.count ?? 0,
  });
});

router.get("/orders-trend", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const days = Number(req.query.days ?? 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const filters = [gte(ordersTable.createdAt, since)];
  filters.push(eq(ordersTable.storeId, storeId));

  const rows = await db
    .select({
      day: sql<string>`DATE(${ordersTable.createdAt})::text`,
      orders: sql<number>`COUNT(*)::int`,
      revenue: sql<number>`COALESCE(SUM(${ordersTable.total}),0)::int`,
    })
    .from(ordersTable)
    .where(and(...filters))
    .groupBy(sql`DATE(${ordersTable.createdAt})`)
    .orderBy(sql`DATE(${ordersTable.createdAt})`);

  res.json({ days, series: rows });
});

router.get("/top-products", async (req: TenantRequest, res: Response) => {
  const where = eq(productsTable.storeId, req.tenant!.storeId);
  const q = db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      stock: productsTable.stock,
    })
    .from(productsTable)
    .orderBy(sql`${productsTable.stock} DESC`)
    .limit(10);
  const rows = await q.where(where);
  res.json({ products: rows });
});

export default router;
