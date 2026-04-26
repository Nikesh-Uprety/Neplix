import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbSelectMock = vi.fn();
const dbInsertMock = vi.fn();
const dbUpdateMock = vi.fn();

vi.mock("@workspace/db", () => ({
  db: {
    select: dbSelectMock,
    insert: dbInsertMock,
    update: dbUpdateMock,
  },
  productsTable: { id: "products.id", storeId: "products.storeId", createdAt: "products.createdAt" },
  ordersTable: { id: "orders.id", storeId: "orders.storeId", createdAt: "orders.createdAt" },
  customersTable: { id: "customers.id", storeId: "customers.storeId", createdAt: "customers.createdAt" },
  productVariantsTable: { productId: "productVariants.productId", storeId: "productVariants.storeId" },
  productImagesTable: { productId: "productImages.productId", storeId: "productImages.storeId" },
  storesTable: {
    id: "stores.id",
    slug: "stores.slug",
    status: "stores.status",
    name: "stores.name",
    legalName: "stores.legalName",
    planCode: "stores.planCode",
    settings: "stores.settings",
    createdByUserId: "stores.createdByUserId",
  },
  storeMembershipsTable: {
    id: "memberships.id",
    userId: "memberships.userId",
    storeId: "memberships.storeId",
    role: "memberships.role",
    status: "memberships.status",
  },
  storeSettingsTable: {
    storeId: "settings.storeId",
    primaryColor: "settings.primaryColor",
    fontFamily: "settings.fontFamily",
    logoUrl: "settings.logoUrl",
    faviconUrl: "settings.faviconUrl",
    navbarMenu: "settings.navbarMenu",
    footerLinks: "settings.footerLinks",
    socialLinks: "settings.socialLinks",
    landingTemplateId: "settings.landingTemplateId",
  },
  storefrontPagesTable: {
    id: "pages.id",
    storeId: "pages.storeId",
    slug: "pages.slug",
    title: "pages.title",
    content: "pages.content",
    sections: "pages.sections",
    templatePresetId: "pages.templatePresetId",
    isPublished: "pages.isPublished",
    updatedAt: "pages.updatedAt",
  },
  mediaAssetsTable: {
    id: "media.id",
    storeId: "media.storeId",
    createdAt: "media.createdAt",
  },
  mediaBucketsTable: { id: "buckets.id", storeId: "buckets.storeId" },
  subscriptionsTable: { status: "subscriptions.status", userId: "subscriptions.userId", planId: "subscriptions.planId" },
  plansTable: { slug: "plans.slug", id: "plans.id" },
  usersTable: { id: "users.id", storeId: "users.storeId", updatedAt: "users.updatedAt" },
}));

vi.mock("drizzle-orm", () => ({
  eq: (left: unknown, right: unknown) => ({ type: "eq", left, right }),
  and: (...parts: unknown[]) => ({ type: "and", parts }),
  or: (...parts: unknown[]) => ({ type: "or", parts }),
  ilike: (left: unknown, right: unknown) => ({ type: "ilike", left, right }),
  inArray: (left: unknown, right: unknown[]) => ({ type: "inArray", left, right }),
  desc: (value: unknown) => ({ type: "desc", value }),
  asc: (value: unknown) => ({ type: "asc", value }),
  count: () => ({ type: "count" }),
  sql: (() => "sql") as unknown,
}));

vi.mock("../middlewares/auth.js", () => ({
  authMiddleware: (req: { user?: unknown }, _res: unknown, next: () => void) => {
    req.user = {
      id: "user-1",
      role: "owner",
      adminPageAccess: [],
      activeStoreId: "store-a",
      storeId: "store-a",
    };
    next();
  },
}));

vi.mock("../middlewares/tenant.js", () => ({
  resolveTenantContext: (
    req: { tenant?: { storeId: string; storeSlug: string; role: string } },
    _res: unknown,
    next: () => void,
  ) => {
    req.tenant = { storeId: "store-a", storeSlug: "alpha", role: "owner" };
    next();
  },
}));

vi.mock("../middlewares/admin.js", () => ({
  requireAdminPage: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../lib/usage.js", () => ({
  incrementStoreUsage: vi.fn(),
}));

vi.mock("../lib/media-upload.js", () => ({
  uploadMediaAsset: vi.fn(async () => ({ provider: "local", url: "https://cdn.local/hero.png" })),
}));

vi.mock("./auth.js", () => ({
  toAuthUserResponse: (user: unknown) => user,
}));

function hasEq(
  node: unknown,
  left: string,
  right: string,
): boolean {
  if (!node || typeof node !== "object") return false;
  const cast = node as { type?: string; left?: unknown; right?: unknown; parts?: unknown[] };
  if (cast.type === "eq" && cast.left === left && cast.right === right) return true;
  if (Array.isArray(cast.parts)) return cast.parts.some((part) => hasEq(part, left, right));
  return false;
}

function makeSelectChain(result: unknown) {
  const chain: Record<string, unknown> = {
    from: vi.fn(() => chain),
    where: vi.fn(() => chain),
    limit: vi.fn(async () => result),
    offset: vi.fn(() => chain),
    orderBy: vi.fn(() => chain),
    leftJoin: vi.fn(() => chain),
    innerJoin: vi.fn(() => chain),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

function makeUpdateChain(result: unknown) {
  const returningChain = {
    returning: vi.fn(async () => result),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return {
    set: vi.fn(() => ({
      where: vi.fn(() => returningChain),
    })),
  };
}

function makeInsertChain(result: unknown) {
  const valuesChain = {
    returning: vi.fn(async () => result),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return {
    values: vi.fn(() => valuesChain),
  };
}

describe("multi-tenant adversarial and smoke flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces cross-store read isolation on products/orders/customers", async () => {
    const productChain = makeSelectChain([]);
    const orderChain = makeSelectChain([]);
    const customerChain = makeSelectChain([]);
    dbSelectMock
      .mockReturnValueOnce(productChain)
      .mockReturnValueOnce(orderChain)
      .mockReturnValueOnce(customerChain);

    const [{ default: productsRouter }, { default: ordersRouter }, { default: customersRouter }] =
      await Promise.all([
        import("./admin-products.js"),
        import("./admin-orders.js"),
        import("./admin-customers.js"),
      ]);

    const app = express();
    app.use(express.json());
    app.use("/api/admin/products", productsRouter);
    app.use("/api/admin/orders", ordersRouter);
    app.use("/api/admin/customers", customersRouter);

    const [productRes, orderRes, customerRes] = await Promise.all([
      request(app).get("/api/admin/products/product-b"),
      request(app).get("/api/admin/orders/order-b"),
      request(app).get("/api/admin/customers/customer-b"),
    ]);

    expect(productRes.status).toBe(404);
    expect(orderRes.status).toBe(404);
    expect(customerRes.status).toBe(404);

    const productWhere = (productChain.where as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    const orderWhere = (orderChain.where as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    const customerWhere = (customerChain.where as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(hasEq(productWhere, "products.storeId", "store-a")).toBe(true);
    expect(hasEq(orderWhere, "orders.storeId", "store-a")).toBe(true);
    expect(hasEq(customerWhere, "customers.storeId", "store-a")).toBe(true);
  });

  it("blocks store switch without membership (scope-escape attempt)", async () => {
    const membershipLookup = makeSelectChain([]);
    dbSelectMock.mockReturnValueOnce(membershipLookup);

    const { default: storesRouter } = await import("./stores.js");
    const app = express();
    app.use(express.json());
    app.use("/api/stores", storesRouter);

    const res = await request(app).post("/api/stores/store-b/switch").send({});

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Store membership required" });
  });

  it("prevents billing bypass on additional store creation", async () => {
    const countChain = makeSelectChain([{ totalStores: 1 }]);
    const subscriptionChain = makeSelectChain([]);
    dbSelectMock.mockReturnValueOnce(countChain).mockReturnValueOnce(subscriptionChain);

    const { default: storesRouter } = await import("./stores.js");
    const app = express();
    app.use(express.json());
    app.use("/api/stores", storesRouter);

    const res = await request(app).post("/api/stores").send({ name: "Second Store" });

    expect(res.status).toBe(402);
    expect(res.body).toMatchObject({
      upgrade_required: true,
      reason: "additional_store_limit",
    });
  });

  it("smokes onboarding to publish to storefront load path", async () => {
    dbSelectMock
      .mockReturnValueOnce(makeSelectChain([{ totalStores: 0 }])) // create store: membership count
      .mockReturnValueOnce(makeSelectChain([])) // slug available
      .mockReturnValueOnce(makeSelectChain([{ id: "store-1", slug: "alpha", status: "active" }])) // storefront lookup
      .mockReturnValueOnce(
        makeSelectChain([
          { id: "page-1", storeId: "store-1", slug: "home", title: "Home", isPublished: true },
        ]),
      ) // published pages
      .mockReturnValueOnce(makeSelectChain([{ storeId: "store-1", primaryColor: "#111827" }])); // settings

    dbInsertMock
      .mockReturnValueOnce(
        makeInsertChain([{ id: "store-1", slug: "alpha", name: "Alpha", status: "active" }]),
      ) // stores insert
      .mockReturnValueOnce(makeInsertChain([{}])) // membership insert
      .mockReturnValueOnce(makeInsertChain([{}])) // settings insert
      .mockReturnValueOnce(makeInsertChain([{ id: "asset-1", storeId: "store-a" }])) // media insert
      .mockReturnValueOnce(
        makeInsertChain([
          { id: "page-1", storeId: "store-a", slug: "home", title: "Home", isPublished: false },
        ]),
      ); // page insert

    dbUpdateMock
      .mockReturnValueOnce(makeUpdateChain([{ id: "user-1", activeStoreId: "store-1", storeId: "store-1" }])) // user update
      .mockReturnValueOnce(
        makeUpdateChain([{ id: "page-1", storeId: "store-a", slug: "home", isPublished: true }]),
      ); // page publish

    const [{ default: storesRouter }, { default: mediaRouter }, { default: landingRouter }] =
      await Promise.all([
        import("./stores.js"),
        import("./admin-media.js"),
        import("./admin-landing.js"),
      ]);

    const app = express();
    app.use(express.json({ limit: "2mb" }));
    app.use("/api/stores", storesRouter);
    app.use("/api/admin/media", mediaRouter);
    app.use("/api/admin/landing", landingRouter);

    const onboarding = await request(app).post("/api/stores").send({ name: "Alpha" });
    expect(onboarding.status).toBe(201);
    expect(onboarding.body.store.slug).toBe("alpha");

    const upload = await request(app).post("/api/admin/media/upload").send({
      fileName: "hero.png",
      contentType: "image/png",
      dataBase64: Buffer.from("fake-image").toString("base64"),
      isStorefront: true,
    });
    expect(upload.status).toBe(201);
    expect(upload.body.url).toContain("hero.png");

    const createPage = await request(app).post("/api/admin/landing/pages").send({
      slug: "home",
      title: "Home",
      sections: [],
      isPublished: false,
    });
    expect(createPage.status).toBe(201);

    const publishPage = await request(app).patch("/api/admin/landing/pages/page-1").send({
      isPublished: true,
    });
    expect(publishPage.status).toBe(200);
    expect(publishPage.body.page.isPublished).toBe(true);

    const storefront = await request(app).get("/api/stores/alpha");
    expect(storefront.status).toBe(200);
    expect(storefront.body.store.slug).toBe("alpha");
    expect(Array.isArray(storefront.body.pages)).toBe(true);
  });
});
