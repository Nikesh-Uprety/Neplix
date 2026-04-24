import { and, eq, gte, lte } from "drizzle-orm";
import { db, storeUsageCountersTable } from "@workspace/db";

function currentPeriodRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return { start, end };
}

export async function incrementStoreUsage(
  storeId: string,
  metric: "orders" | "products" | "customers" | "staff",
  delta = 1,
) {
  const { start, end } = currentPeriodRange();
  const [existing] = await db
    .select({ id: storeUsageCountersTable.id, value: storeUsageCountersTable.value })
    .from(storeUsageCountersTable)
    .where(
      and(
        eq(storeUsageCountersTable.storeId, storeId),
        eq(storeUsageCountersTable.metric, metric),
        gte(storeUsageCountersTable.periodStart, start),
        lte(storeUsageCountersTable.periodEnd, end),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(storeUsageCountersTable)
      .set({ value: Math.max(0, existing.value + delta), updatedAt: new Date() })
      .where(eq(storeUsageCountersTable.id, existing.id));
    return;
  }

  await db.insert(storeUsageCountersTable).values({
    storeId,
    metric,
    value: Math.max(0, delta),
    periodStart: start,
    periodEnd: end,
  });
}
