"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, EmptyState, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader
        title="Reading History"
        actions={entries.length > 0 && <Button onClick={clear}>Clear history</Button>}
      />

      {!loaded ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : entries.length === 0 ? (
        <EmptyState description="No reading history yet. Articles you view will appear here." />
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
    </Page>
  );
}
