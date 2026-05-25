export const SEARCH_API_SCHEMA_VERSION = "arkivel.search-api.v1";

export type SearchEntityKind = "article" | "category" | "tag" | "discussion" | "revision" | "marketplace-item";

export type SearchApiResultBase = {
  id: string;
  kind: SearchEntityKind;
  title: string;
  url: string;
  excerpt?: string | null;
  score?: number;
  highlights?: string[];
};

export type ArticleSearchResult = SearchApiResultBase & {
  kind: "article";
  slug: string;
  status: string;
  category?: string | null;
  tags: string[];
};

export type CategorySearchResult = SearchApiResultBase & {
  kind: "category";
  slug: string;
  articleCount?: number;
};

export type TagSearchResult = SearchApiResultBase & {
  kind: "tag";
  slug: string;
  articleCount?: number;
};

export type DiscussionSearchResult = SearchApiResultBase & {
  kind: "discussion";
  articleSlug: string;
  visibility: string;
};

export type RevisionSearchResult = SearchApiResultBase & {
  kind: "revision";
  articleSlug: string;
  createdAt: string;
};

export type MarketplaceSearchResult = SearchApiResultBase & {
  kind: "marketplace-item";
  itemKind: string;
  status: string;
  version: string;
};

export type StableSearchResult =
  | ArticleSearchResult
  | CategorySearchResult
  | TagSearchResult
  | DiscussionSearchResult
  | RevisionSearchResult
  | MarketplaceSearchResult;

export const searchApiContract = {
  schemaVersion: SEARCH_API_SCHEMA_VERSION,
  audiences: ["plugins", "widgets", "dashboards", "external tools", "mobile clients"],
  resultKinds: ["article", "category", "tag", "discussion", "revision", "marketplace-item"] satisfies SearchEntityKind[],
  endpoints: {
    internal: "/api/search",
    contract: "/api/search/contract",
    customizationManifest: "/api/customization searchApi",
  },
  privacy: {
    queryAnalytics: {
      defaultRetentionDays: 90,
      anonymizeIp: true,
      storeRawQuery: true,
      allowOptOut: "future user preference",
    },
    redactedFieldsForPublicClients: ["email", "ipAddress", "userId", "privateNotes", "draftContent"],
  },
  webhooks: {
    plannedEvents: ["saved_search.hit", "content.important_change"],
    payloadFields: ["event", "query", "resultKind", "resultId", "workspaceId", "createdAt"],
  },
};

export function normalizeStableSearchResult(result: StableSearchResult): StableSearchResult {
  return {
    ...result,
    excerpt: result.excerpt ?? null,
    highlights: result.highlights ?? [],
    score: result.score ?? 0,
  };
}

export function redactSearchResultForPublicClient(result: StableSearchResult): StableSearchResult {
  const redacted = normalizeStableSearchResult(result);
  if (redacted.kind === "discussion" && redacted.visibility !== "public") {
    return { ...redacted, excerpt: null, highlights: [] };
  }
  return redacted;
}
