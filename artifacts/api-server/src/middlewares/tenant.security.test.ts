import { beforeEach, describe, expect, it, vi } from "vitest";

const selectMock = vi.fn();
const fromMock = vi.fn();
const whereMock = vi.fn();
const limitMock = vi.fn();

vi.mock("@workspace/db", () => ({
  db: {
    select: selectMock,
  },
  storeDomainsTable: { storeId: "storeDomains.storeId", hostname: "storeDomains.hostname" },
  storeMembershipsTable: {
    storeId: "storeMemberships.storeId",
    userId: "storeMemberships.userId",
    role: "storeMemberships.role",
    status: "storeMemberships.status",
  },
  storesTable: { id: "stores.id", slug: "stores.slug" },
}));

vi.mock("drizzle-orm", () => ({
  eq: (left: unknown, right: unknown) => ({ type: "eq", left, right }),
  and: (...parts: unknown[]) => ({ type: "and", parts }),
}));

type Req = {
  headers: Record<string, string | undefined>;
  user?: {
    id: string;
    storeId?: string | null;
    activeStoreId?: string | null;
  };
  session?: {
    impersonatedStoreId?: string | null;
  };
  tenant?: {
    storeId: string;
    storeSlug: string;
    role: string;
  };
};

function createRes() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

describe("resolveTenantContext security", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    limitMock.mockReset();
    whereMock.mockReset();
    fromMock.mockReset();
    selectMock.mockReset();

    whereMock.mockReturnValue({ limit: limitMock });
    fromMock.mockImplementation(() => ({
      where: whereMock,
      innerJoin: () => ({ where: whereMock }),
    }));
    selectMock.mockReturnValue({ from: fromMock });
  });

  it("rejects host-based scope escape without membership", async () => {
    const { resolveTenantContext } = await import("./tenant.js");
    const req: Req = {
      headers: { host: "other-store.example.com" },
      user: { id: "user-1", activeStoreId: "store-a" },
    };
    const res = createRes();
    const next = vi.fn();

    limitMock
      .mockResolvedValueOnce([{ storeId: "store-b" }]) // host resolves to a different store
      .mockResolvedValueOnce([]); // user has no membership in resolved store

    await resolveTenantContext(req as never, res as never, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Store membership required" });
    expect(req.tenant).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  it("keeps impersonation tenant scope even when host resolves elsewhere", async () => {
    const { resolveTenantContext } = await import("./tenant.js");
    const req: Req = {
      headers: { host: "other-store.example.com" },
      user: { id: "user-1", activeStoreId: "store-a" },
      session: { impersonatedStoreId: "store-imp" },
    };
    const res = createRes();
    const next = vi.fn();

    limitMock.mockResolvedValueOnce([
      { storeId: "store-imp", role: "owner", storeSlug: "impersonated" },
    ]);

    await resolveTenantContext(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.tenant).toEqual({
      storeId: "store-imp",
      role: "owner",
      storeSlug: "impersonated",
    });
    // Host lookup is skipped in impersonation mode, so only membership lookup runs.
    expect(limitMock).toHaveBeenCalledTimes(1);
  });

  it("rejects when no active store is available", async () => {
    const { resolveTenantContext } = await import("./tenant.js");
    const req: Req = {
      headers: { host: undefined },
      user: { id: "user-1", activeStoreId: null, storeId: null },
    };
    const res = createRes();
    const next = vi.fn();

    await resolveTenantContext(req as never, res as never, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "No active store selected" });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets tenant only for an active membership", async () => {
    const { resolveTenantContext } = await import("./tenant.js");
    const req: Req = {
      headers: { host: undefined },
      user: { id: "user-1", activeStoreId: "store-a" },
    };
    const res = createRes();
    const next = vi.fn();

    limitMock.mockResolvedValueOnce([
      { storeId: "store-a", role: "owner", storeSlug: "alpha" },
    ]);

    await resolveTenantContext(req as never, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.tenant).toEqual({
      storeId: "store-a",
      role: "owner",
      storeSlug: "alpha",
    });
  });
});
