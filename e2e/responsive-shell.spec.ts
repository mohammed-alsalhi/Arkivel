import { expect, test } from "@playwright/test";

const routes = ["/", "/search", "/articles", "/categories", "/features", "/help", "/dashboard", "/studio", "/atlas", "/trails", "/intelligence"];
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

async function mockPresentArticle(page: import("@playwright/test").Page) {
  await page.route(
    (url) => url.pathname === "/api/articles" && url.searchParams.get("slug") === "present-qa",
    async (route) => {
      await route.fulfill({
        json: {
          articles: [{ id: "present-qa-id", slug: "present-qa", title: "Present QA" }],
          total: 1,
          page: 1,
          limit: 20,
        },
      });
    }
  );

  await page.route("**/api/articles/present-qa-id/present", async (route) => {
    await route.fulfill({
      json: {
        title: "Present QA",
        slides: [
          {
            title: "A deliberately long presentation title that should wrap cleanly without colliding with controls",
            content: "<p>This intro slide has enough text to exercise wrapping. It should stay inside the slide stage instead of hiding behind the header or footer.</p>",
          },
          {
            title: "Dense slide",
            content: "<p>Long presentation content should scroll inside the reserved stage.</p><ul><li>First substantial point with a long phrase that needs wrapping on phone.</li><li>Second substantial point with more words.</li><li>Third substantial point with more words.</li><li>Fourth substantial point with more words.</li><li>Fifth substantial point with more words.</li><li>Sixth substantial point with more words.</li><li>Seventh substantial point with more words.</li><li>Eighth substantial point with more words.</li><li>Ninth substantial point with more words.</li></ul><table><thead><tr><th>Layer</th><th>Status</th><th>Notes</th></tr></thead><tbody><tr><td>Article table</td><td>Merged borders</td><td>Cells should collapse into one continuous grid.</td></tr><tr><td>Presentation table</td><td>Contained</td><td>Long cell content wraps instead of forcing horizontal overflow.</td></tr></tbody></table><pre><code>const veryLongIdentifierThatShouldNotForcePageOverflow = true;</code></pre>",
          },
          {
            title: "Closing",
            content: "<blockquote><p>Presentation chrome should never cover readable content.</p></blockquote>",
          },
        ],
      },
    });
  });
}

async function expectPresentChromeSeparated(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width, height: r.height };
    };

    const topbar = rect(".present-topbar");
    const stage = rect(".present-stage");
    const controls = rect(".present-controls");
    const controlsNode = document.querySelector(".present-controls");
    const controlsCenterNode = controls
      ? document.elementFromPoint(controls.left + controls.width / 2, controls.top + controls.height / 2)
      : null;

    return {
      stageAfterTopbar: Boolean(stage && topbar && stage.top >= topbar.bottom - 1),
      stageBeforeControls: Boolean(stage && controls && stage.bottom <= controls.top + 1),
      controlsOwnCenter: Boolean(controlsNode && controlsCenterNode && controlsNode.contains(controlsCenterNode)),
    };
  });

  expect(metrics.stageAfterTopbar).toBe(true);
  expect(metrics.stageBeforeControls).toBe(true);
  expect(metrics.controlsOwnCenter).toBe(true);
}

async function expectPresentationTablesCollapsed(page: import("@playwright/test").Page) {
  const tableMetrics = await page.locator(".presentation-content table").evaluate((table) => {
    const styles = window.getComputedStyle(table);
    const rect = table.getBoundingClientRect();
    const stage = document.querySelector(".present-stage")?.getBoundingClientRect();

    return {
      borderCollapse: styles.borderCollapse,
      display: styles.display,
      insideStage: Boolean(stage && rect.left >= stage.left - 1 && rect.right <= stage.right + 1),
    };
  });

  expect(tableMetrics.borderCollapse).toBe("collapse");
  expect(tableMetrics.display).toBe("table");
  expect(tableMetrics.insideStage).toBe(true);
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
    await page.getByRole("button", { name: "Open search" }).click();
    await expect(page.getByPlaceholder("Search articles")).toBeFocused();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+K");

    await expect(page.locator(".command-palette")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("keeps brand and compact search usable on phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.locator(".wiki-top-brand-mark")).toBeVisible();
    await expect(page.getByRole("button", { name: "Toggle main menu" })).toBeVisible();
    await expect(page.locator(".wiki-mobile-nav")).not.toContainText("Browse");

    await page.getByRole("button", { name: "Open search" }).click();
    await expect(page.getByPlaceholder("Search articles")).toBeFocused();
    await expectNoHorizontalOverflow(page);
  });

  test("renders the intelligence cockpit without viewport overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/intelligence");

    await expect(page.locator(".intelligence-cockpit")).toBeVisible();
    await expect(page.locator(".intelligence-radar-panel")).toBeVisible();
    await expect(page.locator(".intelligence-simulator-panel")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("renders the canon atlas without viewport overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/atlas");

    await expect(page.locator(".atlas-map-panel")).toBeVisible();
    await expect(page.locator(".atlas-dossier-panel")).toBeVisible();
    await expect(page.locator(".atlas-continuity-panel")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("renders canon trails without viewport overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/trails");

    await expect(page.locator(".trails-reader-panel")).toBeVisible();
    await expect(page.locator(".trails-command-panel")).toBeVisible();
    await expect(page.locator(".trails-card").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("renders the simplified editor with feature trays without viewport overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/scratchpad");

    await expect(page.getByTestId("editor-shell")).toBeVisible();
    await expect(page.getByTestId("editor-toolbar")).toBeVisible();
    const desktopTabs = page.getByTestId("editor-feature-tabs");
    await desktopTabs.getByRole("button", { name: /Insert/ }).click();
    await expect(page.getByTestId("editor-insert-tray")).toBeVisible();
    await desktopTabs.getByRole("button", { name: /Review/ }).click();
    await expect(page.getByTestId("editor-review-tray")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.getByTestId("editor-shell")).toBeVisible();
    await expect(page.getByTestId("editor-toolbar")).toBeVisible();
    await page.getByTestId("editor-feature-tabs").getByRole("button", { name: /Outline/ }).click();
    await expect(page.getByTestId("editor-outline-tray")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("renders presentation mode without overlapping chrome", async ({ page }) => {
    await mockPresentArticle(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/present/present-qa");
    await expect(page.locator(".present-shell")).toBeVisible();
    await expect(page.locator(".present-slide")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectPresentChromeSeparated(page);

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.locator(".presentation-content table")).toBeVisible();
    await expectPresentationTablesCollapsed(page);
    await expectNoHorizontalOverflow(page);

    await page.getByRole("button", { name: "Overview (G)" }).click();
    await expect(page.locator(".present-overview-grid")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 1728, height: 1000 });
    await page.goto("/present/present-qa");
    await expect(page.locator(".present-shell")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectPresentChromeSeparated(page);
  });
});
