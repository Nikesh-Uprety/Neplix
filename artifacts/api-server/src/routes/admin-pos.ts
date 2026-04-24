import { Router, type IRouter, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, ordersTable, productsTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdminPage } from "../middlewares/admin.js";
import { resolveTenantContext, type TenantRequest } from "../middlewares/tenant.js";
import { incrementStoreUsage } from "../lib/usage.js";

const router: IRouter = Router();
router.use(authMiddleware, resolveTenantContext, requireAdminPage("pos"));

router.get("/products", async (req: TenantRequest, res: Response) => {
  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      stock: productsTable.stock,
      sku: productsTable.sku,
    })
    .from(productsTable)
    .where(eq(productsTable.storeId, req.tenant!.storeId))
    .orderBy(desc(productsTable.createdAt))
    .limit(300);
  res.json({ products: rows });
});

router.get("/orders", async (req: TenantRequest, res: Response) => {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(and(eq(ordersTable.storeId, req.tenant!.storeId), eq(ordersTable.status, "delivered")))
    .orderBy(desc(ordersTable.createdAt))
    .limit(50);
  res.json({ orders: rows });
});

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      name: z.string().min(1),
      price: z.number().int().min(0),
      quantity: z.number().int().min(1),
    }),
  ),
  tax: z.number().int().min(0).default(0),
});

router.post("/checkout", async (req: TenantRequest, res: Response) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + parsed.data.tax;
  const orderNumber = `POS-${Date.now()}`;

  const [order] = await db
    .insert(ordersTable)
    .values({
      storeId: req.tenant!.storeId,
      orderNumber,
      items: parsed.data.items,
      subtotal,
      tax: parsed.data.tax,
      total,
      status: "delivered",
      paymentStatus: "paid",
    })
    .returning();

  for (const item of parsed.data.items) {
    await db
      .update(productsTable)
      .set({
        stock: sql`GREATEST(0, ${productsTable.stock} - ${item.quantity})`,
        updatedAt: new Date(),
      })
      .where(and(eq(productsTable.id, item.productId), eq(productsTable.storeId, req.tenant!.storeId)));
  }

  await incrementStoreUsage(req.tenant!.storeId, "orders", 1);
  res.status(201).json({ order });
});

export default router;
