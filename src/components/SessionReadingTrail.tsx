"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TrailEntry {
  slug: string;
  title: string;
}

const MAX_TRAIL = 10;
const STORAGE_KEY = "wiki_reading_trail";

export default function SessionReadingTrail({ slug, title }: { slug: string; title: string }) {
  const pathname = usePathname();
  const [trail, setTrail] = useState<TrailEntry[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const existing: TrailEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((e) => e.slug !== slug);
    const next = [{ slug, title }, ...filtered].slice(0, MAX_TRAIL);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setTrail(next);
  }, [slug, title, pathname]);

  if (trail.length <= 1) return null;

  return (
    <div className="mt-6 border border-border rounded text-[11px]">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-surface/50 text-muted hover:text-foreground transition-colors"
      >
        <span className="font-medium uppercase tracking-wide">Reading trail</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {!collapsed && (
        <ol className="px-3 py-2 space-y-1">
          {trail.map((entry, i) => (
            <li key={entry.slug} className={i === 0 ? "font-medium text-foreground" : "text-muted"}>
              {i === 0 ? (
                <span>→ {entry.title}</span>
              ) : (
                <Link href={`/articles/${entry.slug}`} className="hover:underline hover:text-wiki-link">
                  {entry.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
