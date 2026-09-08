import { describe, expect, it } from "vitest";
import {
  SEARCH_RELEVANCE_SCHEMA_VERSION,
  buildSearchExplain,
  createSearchFacets,
  expandSearchTerms,
  scoreSearchCandidate,
  searchRelevanceContract,
} from "../search-relevance";

describe("search relevance v2", () => {
  it("publishes filters, signals, weights, explain mode, and migration notes", () => {
    expect(searchRelevanceContract.schemaVersion).toBe(SEARCH_RELEVANCE_SCHEMA_VERSION);
    expect(searchRelevanceContract.filters).toEqual(expect.arrayContaining(["saved filters", "facets", "synonyms", "redirects", "aliases", "stemming", "phrase ranking"]));
    expect(searchRelevanceContract.signals).toEqual(expect.arrayContaining(["stale-result", "draft-visibility", "review-status", "verification"]));
    expect(searchRelevanceContract.migrationNotes.length).toBeGreaterThan(0);
  });

  it("expands synonyms and stems query terms", () => {
    expect(expandSearchTerms("docs running")).toEqual(expect.arrayContaining(["docs", "documentation", "guide", "runn"]));
  });

  it("scores phrase, stale, draft, review, redirect, and verification signals", () => {
    const score = scoreSearchCandidate("Authentication Guide", {
      title: "Authentication Guide",
      slug: "auth-guide",
      excerpt: "An auth guide for admins.",
      content: "Authentication guide details.",
      status: "review",
      redirectTo: "login-guide",
      updatedAt: "2020-01-01T00:00:00.000Z",
      lastVerifiedAt: "2026-01-01T00:00:00.000Z",
      verificationExpiresAt: "2020-01-01T00:00:00.000Z",
    }, new Date("2026-05-25T00:00:00.000Z"));

    expect(score.signals.exactTitle).toBeGreaterThan(0);
    expect(score.signals.stalePenalty).toBeLessThan(0);
    expect(score.signals.reviewPenalty).toBeLessThan(0);
    expect(score.signals.verifiedBoost).toBeGreaterThan(0);
  });

  it("builds admin explain payloads", () => {
    const explain = buildSearchExplain("faq", { title: "FAQ", content: "Questions and help" });
    expect(explain.schemaVersion).toBe(SEARCH_RELEVANCE_SCHEMA_VERSION);
    expect(explain.score).toBeGreaterThan(0);
    expect(explain.signals.exactTitle).toBe(100);
  });

  it("creates category, tag, and status facets", () => {
    const facets = createSearchFacets([
      {
        category: { slug: "guides", name: "Guides" },
        tags: [{ tag: { slug: "admin", name: "Admin" } }],
        status: "published",
      },
      {
        category: { slug: "guides", name: "Guides" },
        tags: [{ tag: { slug: "admin", name: "Admin" } }],
        status: "review",
      },
    ]);

    expect(facets.categories).toContainEqual({ slug: "guides", name: "Guides", count: 2 });
    expect(facets.tags).toContainEqual({ slug: "admin", name: "Admin", count: 2 });
    expect(facets.statuses).toContainEqual({ status: "review", count: 1 });
  });
});
