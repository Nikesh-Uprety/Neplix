import { describe, expect, it } from "vitest";
import { vi } from "vitest";

vi.mock("@workspace/db", () => ({
  db: {},
  storeDomainsTable: {},
  storeMembershipsTable: {},
  storesTable: {},
}));

import { activeStoreId } from "./tenant.js";

describe("tenant active store resolution", () => {
  it("prefers impersonation store scope over user active store", () => {
    const storeId = activeStoreId({
      session: {
        impersonatedStoreId: "store-impersonated",
      },
      user: {
        activeStoreId: "store-user-active",
        storeId: "store-user-default",
      },
    } as any);

    expect(storeId).toBe("store-impersonated");
  });
});
