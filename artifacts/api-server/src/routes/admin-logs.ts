import { Router, type IRouter, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, customersTable, ordersTable, productsTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import { resolveTenantContext, type TenantRequest } from "../middlewares/tenant.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("logs"));

router.get("/recent", async (req: TenantRequest, res: Response) => {
  const storeId = req.tenant!.storeId;
  const [orders, products, customers] = await Promise.all([
    db
      .select({ id: ordersTable.id, label: ordersTable.orderNumber, createdAt: ordersTable.createdAt })
      .from(ordersTable)
      .where(eq(ordersTable.storeId, storeId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(10),
    db
      .select({ id: productsTable.id, label: productsTable.name, createdAt: productsTable.createdAt })
      .from(productsTable)
      .where(eq(productsTable.storeId, storeId))
      .orderBy(desc(productsTable.createdAt))
      .limit(10),
    db
      .select({ id: customersTable.id, label: customersTable.email, createdAt: customersTable.createdAt })
      .from(customersTable)
      .where(eq(customersTable.storeId, storeId))
      .orderBy(desc(customersTable.createdAt))
      .limit(10),
  ]);

  const events = [
    ...orders.map((o) => ({ type: "order_created", id: o.id, label: o.label, createdAt: o.createdAt })),
    ...products.map((p) => ({ type: "product_created", id: p.id, label: p.label, createdAt: p.createdAt })),
    ...customers.map((c) => ({ type: "customer_created", id: c.id, label: c.label, createdAt: c.createdAt })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  res.json({ events: events.slice(0, 30) });
});

export default router;
