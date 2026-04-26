import { expect, test } from "@playwright/test";

test("homepage shell renders and primary nav is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Nepalix/i);
  await expect(page.getByRole("link", { name: /pricing/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /book demo/i })).toBeVisible();
});
