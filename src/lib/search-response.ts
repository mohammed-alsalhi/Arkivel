export type SearchResultLike = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  highlightedExcerpt?: string | null;
  updatedAt?: string | Date | null;
  category?: unknown;
  tags?: unknown;
  score?: number;
};

type SearchPayload<T extends SearchResultLike> =
  | T[]
  | {
      results?: T[];
      semanticResults?: T[];
      data?: T[];
      suggestions?: string[];
      meta?: { query?: string };
    };

function isSearchResult(value: unknown): value is SearchResultLike {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<SearchResultLike>;
  return (
    typeof maybe.id === "string" &&
    typeof maybe.title === "string" &&
    typeof maybe.slug === "string"
  );
}

function uniqueResults<T extends SearchResultLike>(results: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const result of results) {
    const key = result.slug || result.id;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(result);
  }

  return unique;
}

export function getSearchResults<T extends SearchResultLike>(
  payload: unknown,
  options: { includeSemantic?: boolean } = {}
): T[] {
  if (Array.isArray(payload)) {
    return payload.filter(isSearchResult) as T[];
  }

  if (!payload || typeof payload !== "object") return [];

  const typed = payload as Exclude<SearchPayload<T>, T[]>;
  const primary = Array.isArray(typed.results)
    ? typed.results
    : Array.isArray(typed.data)
      ? typed.data
      : [];

  const semantic =
    options.includeSemantic && Array.isArray(typed.semanticResults)
      ? typed.semanticResults
      : [];

  return uniqueResults([...primary, ...semantic].filter(isSearchResult) as T[]);
}

export function getSemanticSearchResults<T extends SearchResultLike>(
  payload: unknown
): T[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const typed = payload as Exclude<SearchPayload<T>, T[]>;
  if (!Array.isArray(typed.semanticResults)) return [];
  return uniqueResults(typed.semanticResults.filter(isSearchResult) as T[]);
}

export function getSearchSuggestions(payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
  const suggestions = (payload as { suggestions?: unknown }).suggestions;
  return Array.isArray(suggestions)
    ? suggestions.filter((suggestion): suggestion is string => typeof suggestion === "string")
    : [];
}
