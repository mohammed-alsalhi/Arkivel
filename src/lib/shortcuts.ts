export type ShortcutMap = {
  home: string;
  allArticles: string;
  newArticle: string;
  search: string;
  recentChanges: string;
  graph: string;
};

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  home: "gh",
  allArticles: "ga",
  newArticle: "gn",
  search: "gs",
  recentChanges: "gr",
  graph: "gg",
};

export const SHORTCUT_LABELS: Record<keyof ShortcutMap, string> = {
  home: "Go to home page",
  allArticles: "Go to all articles",
  newArticle: "New article",
  search: "Go to search",
  recentChanges: "Go to recent changes",
  graph: "Go to graph",
};

export const SHORTCUT_DESTINATIONS: Record<keyof ShortcutMap, string> = {
  home: "/",
  allArticles: "/articles",
  newArticle: "/articles/new",
  search: "/search",
  recentChanges: "/recent-changes",
  graph: "/graph",
};

const STORAGE_KEY = "wiki_shortcuts";

export function loadShortcuts(): ShortcutMap {
  if (typeof window === "undefined") return DEFAULT_SHORTCUTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SHORTCUTS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_SHORTCUTS;
}

export function saveShortcuts(map: ShortcutMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function resetShortcuts(): void {
  localStorage.removeItem(STORAGE_KEY);
}
