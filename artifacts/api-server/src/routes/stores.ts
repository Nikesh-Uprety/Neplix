import { Router, type IRouter, type Response } from "express";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import {
  db,
  productImagesTable,
  productVariantsTable,
  productsTable,
  plansTable,
  storeMembershipsTable,
  storefrontPagesTable,
  storeSettingsTable,
  storesTable,
  subscriptionsTable,
  usersTable,
} from "@workspace/db";
import { z } from "zod";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { toAuthUserResponse } from "./auth.js";

const router: IRouter = Router();

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

async function requireStoreRole(
  userId: string,
  storeId: string,
  roles: Array<"owner" | "admin" | "manager">,
) {
  const [membership] = await db
    .select({
      storeId: storeMembershipsTable.storeId,
      role: storeMembershipsTable.role,
      status: storeMembershipsTable.status,
    })
    .from(storeMembershipsTable)
    .where(
      and(
        eq(storeMembershipsTable.userId, userId),
        eq(storeMembershipsTable.storeId, storeId),
      ),
    )
    .limit(1);
  if (!membership || membership.status !== "active") return null;
  if (!roles.includes(membership.role as "owner" | "admin" | "manager")) return null;
  return membership;
}

const storeSettingsSchema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().min(1).max(32).default("#111827"),
  fontFamily: z.string().min(1).max(128).default("Inter"),
  navbarMenu: z
    .array(z.object({ label: z.string().min(1), url: z.string().min(1) }))
    .default([]),
  footerLinks: z
    .array(z.object({ label: z.string().min(1), url: z.string().min(1) }))
    .default([]),
  socialLinks: z.record(z.string()).default({}),
  landingTemplateId: z.string().min(1).nullable().optional(),
});

const createStoreSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).optional(),
  legalName: z.string().trim().min(2).max(160).optional(),
  settings: storeSettingsSchema.partial().optional(),
});

const patchStoreSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(2).max(80).optional(),
  legalName: z.string().trim().min(2).max(160).nullable().optional(),
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const stores = await db
    .select({
      id: storesTable.id,
      slug: storesTable.slug,
      name: storesTable.name,
      legalName: storesTable.legalName,
      status: storesTable.status,
      role: storeMembershipsTable.role,
      isActive: eq(storesTable.id, req.user!.activeStoreId ?? req.user!.storeId ?? ""),
      createdAt: storesTable.createdAt,
    })
    .from(storeMembershipsTable)
    .innerJoin(storesTable, eq(storeMembershipsTable.storeId, storesTable.id))
    .where(
      and(
        eq(storeMembershipsTable.userId, userId),
        eq(storeMembershipsTable.status, "active"),
      ),
    )
    .orderBy(asc(storesTable.name));
  res.json({ stores });
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const user = req.user!;
  const userId = user.id;
  const [{ totalStores }] = await db
    .select({
      totalStores: count(storeMembershipsTable.id),
    })
    .from(storeMembershipsTable)
    .where(
      and(
        eq(storeMembershipsTable.userId, userId),
        eq(storeMembershipsTable.status, "active"),
      ),
    );

  if ((totalStores ?? 0) >= 1) {
    const [subscription] = await db
      .select({
        status: subscriptionsTable.status,
        planSlug: plansTable.slug,
      })
      .from(subscriptionsTable)
      .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
      .where(eq(subscriptionsTable.userId, userId))
      .limit(1);
    if (!subscription || subscription.status !== "active") {
      res.status(402).json({
        error: "Upgrade required to add more stores",
        upgrade_required: true,
        reason: "additional_store_limit",
      });
      return;
    }
  }

  const slug = parsed.data.slug
    ? await nextUniqueStoreSlug(parsed.data.slug)
    : await nextUniqueStoreSlug(parsed.data.name);

  const [store] = await db
    .insert(storesTable)
    .values({
      slug,
      name: parsed.data.name,
      legalName: parsed.data.legalName ?? parsed.data.name,
      status: "active",
      planCode: "free",
      createdByUserId: userId,
    })
    .returning();

  await db.insert(storeMembershipsTable).values({
    storeId: store.id,
    userId,
    role: "owner",
    status: "active",
  });

  await db.insert(storeSettingsTable).values({
    storeId: store.id,
    primaryColor: parsed.data.settings?.primaryColor ?? "#111827",
    fontFamily: parsed.data.settings?.fontFamily ?? "Inter",
    logoUrl: parsed.data.settings?.logoUrl ?? null,
    faviconUrl: parsed.data.settings?.faviconUrl ?? null,
    navbarMenu: parsed.data.settings?.navbarMenu ?? [],
    footerLinks: parsed.data.settings?.footerLinks ?? [],
    socialLinks: parsed.data.settings?.socialLinks ?? {},
    landingTemplateId: parsed.data.settings?.landingTemplateId ?? null,
  });

  const [updatedUser] = await db
    .update(usersTable)
    .set({ activeStoreId: store.id, storeId: store.id, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning();

  res.status(201).json({ store, user: toAuthUserResponse(updatedUser) });
});

router.patch("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const storeId = req.params.id as string;
  const parsed = patchStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const access = await requireStoreRole(req.user!.id, storeId, ["owner", "admin"]);
  if (!access) {
    res.status(403).json({ error: "Store admin access required" });
    return;
  }
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.slug !== undefined) {
    updates.slug = await nextUniqueStoreSlug(parsed.data.slug);
  }
  if (parsed.data.legalName !== undefined) updates.legalName = parsed.data.legalName;
  const [store] = await db
    .update(storesTable)
    .set(updates)
    .where(eq(storesTable.id, storeId))
    .returning();
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }
  res.json({ store });
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const storeId = req.params.id as string;
  const access = await requireStoreRole(req.user!.id, storeId, ["owner", "admin"]);
  if (!access) {
    res.status(403).json({ error: "Store admin access required" });
    return;
  }
  const [store] = await db
    .update(storesTable)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(storesTable.id, storeId))
    .returning();
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }
  res.json({ success: true, store });
});

router.post("/:id/switch", authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.session?.impersonatorUserId) {
    res.status(403).json({ error: "Cannot switch stores while impersonating" });
    return;
  }
  const storeId = req.params.id as string;
  const [membership] = await db
    .select({ storeId: storeMembershipsTable.storeId })
    .from(storeMembershipsTable)
    .where(
      and(
        eq(storeMembershipsTable.userId, req.user!.id),
        eq(storeMembershipsTable.storeId, storeId),
        eq(storeMembershipsTable.status, "active"),
      ),
    )
    .limit(1);
  if (!membership) {
    res.status(403).json({ error: "Store membership required" });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ activeStoreId: storeId, storeId, updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id))
    .returning();
  res.json({ user: toAuthUserResponse(user) });
});

router.get("/:id/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
  const storeId = req.params.id as string;
  const access = await requireStoreRole(req.user!.id, storeId, ["owner", "admin", "manager"]);
  if (!access) {
    res.status(403).json({ error: "Store access denied" });
    return;
  }
  const [settings] = await db
    .select()
    .from(storeSettingsTable)
    .where(eq(storeSettingsTable.storeId, storeId))
    .limit(1);
  if (!settings) {
    const [created] = await db
      .insert(storeSettingsTable)
      .values({
        storeId,
        primaryColor: "#111827",
        fontFamily: "Inter",
        navbarMenu: [],
        footerLinks: [],
        socialLinks: {},
      })
      .returning();
    res.json({ settings: created });
    return;
  }
  res.json({ settings });
});

router.put("/:id/settings", authMiddleware, async (req: AuthRequest, res: Response) => {
  const storeId = req.params.id as string;
  const access = await requireStoreRole(req.user!.id, storeId, ["owner", "admin"]);
  if (!access) {
    res.status(403).json({ error: "Store admin access required" });
    return;
  }
  const parsed = storeSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const payload = parsed.data;
  const [existing] = await db
    .select({ storeId: storeSettingsTable.storeId })
    .from(storeSettingsTable)
    .where(eq(storeSettingsTable.storeId, storeId))
    .limit(1);
  const row = {
    storeId,
    logoUrl: payload.logoUrl ?? null,
    faviconUrl: payload.faviconUrl ?? null,
    primaryColor: payload.primaryColor,
    fontFamily: payload.fontFamily,
    navbarMenu: payload.navbarMenu,
    footerLinks: payload.footerLinks,
    socialLinks: payload.socialLinks,
    landingTemplateId: payload.landingTemplateId ?? null,
    updatedAt: new Date(),
  };
  if (existing) {
    const [updated] = await db
      .update(storeSettingsTable)
      .set(row)
      .where(eq(storeSettingsTable.storeId, storeId))
      .returning();
    res.json({ settings: updated });
    return;
  }
  const [created] = await db.insert(storeSettingsTable).values(row).returning();
  res.json({ settings: created });
});

router.get("/:slug/products", async (req, res: Response) => {
  const slug = String(req.params.slug ?? "").trim().toLowerCase();
  if (!slug) {
    res.status(400).json({ error: "Store slug is required" });
    return;
  }
  const ids = String(req.query.ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const [store] = await db
    .select({ id: storesTable.id })
    .from(storesTable)
    .where(and(eq(storesTable.slug, slug), eq(storesTable.status, "active")))
    .limit(1);
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }
  const products = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.storeId, store.id),
        eq(productsTable.isActive, true),
        eq(productsTable.status, "active"),
      ),
    );
  const filtered = ids.length > 0 ? products.filter((p) => ids.includes(p.id)) : products;
  const productIds = filtered.map((p) => p.id);
  const variants =
    productIds.length > 0
      ? await db
          .select()
          .from(productVariantsTable)
          .where(
            and(
              eq(productVariantsTable.storeId, store.id),
              inArray(productVariantsTable.productId, productIds),
              eq(productVariantsTable.isActive, true),
            ),
          )
      : [];
  const images =
    productIds.length > 0
      ? await db
          .select()
          .from(productImagesTable)
          .where(
            and(
              eq(productImagesTable.storeId, store.id),
              inArray(productImagesTable.productId, productIds),
            ),
          )
      : [];
  res.json({
    products: filtered.map((product) => ({
      ...product,
      variants: variants.filter((variant) => variant.productId === product.id),
      images: images.filter((image) => image.productId === product.id),
    })),
  });
});

router.get("/:slug", async (req, res: Response) => {
  const slug = String(req.params.slug ?? "").trim().toLowerCase();
  if (!slug) {
    res.status(400).json({ error: "Store slug is required" });
    return;
  }

  const [store] = await db
    .select({
      id: storesTable.id,
      slug: storesTable.slug,
      name: storesTable.name,
      legalName: storesTable.legalName,
      planCode: storesTable.planCode,
      status: storesTable.status,
      settings: storesTable.settings,
    })
    .from(storesTable)
    .where(and(eq(storesTable.slug, slug), eq(storesTable.status, "active")))
    .limit(1);

  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }

  const pages = await db
    .select({
      id: storefrontPagesTable.id,
      slug: storefrontPagesTable.slug,
      title: storefrontPagesTable.title,
      content: storefrontPagesTable.content,
      sections: storefrontPagesTable.sections,
      templatePresetId: storefrontPagesTable.templatePresetId,
      isPublished: storefrontPagesTable.isPublished,
      updatedAt: storefrontPagesTable.updatedAt,
    })
    .from(storefrontPagesTable)
    .where(
      and(
        eq(storefrontPagesTable.storeId, store.id),
        eq(storefrontPagesTable.isPublished, true),
      ),
    )
    .orderBy(asc(storefrontPagesTable.slug));

  const [settings] = await db
    .select()
    .from(storeSettingsTable)
    .where(eq(storeSettingsTable.storeId, store.id))
    .limit(1);

  res.json({ store, settings: settings ?? null, pages });
});

export default router;
