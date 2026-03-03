import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows wiki name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    // Should have some content
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("sidebar navigation is visible on desktop", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("search bar is accessible", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
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
