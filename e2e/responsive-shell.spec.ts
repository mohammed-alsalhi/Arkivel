import { expect, test } from "@playwright/test";

const routes = ["/", "/search", "/articles", "/help"];
const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 900 },
  { name: "wide", width: 1728, height: 1000 },
];

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  expect(
    Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) - metrics.clientWidth
  ).toBeLessThanOrEqual(2);
}

test.describe("Responsive shell", () => {
  for (const viewport of viewports) {
    test(`keeps core routes inside the viewport on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator("body")).toBeVisible();
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("opens the command palette without viewport overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
    });

    await expect(page.locator(".command-palette")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
