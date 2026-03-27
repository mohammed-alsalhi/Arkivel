"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wiki_view_history";
const MAX_HISTORY = 50;

type HistoryEntry = { slug: string; title: string; visitedAt: number };

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {}
}

interface Props {
  slug: string;
  title: string;
}

/**
 * Records the current article visit in localStorage and shows how long ago the
 * user last read this article (on subsequent visits).
 */
export default function ArticleViewHistory({ slug, title }: Props) {
  const [lastVisit, setLastVisit] = useState<number | null>(null);

  useEffect(() => {
    const history = loadHistory();
    const existing = history.find((e) => e.slug === slug);
    if (existing) {
      setLastVisit(existing.visitedAt);
    }
    // Update / insert entry
    const updated = [
      { slug, title, visitedAt: Date.now() },
      ...history.filter((e) => e.slug !== slug),
    ];
    saveHistory(updated);
  }, [slug, title]);

  if (!lastVisit) return null;

  // eslint-disable-next-line react-hooks/purity
  const diffMs = Date.now() - lastVisit;
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMin = Math.floor(diffMs / 60000);

  let ago: string;
  if (diffMin < 2) ago = "just now";
  else if (diffMin < 60) ago = `${diffMin} min ago`;
  else if (diffHours < 24) ago = `${diffHours}h ago`;
  else if (diffDays === 1) ago = "yesterday";
  else ago = `${diffDays} days ago`;

  return (
    <span className="text-[11px] text-muted" title={new Date(lastVisit).toLocaleString()}>
      · You read this {ago}
    </span>
  );
}
