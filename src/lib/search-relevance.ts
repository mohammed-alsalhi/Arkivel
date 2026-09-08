export const SEARCH_RELEVANCE_SCHEMA_VERSION = "arkivel.search-relevance.v2";

export const SEARCH_RELEVANCE_WEIGHTS = {
  exactTitle: 100,
  titleStartsWith: 80,
  titleContains: 60,
  phraseInExcerpt: 35,
  phraseInContent: 25,
  wordCoverage: 20,
  aliasMatch: 45,
  redirectMatch: 40,
  verifiedBoost: 8,
  stalePenalty: -12,
  draftPenalty: -30,
  reviewPenalty: -10,
  verificationExpiredPenalty: -8,
} as const;

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  docs: ["documentation", "guide"],
  faq: ["questions", "help"],
  auth: ["authentication", "login"],
  admin: ["administrator", "settings"],
};

export const searchRelevanceContract = {
  schemaVersion: SEARCH_RELEVANCE_SCHEMA_VERSION,
  facets: ["category", "tags", "status", "author", "workspace", "updatedAt", "verification", "review"],
  filters: ["saved filters", "facets", "synonyms", "redirects", "aliases", "stemming", "phrase ranking"],
  signals: ["stale-result", "draft-visibility", "review-status", "verification"],
  weights: SEARCH_RELEVANCE_WEIGHTS,
  explainMode: "admins can pass explain=1 to /api/search",
  migrationNotes: [
    "Search results may include score and searchExplain when explain=1 is requested by an admin.",
    "Ranking now combines phrase, alias, redirect, freshness, review, and verification signals with title matching.",
  ],
};

export type SearchCandidate = {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  status?: string | null;
  redirectTo?: string | null;
  aliases?: string[];
  updatedAt?: Date | string | null;
  reviewDueAt?: Date | string | null;
  lastVerifiedAt?: Date | string | null;
  verificationExpiresAt?: Date | string | null;
};

export type SearchScore = {
  score: number;
  matchedTerms: string[];
  signals: Record<string, number>;
};

export function expandSearchTerms(query: string) {
  const base = tokenize(query);
  const expanded = new Set(base);
  for (const term of base) {
    expanded.add(stemSearchTerm(term));
    for (const synonym of SEARCH_SYNONYMS[term] ?? []) expanded.add(synonym);
  }
  return [...expanded].filter(Boolean);
}

export function stemSearchTerm(term: string) {
  return term
    .toLowerCase()
    .replace(/ies$/, "y")
    .replace(/ing$/, "")
    .replace(/ed$/, "")
    .replace(/s$/, "");
}

export function scoreSearchCandidate(query: string, candidate: SearchCandidate, now: Date = new Date()): SearchScore {
  const queryLower = query.trim().toLowerCase();
  const terms = expandSearchTerms(query);
  const title = candidate.title.toLowerCase();
  const slug = candidate.slug?.toLowerCase() ?? "";
  const excerpt = candidate.excerpt?.toLowerCase() ?? "";
  const content = stripHtml(candidate.content ?? "").toLowerCase();
  const aliases = candidate.aliases ?? [];
  const signals: Record<string, number> = {};

  if (title === queryLower) signals.exactTitle = SEARCH_RELEVANCE_WEIGHTS.exactTitle;
  else if (title.startsWith(queryLower)) signals.titleStartsWith = SEARCH_RELEVANCE_WEIGHTS.titleStartsWith;
  else if (title.includes(queryLower)) signals.titleContains = SEARCH_RELEVANCE_WEIGHTS.titleContains;

  if (excerpt.includes(queryLower)) signals.phraseInExcerpt = SEARCH_RELEVANCE_WEIGHTS.phraseInExcerpt;
  if (content.includes(queryLower)) signals.phraseInContent = SEARCH_RELEVANCE_WEIGHTS.phraseInContent;
  if (aliases.some((alias) => alias.toLowerCase().includes(queryLower)) || slug.includes(queryLower)) signals.aliasMatch = SEARCH_RELEVANCE_WEIGHTS.aliasMatch;
  if (candidate.redirectTo?.toLowerCase().includes(queryLower)) signals.redirectMatch = SEARCH_RELEVANCE_WEIGHTS.redirectMatch;

  const matchedTerms = terms.filter((term) => title.includes(term) || excerpt.includes(term) || content.includes(term) || slug.includes(term));
  if (terms.length > 0) signals.wordCoverage = Math.round((matchedTerms.length / terms.length) * SEARCH_RELEVANCE_WEIGHTS.wordCoverage);

  if (candidate.lastVerifiedAt) signals.verifiedBoost = SEARCH_RELEVANCE_WEIGHTS.verifiedBoost;
  if (candidate.status === "draft") signals.draftPenalty = SEARCH_RELEVANCE_WEIGHTS.draftPenalty;
  if (candidate.status === "review") signals.reviewPenalty = SEARCH_RELEVANCE_WEIGHTS.reviewPenalty;

  const updatedAt = toDate(candidate.updatedAt);
  if (updatedAt && daysBetween(updatedAt, now) > 365) signals.stalePenalty = SEARCH_RELEVANCE_WEIGHTS.stalePenalty;

  const verificationExpiresAt = toDate(candidate.verificationExpiresAt);
  if (verificationExpiresAt && verificationExpiresAt < now) signals.verificationExpiredPenalty = SEARCH_RELEVANCE_WEIGHTS.verificationExpiredPenalty;

  return {
    score: Object.values(signals).reduce((sum, value) => sum + value, 0),
    matchedTerms,
    signals,
  };
}

export function buildSearchExplain(query: string, candidate: SearchCandidate, now: Date = new Date()) {
  const score = scoreSearchCandidate(query, candidate, now);
  return {
    schemaVersion: SEARCH_RELEVANCE_SCHEMA_VERSION,
    matchedTerms: score.matchedTerms,
    score: score.score,
    signals: score.signals,
    weights: SEARCH_RELEVANCE_WEIGHTS,
  };
}

export function createSearchFacets<T extends { category?: { id?: string; name?: string | null; slug?: string | null } | null; tags?: Array<{ tag?: { slug?: string | null; name?: string | null } }>; status?: string | null }>(items: T[]) {
  const categories = new Map<string, { name: string; count: number }>();
  const tags = new Map<string, { name: string; count: number }>();
  const statuses = new Map<string, number>();

  for (const item of items) {
    if (item.category?.slug) {
      const current = categories.get(item.category.slug) ?? { name: item.category.name ?? item.category.slug, count: 0 };
      current.count += 1;
      categories.set(item.category.slug, current);
    }
    for (const tagRef of item.tags ?? []) {
      const tag = tagRef.tag;
      if (!tag?.slug) continue;
      const current = tags.get(tag.slug) ?? { name: tag.name ?? tag.slug, count: 0 };
      current.count += 1;
      tags.set(tag.slug, current);
    }
    if (item.status) statuses.set(item.status, (statuses.get(item.status) ?? 0) + 1);
  }

  return {
    categories: [...categories.entries()].map(([slug, value]) => ({ slug, ...value })),
    tags: [...tags.entries()].map(([slug, value]) => ({ slug, ...value })),
    statuses: [...statuses.entries()].map(([status, count]) => ({ status, count })),
  };
}

function tokenize(query: string) {
  return query.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 2);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}
