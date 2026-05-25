import { describe, expect, it } from "vitest";
import {
  SEARCH_API_SCHEMA_VERSION,
  normalizeStableSearchResult,
  redactSearchResultForPublicClient,
  searchApiContract,
  type StableSearchResult,
} from "../search-api";

describe("search API contract", () => {
  it("publishes stable audiences, result kinds, endpoints, privacy, and webhook metadata", () => {
    expect(searchApiContract.schemaVersion).toBe(SEARCH_API_SCHEMA_VERSION);
    expect(searchApiContract.audiences).toEqual(expect.arrayContaining(["plugins", "widgets", "mobile clients"]));
    expect(searchApiContract.resultKinds).toEqual(expect.arrayContaining(["article", "category", "tag", "discussion", "revision", "marketplace-item"]));
    expect(searchApiContract.privacy.queryAnalytics.defaultRetentionDays).toBeGreaterThan(0);
    expect(searchApiContract.webhooks.plannedEvents).toContain("saved_search.hit");
  });

  it("normalizes additive result fields", () => {
    const result = normalizeStableSearchResult({
      id: "a1",
      kind: "article",
      title: "Article",
      url: "/articles/article",
      slug: "article",
      status: "published",
      tags: [],
    });

    expect(result.score).toBe(0);
    expect(result.excerpt).toBeNull();
    expect(result.highlights).toEqual([]);
  });

  it("redacts non-public discussion excerpts for public clients", () => {
    const result: StableSearchResult = {
      id: "d1",
      kind: "discussion",
      title: "Reviewer note",
      url: "/articles/a/discussion",
      articleSlug: "a",
      visibility: "reviewers",
      excerpt: "private",
      highlights: ["private"],
    };

    expect(redactSearchResultForPublicClient(result)).toMatchObject({
      excerpt: null,
      highlights: [],
    });
  });
});
