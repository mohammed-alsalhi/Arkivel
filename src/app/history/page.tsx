"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Entry = { slug: string; title: string; visitedAt: number };

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wiki_view_history");
      setEntries(raw ? JSON.parse(raw) : []);
    } catch {
      setEntries([]);
    }
    setLoaded(true);
  }, []);

  function clear() {
    localStorage.removeItem("wiki_view_history");
    setEntries([]);
  }

  function relDate(ts: number) {
    // eslint-disable-next-line react-hooks/purity
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 2) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "Yesterday";
    return `${d} days ago`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between border-b border-border pb-1 mb-4">
        <h1 className="text-[1.4rem] font-normal text-heading" style={{ fontFamily: "var(--font-serif)" }}>
          Reading History
        </h1>
        {entries.length > 0 && (
          <button
            onClick={clear}
            className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover"
          >
            Clear history
          </button>
        )}
      </div>

      {!loaded ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-[13px] text-muted italic">No reading history yet. Articles you view will appear here.</p>
      ) : (
        <ol className="space-y-1">
          {entries.map((e, i) => (
            <li key={e.slug} className="flex items-baseline gap-2 text-[13px]">
              <span className="text-[11px] text-muted w-5 text-right flex-shrink-0">{i + 1}.</span>
              <Link href={`/articles/${e.slug}`} className="wiki-link hover:underline flex-1">
                {e.title}
              </Link>
              <span className="text-[11px] text-muted flex-shrink-0" title={new Date(e.visitedAt).toLocaleString()}>
                {relDate(e.visitedAt)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
