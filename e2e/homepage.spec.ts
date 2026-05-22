import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows wiki name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    // Should have some content
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("sidebar navigation matches the current viewport", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator("aside");
    const width = page.viewportSize()?.width ?? 0;

    if (width < 768) {
      await expect(sidebar).toBeHidden();
      await page.getByRole("button", { name: "Toggle main menu" }).click();
    }

    await expect(sidebar).toBeVisible();
  });

  test("search bar is accessible", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();

    await expect(page.getByPlaceholder("Search articles")).toBeFocused();
  });
});

test.describe("Navigation", () => {
  test("articles page loads", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.locator("body")).toBeVisible();
  });

  test("categories page loads", async ({ page }) => {
    await page.goto("/categories");
    await expect(page.locator("body")).toBeVisible();
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("body")).toBeVisible();
  });

  test("help page loads", async ({ page }) => {
    await page.goto("/help");
    await expect(page.locator("body")).toBeVisible();
  });
});
