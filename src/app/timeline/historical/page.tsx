"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

type Event = {
  year: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { id: string; name: string; slug: string } | null;
};

type Data = {
  events: Event[];
  minYear: number;
  maxYear: number;
};

const CATEGORY_COLORS = [
  "border-l-blue-500", "border-l-green-500", "border-l-purple-500",
  "border-l-orange-500", "border-l-pink-500", "border-l-cyan-500",
  "border-l-yellow-500", "border-l-red-500",
];

export default function HistoricalTimelinePage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 0]);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    fetch("/api/timeline/historical")
      .then((r) => r.json())
      .then((d: Data) => {
        setData(d);
        setZoomRange([d.minYear, d.maxYear]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, string>();
    for (const e of data.events) {
      if (e.category && !seen.has(e.category.id)) seen.set(e.category.id, e.category.name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const categoryColorMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c, i) => m.set(c.id, CATEGORY_COLORS[i % CATEGORY_COLORS.length]));
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.events.filter((e) => {
      if (e.year < zoomRange[0] || e.year > zoomRange[1]) return false;
      if (selectedCategory && e.category?.id !== selectedCategory) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, zoomRange, selectedCategory, search]);

  // Group filtered events by year
  const byYear = useMemo(() => {
    const m = new Map<number, Event[]>();
    for (const e of filtered) {
      if (!m.has(e.year)) m.set(e.year, []);
      m.get(e.year)!.push(e);
    }
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  // Decade markers for the scrubber
  const decadeMarkers = useMemo(() => {
    if (!data) return [];
    const markers: number[] = [];
    const start = Math.floor(data.minYear / 10) * 10;
    const end = Math.ceil(data.maxYear / 10) * 10;
    for (let d = start; d <= end; d += 10) markers.push(d);
    return markers;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-1.5">
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return (
      <div>
        <h1 className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Historical Timeline
        </h1>
        <p className="text-[13px] text-muted">No articles with historical dates found. Articles need to mention specific years to appear here.</p>
      </div>
    );
  }

  const rangeSpan = data.maxYear - data.minYear || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[1.7rem] font-normal text-heading" style={{ fontFamily: "var(--font-serif)" }}>
          Historical Timeline
        </h1>
        <Link href="/timeline" className="text-[12px] text-muted hover:text-foreground hover:underline">
          View by creation date →
        </Link>
      </div>
      <p className="text-[13px] text-muted mb-4">
        {data.events.length} articles with historical dates, spanning {data.minYear}–{data.maxYear}.
        Dates are extracted from article content.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter articles…"
          className="border border-border bg-surface px-3 py-1.5 text-[13px] w-56 focus:border-accent focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-border bg-surface px-3 py-1.5 text-[13px] focus:border-accent focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {zoomed && (
          <button
            onClick={() => { setZoomRange([data.minYear, data.maxYear]); setZoomed(false); }}
            className="h-8 px-3 text-[12px] border border-border hover:bg-surface-hover transition-colors"
          >
            Reset zoom
          </button>
        )}
      </div>

      {/* Decade scrubber / zoom bar */}
      <div className="mb-6 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="relative h-8 bg-surface-hover border border-border rounded overflow-hidden">
            {/* Zoom selection indicator */}
            <div
              className="absolute top-0 h-full bg-accent/20 border-x border-accent"
              style={{
                left: `${((zoomRange[0] - data.minYear) / rangeSpan) * 100}%`,
                width: `${((zoomRange[1] - zoomRange[0]) / rangeSpan) * 100}%`,
              }}
            />
            {/* Decade markers */}
            {decadeMarkers.map((d) => {
              const pct = ((d - data.minYear) / rangeSpan) * 100;
              if (pct < 0 || pct > 100) return null;
              return (
                <button
                  key={d}
                  onClick={() => {
                    const start = d;
                    const end = d + (d % 100 === 0 ? 99 : 9);
                    setZoomRange([Math.max(data.minYear, start), Math.min(data.maxYear, end)]);
                    setZoomed(true);
                  }}
                  style={{ left: `${pct}%` }}
                  className="absolute top-0 h-full text-[9px] text-muted hover:text-foreground px-0.5 hover:bg-accent/10 transition-colors border-r border-border/50 last:border-0"
                  title={`Zoom to ${d}s`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted mt-1">Click a decade to zoom in. Showing {filtered.length} of {data.events.length} articles.</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[72px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-0">
          {byYear.map(([year, events]) => (
            <div key={year} className="flex gap-4">
              {/* Year label */}
              <div className="w-16 flex-shrink-0 text-right pt-3">
                <span className="text-[12px] font-bold text-muted">{year}</span>
              </div>

              {/* Dot */}
              <div className="flex-shrink-0 w-2 flex items-start pt-4 z-10">
                <div className={`w-2 h-2 rounded-full border-2 border-accent bg-background mt-0.5`} />
              </div>

              {/* Events */}
              <div className="flex-1 pb-4 space-y-1.5 pt-2.5">
                {events.map((e, i) => (
                  <div
                    key={`${e.slug}-${i}`}
                    className={`border-l-4 pl-3 py-1.5 rounded-r-sm bg-surface border border-border border-l-[4px] ${
                      e.category ? (categoryColorMap.get(e.category.id) ?? "border-l-border") : "border-l-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/articles/${e.slug}`}
                          className="text-[13px] font-semibold text-heading hover:underline leading-snug"
                        >
                          {e.title}
                        </Link>
                        {e.category && (
                          <p className="text-[10px] text-muted mt-0.5">{e.category.name}</p>
                        )}
                        {e.excerpt && (
                          <p className="text-[12px] text-muted leading-relaxed mt-0.5 line-clamp-2">{e.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-[13px] text-muted ml-24 py-8">No articles match your filters.</p>
        )}
      </div>
    </div>
  );
}
