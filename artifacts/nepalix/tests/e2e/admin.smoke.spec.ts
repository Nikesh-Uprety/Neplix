import { expect, test, type Page } from "@playwright/test";

const authedUser = {
  id: "user-1",
  email: "owner@example.com",
  firstName: "Store",
  lastName: "Owner",
  role: "owner",
  storeId: "store-a",
  activeStoreId: "store-a",
  adminPageAccess: [
    "dashboard",
    "orders",
    "products",
    "customers",
    "inventory",
    "analytics",
    "marketing",
    "promo-codes",
    "notifications",
    "messages",
    "images",
    "buckets",
    "storefront-images",
    "landing-page",
    "store-users",
    "profile",
  ],
  canAccessAdmin: true,
  allowedAdminPages: [
    "dashboard",
    "orders",
    "products",
    "customers",
    "inventory",
    "analytics",
    "marketing",
    "promo-codes",
    "notifications",
    "messages",
    "images",
    "buckets",
    "storefront-images",
    "landing-page",
    "store-users",
    "profile",
  ],
  impersonation: null,
  createdAt: new Date().toISOString(),
};

const stores = [
  { id: "store-a", slug: "alpha", name: "Alpha Store", role: "owner", status: "active", isActive: true },
  { id: "store-b", slug: "beta", name: "Beta Store", role: "owner", status: "active", isActive: false },
];

const impersonatingUser = {
  ...authedUser,
  impersonation: {
    active: true,
    impersonatorUserId: "superadmin-1",
    storeId: "store-a",
    expiresAt: "2030-01-01T00:00:00.000Z",
  },
};

async function mockAuthenticatedAdminApis(page: Page) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: authedUser }) });
  });
  await page.route("**/api/auth/stores", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ stores }) });
  });
  await page.route("**/api/admin/analytics/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ orders: 5, revenue: 12000, customers: 4, products: 8 }),
    });
  });
  await page.route("**/api/admin/analytics/orders-trend?days=14", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        days: 14,
        series: [
          { day: "2026-04-20", orders: 1, revenue: 1000 },
          { day: "2026-04-21", orders: 2, revenue: 3000 },
        ],
      }),
    });
  });
}

test("authenticated user is routed to admin dashboard shell", async ({ page }) => {
  await mockAuthenticatedAdminApis(page);

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByText("Revenue Last 14 Days")).toBeVisible();
  await expect(page.getByText("Quick actions")).toBeVisible();
});

test("store switch guard keeps current store on forbidden response", async ({ page }) => {
  await mockAuthenticatedAdminApis(page);
  await page.route("**/api/auth/active-store", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({ error: "Cannot switch stores while impersonating" }),
    });
  });

  await page.goto("/admin/dashboard");

  const switcher = page.locator("select").first();
  await expect(switcher).toBeVisible();
  await expect(switcher).toHaveValue("store-a");

  await switcher.selectOption("store-b");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(switcher).toHaveValue("store-a");
});

test("impersonation banner allows returning to platform", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: impersonatingUser }),
    });
  });
  await page.route("**/api/auth/stores", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ stores }) });
  });
  await page.route("**/api/admin/analytics/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ orders: 5, revenue: 12000, customers: 4, products: 8 }),
    });
  });
  await page.route("**/api/admin/analytics/orders-trend?days=14", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        days: 14,
        series: [
          { day: "2026-04-20", orders: 1, revenue: 1000 },
          { day: "2026-04-21", orders: 2, revenue: 3000 },
        ],
      }),
    });
  });
  await page.route("**/api/auth/impersonation/stop", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: authedUser }),
    });
  });

  await page.goto("/admin/dashboard");

  await expect(page.getByText("Impersonating store admin session.")).toBeVisible();
  await page.getByRole("button", { name: "Return to platform" }).click();
  await expect(page.getByText("Impersonating store admin session.")).toHaveCount(0);
});
