import { expect, test } from "@playwright/test";

test("new user completes onboarding and is redirected to billing", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "user-onboard",
          email: "new@example.com",
          firstName: "New",
          lastName: "User",
          role: "owner",
          storeId: "store-1",
          activeStoreId: "store-1",
          adminPageAccess: ["dashboard", "landing-page", "products"],
          canAccessAdmin: true,
          allowedAdminPages: ["dashboard", "landing-page", "products"],
          onboardingCompletedAt: null,
          impersonation: null,
          createdAt: new Date().toISOString(),
        },
      }),
    });
  });

  await page.route("**/api/auth/onboarding/complete", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "user-onboard",
          email: "new@example.com",
          firstName: "New",
          lastName: "User",
          role: "owner",
          storeId: "store-1",
          activeStoreId: "store-1",
          adminPageAccess: ["dashboard", "landing-page", "products"],
          canAccessAdmin: true,
          allowedAdminPages: ["dashboard", "landing-page", "products"],
          onboardingCompletedAt: new Date().toISOString(),
          impersonation: null,
          createdAt: new Date().toISOString(),
        },
        store: { id: "store-1", slug: "demo-store", name: "Demo Store" },
        page: { id: "home-1", slug: "home", isPublished: true },
        generatedProductId: "prod-1",
      }),
    });
  });

  await page.goto("/onboarding");
  await page.getByPlaceholder("Nikesh Cafe").fill("Demo Store");
  await page.getByPlaceholder("Kathmandu, Nepal").fill("Kathmandu");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByPlaceholder("Iced Caramel Latte").fill("Demo Product");
  await page.getByPlaceholder("https://...").first().fill("https://example.com/product.png");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Publish & Go Live" }).click();

  await expect(page).toHaveURL(/\/billing\?from=onboarding$/);
});

