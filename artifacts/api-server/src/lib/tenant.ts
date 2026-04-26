import {
  db,
  storeDomainsTable,
  storeMembershipsTable,
  storesTable,
  usersTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

async function nextUniqueStoreSlug(seed: string): Promise<string> {
  const base = slugify(seed) || "store";
  let idx = 0;
  while (idx < 1000) {
    const candidate = idx === 0 ? base : `${base}-${idx}`;
    const [exists] = await db
      .select({ id: storesTable.id })
      .from(storesTable)
      .where(eq(storesTable.slug, candidate))
      .limit(1);
    if (!exists) return candidate;
    idx += 1;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function provisionStoreForUser(args: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}): Promise<{ storeId: string; storeSlug: string }> {
  try {
    const displayName = `${args.firstName} ${args.lastName}`.trim() || args.email;
    const storeSlug = await nextUniqueStoreSlug(displayName);
    const storeName = `${displayName}'s Store`;

    logger.info({ userId: args.userId, storeSlug }, "Creating store for user");

    const [store] = await db
      .insert(storesTable)
      .values({
        slug: storeSlug,
        name: storeName,
        legalName: storeName,
        createdByUserId: args.userId,
        planCode: "free",
        settings: { currency: "NPR", locale: "en-NP", timezone: "Asia/Kathmandu" },
      })
      .returning({ id: storesTable.id, slug: storesTable.slug });

    logger.info({ storeId: store.id }, "Store created, adding membership");

    await db.insert(storeMembershipsTable).values({
      storeId: store.id,
      userId: args.userId,
      role: "owner",
      status: "active",
    });

    logger.info({ storeId: store.id, userId: args.userId }, "Updating user with storeId");

    await db
      .update(usersTable)
      .set({
        storeId: store.id,
        activeStoreId: store.id,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, args.userId));

    logger.info({ storeId: store.id, userId: args.userId }, "User updated with storeId - provisioning complete");

    return { storeId: store.id, storeSlug: store.slug };
  } catch (err) {
    logger.error({ err, userId: args.userId }, "Failed to provision store");
    throw err;
  }
}
