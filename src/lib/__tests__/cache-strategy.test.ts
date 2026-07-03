import { describe, expect, it } from "vitest";
import { getCacheInvalidationPlan, invalidateCacheForEvent } from "../cache-strategy";

describe("cache strategy", () => {
  it("defines invalidation rules for article, category, and tag writes", () => {
    expect(getCacheInvalidationPlan("article.write")?.surfaces).toEqual(expect.arrayContaining(["articles", "feeds", "sitemap", "search"]));
    expect(getCacheInvalidationPlan("category.write")?.surfaces).toContain("customization");
    expect(getCacheInvalidationPlan("tag.write")?.keys).toEqual(expect.arrayContaining(["tags:*", "search:*"]));
  });

  it("returns an empty plan for unknown events", async () => {
    expect(getCacheInvalidationPlan("unknown.event")).toBeNull();
    await expect(invalidateCacheForEvent("unknown.event")).resolves.toEqual({
      event: "unknown.event",
      invalidatedKeys: [],
      revalidatePaths: [],
      surfaces: [],
    });
  });

  it("reports invalidated keys and revalidate paths for known events", async () => {
    const result = await invalidateCacheForEvent("tag.write");
    expect(result.invalidatedKeys).toEqual(expect.arrayContaining(["tags:*", "articles:*"]));
    expect(result.revalidatePaths).toContain("/tags");
    expect(result.surfaces).toContain("sitemap");
  });
});
