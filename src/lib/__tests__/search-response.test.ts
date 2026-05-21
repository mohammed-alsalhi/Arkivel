import { describe, expect, it } from "vitest";
import {
  getSearchResults,
  getSearchSuggestions,
  getSemanticSearchResults,
} from "../search-response";

const article = {
  id: "a1",
  title: "Known Article",
  slug: "known-article",
  excerpt: "A result",
};

const semanticArticle = {
  id: "a2",
  title: "Related Article",
  slug: "related-article",
  excerpt: "A semantic result",
};

describe("search response helpers", () => {
  it("accepts the legacy array response shape", () => {
    expect(getSearchResults([article])).toEqual([article]);
  });

  it("accepts the current /api/search object response shape", () => {
    expect(getSearchResults({ results: [article] })).toEqual([article]);
  });

  it("accepts the /api/v2/search data response shape", () => {
    expect(getSearchResults({ data: [article] })).toEqual([article]);
  });

  it("can include semantic matches without duplicating slugs", () => {
    expect(
      getSearchResults({
        results: [article],
        semanticResults: [semanticArticle, article],
      }, { includeSemantic: true })
    ).toEqual([article, semanticArticle]);
  });

  it("extracts semantic matches and suggestions separately", () => {
    const payload = {
      results: [article],
      semanticResults: [semanticArticle],
      suggestions: ["Known Articles"],
    };

    expect(getSemanticSearchResults(payload)).toEqual([semanticArticle]);
    expect(getSearchSuggestions(payload)).toEqual(["Known Articles"]);
  });

  it("ignores malformed payloads", () => {
    expect(getSearchResults({ results: [{ title: "Missing identifiers" }] })).toEqual([]);
    expect(getSearchSuggestions({ suggestions: [null, "usable"] })).toEqual(["usable"]);
  });
});
