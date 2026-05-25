import { describe, expect, it } from "vitest";
import {
  cacheRecipes,
  cacheStrategyContract,
  getCacheInvalidationPlan,
  staleCacheWarning,
} from "../cache-strategy";

describe("cache strategy", () => {
  it("defines invalidation rules for article, category, and tag writes", () => {
    expect(getCacheInvalidationPlan("article.write")?.surfaces).toEqual(expect.arrayContaining(["articles", "feeds", "sitemap", "search"]));
    expect(getCacheInvalidationPlan("category.write")?.surfaces).toContain("customization");
    expect(getCacheInvalidationPlan("tag.write")?.keys).toEqual(expect.arrayContaining(["tags:*", "search:*"]));
  });

  it("publishes admin contract and deployment recipes", () => {
    expect(cacheStrategyContract.adminRoute).toBe("/admin/cache");
    expect(cacheStrategyContract.staleWarningSurfaces).toEqual(["editors", "admins"]);
    expect(cacheRecipes.map((recipe) => recipe.id)).toEqual(expect.arrayContaining(["cdn", "vercel", "docker", "reverse-proxy"]));
  });

  it("creates stale warnings for editors and admins", () => {
    expect(staleCacheWarning("editor", "2026-05-25T12:00:00.000Z").message).toContain("2026-05-25");
    expect(staleCacheWarning("admin", null).surface).toBe("admin");
  });
});
