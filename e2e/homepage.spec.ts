import { expect, test } from "@playwright/test";

test.describe("focused core navigation", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "core navigation runs once on desktop");
  });

  test("home renders the wiki shell and Arkivel SVG mark", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "all pages" })).toBeVisible();

    const navigation = page.getByRole("complementary", { name: "Wiki navigation" });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Arkivel home" })).toBeVisible();

    const mark = navigation.locator('img[src*="arkivel-logo.svg"]');
    await expect(mark).toHaveCount(1);
    await expect(mark).toBeVisible();

    const asset = await page.request.get("/brand/arkivel-logo.svg");
    expect(asset.ok()).toBe(true);
    expect(await asset.text()).toContain("<title>Arkivel logo</title>");
  });

  test("search finds the seeded article", async ({ page }) => {
    await page.goto("/search");

    const query = page.locator("#search-page-query");
    await expect(query).toBeFocused();
    await query.fill("architecture decisions");
    await query.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=architecture(?:\+|%20)decisions$/);
    await expect(page.getByRole("link", { name: "architecture decisions", exact: true })).toBeVisible();
  });

  test("core index and guide routes render their primary heading", async ({ page }) => {
    const routes = [
      { heading: /^articles$/i, path: "/articles" },
      { heading: /categories/i, path: "/categories" },
      { heading: /tags/i, path: "/tags" },
      { heading: /recent changes/i, path: "/recent-changes" },
      { heading: /^help$/i, path: "/help" },
    ];

    for (const route of routes) {
      await test.step(route.path, async () => {
        const response = await page.goto(route.path);
        expect(response?.status()).toBeLessThan(400);
        await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
      });
    }
  });
});
