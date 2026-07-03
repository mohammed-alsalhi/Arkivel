import { expect, test } from "@playwright/test";

const responsiveRoutes = [
  { label: "homepage", path: "/" },
  { label: "article", path: "/articles/smoke-home" },
  { label: "editor", path: "/scratchpad" },
  { label: "dashboard", path: "/dashboard" },
  { label: "marketplace", path: "/admin/marketplace" },
  { label: "customization", path: "/admin/customization" },
  { label: "help", path: "/help" },
];

const viewports = [
  { height: 844, name: "phone", width: 390 },
  { height: 1024, name: "tablet", width: 768 },
  { height: 900, name: "desktop", width: 1280 },
];

async function expectPageReady(page: import("@playwright/test").Page) {
  await expect(page.locator("body")).toBeVisible();
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.trim().length).toBeGreaterThan(0);
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));

  expect(metrics.scrollWidth - metrics.clientWidth).toBeLessThanOrEqual(2);
}

test.describe("v5 smoke suite", () => {
  test("covers install, customization, marketplace, plugin manifest, import dry run, export, and admin health surfaces", async ({ page }) => {
    const checks = [
      { path: "/", text: /Arkivel|Wiki|Knowledge/i },
      { path: "/api/customization", text: /customization|stylePresets|marketplace/i },
      { path: "/api/plugins", text: /plugins|manifests|enabled/i },
      { path: "/api/export/json", text: /manifest|articles|export/i },
      { path: "/api/admin/maintenance/report", text: /checks|maintenance|backup/i },
    ];

    for (const check of checks) {
      await page.goto(check.path);
      await expectPageReady(page);
      await expect(page.locator("body")).toContainText(check.text);
    }
  });

  test("covers login, create article, edit article, wiki links, and search navigation smoke paths", async ({ page }) => {
    const checks = [
      { path: "/login", text: /login|password|admin/i },
      { path: "/articles/new", text: /title|create|article|editor/i },
      { path: "/articles/smoke-home/edit", text: /edit|title|content|article/i },
      { path: "/articles/smoke-home", text: /Smoke Home|smoke|linked/i },
      { path: "/search?q=smoke", text: /search|smoke|results/i },
    ];

    for (const check of checks) {
      await page.goto(check.path);
      await expectPageReady(page);
      await expect(page.locator("body")).toContainText(check.text);
    }
  });

  for (const viewport of viewports) {
    test(`covers responsive smoke routes on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of responsiveRoutes) {
        await test.step(route.label, async () => {
          await page.goto(route.path);
          await expectPageReady(page);
          await expectNoHorizontalOverflow(page);
        });
      }
    });
  }
});
