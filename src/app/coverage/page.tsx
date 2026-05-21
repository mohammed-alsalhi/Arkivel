"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CoverageItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  totalArticles: number;
  totalWords: number;
  avgWords: number;
  recencyScore: number;
  coverageScore: number;
  status: "empty" | "sparse" | "growing" | "solid" | "rich";
};

type GapItem = {
  title: string;
  count: number;
  referencedBy: string[];
};

const STATUS_COLOR: Record<CoverageItem["status"], string> = {
  empty: "bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  sparse: "bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
  growing: "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
  solid: "bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  rich: "bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800",
};

const STATUS_BAR: Record<CoverageItem["status"], string> = {
  empty: "bg-red-400",
  sparse: "bg-orange-400",
  growing: "bg-yellow-400",
  solid: "bg-blue-500",
  rich: "bg-green-500",
};

const STATUS_LABEL: Record<CoverageItem["status"], string> = {
  empty: "Empty",
  sparse: "Sparse",
  growing: "Growing",
  solid: "Solid",
  rich: "Rich",
};

export default function CoverageMapPage() {
  const [items, setItems] = useState<CoverageItem[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [gapsLoading, setGapsLoading] = useState(true);
  const [filter, setFilter] = useState<CoverageItem["status"] | "all">("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiGaps, setAiGaps] = useState<string[]>([]);
  const [aiGapsLoading, setAiGapsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/coverage")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); });
    fetch("/api/ai/knowledge-gaps")
      .then((r) => r.ok ? r.json() : { gaps: [] })
      .then((data) => { setGaps(data.gaps?.slice(0, 20) ?? []); setGapsLoading(false); });
  }, []);

  async function loadCategoryGaps(categoryId: string, categorySlug: string) {
    setSelectedCategory(categorySlug);
    setAiGapsLoading(true);
    setAiGaps([]);
    const res = await fetch(`/api/ai/category-gaps?categoryId=${categoryId}`);
    if (res.ok) {
      const data = await res.json();
      setAiGaps(data.suggestions ?? []);
    }
    setAiGapsLoading(false);
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  const totalArticles = items.reduce((s, i) => s + i.totalArticles, 0);
  const totalWords = items.reduce((s, i) => s + i.totalWords, 0);
  const emptyCount = items.filter((i) => i.status === "empty").length;
  const sparseCount = items.filter((i) => i.status === "sparse").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-1.5">
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Knowledge Coverage Map
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Visual overview of how well each category is covered. Identify gaps, sparse areas, and where to write next.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Categories", value: items.length },
          { label: "Total articles", value: totalArticles },
          { label: "Total words", value: totalWords > 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords },
          { label: "Need attention", value: emptyCount + sparseCount, highlight: emptyCount + sparseCount > 0 },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="border border-border rounded p-3 bg-surface">
            <div className={`text-[1.4rem] font-bold ${highlight ? "text-orange-500" : "text-heading"}`}>{value}</div>
            <div className="text-[11px] text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter + View toggle */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", "empty", "sparse", "growing", "solid", "rich"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-6 px-2 text-[11px] border rounded capitalize transition-colors ${
                filter === f
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-muted hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {f === "all" ? `All (${items.length})` : `${STATUS_LABEL[f]} (${items.filter((i) => i.status === f).length})`}
            </button>
          ))}
        </div>
        <div className="flex border border-border rounded overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`h-6 px-2.5 text-[11px] transition-colors ${view === "grid" ? "bg-accent text-white" : "text-muted hover:bg-surface-hover"}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={`h-6 px-2.5 text-[11px] transition-colors ${view === "table" ? "bg-accent text-white" : "text-muted hover:bg-surface-hover"}`}
          >
            Table
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`border rounded p-3 space-y-2 cursor-pointer hover:shadow-sm transition-all ${STATUS_COLOR[item.status]}`}
              onClick={() => loadCategoryGaps(item.id, item.slug)}
            >
              <div className="flex items-start justify-between">
                <Link
                  href={`/categories/${item.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[13px] font-semibold text-heading hover:underline leading-snug"
                >
                  {item.name}
                </Link>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${STATUS_BAR[item.status]} text-white ml-1 flex-shrink-0`}>
                  {STATUS_LABEL[item.status]}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-muted mb-0.5">
                  <span>{item.totalArticles} article{item.totalArticles !== 1 ? "s" : ""}</span>
                  <span>{item.coverageScore}%</span>
                </div>
                <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${STATUS_BAR[item.status]}`}
                    style={{ width: `${item.coverageScore}%` }}
                  />
                </div>
              </div>
              {item.avgWords > 0 && (
                <p className="text-[10px] text-muted">~{item.avgWords} words/article</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full border-collapse border border-border text-[13px] mb-6">
          <thead>
            <tr className="bg-surface-hover">
              <th className="border border-border px-3 py-1.5 text-left font-bold">Category</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold w-20">Articles</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold w-28">Avg words</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold w-32">Coverage</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold w-24">Status</th>
              <th className="border border-border px-3 py-1.5 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-surface-hover">
                <td className="border border-border px-3 py-1.5">
                  <Link href={`/categories/${item.slug}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                </td>
                <td className="border border-border px-3 py-1.5 text-muted">{item.totalArticles}</td>
                <td className="border border-border px-3 py-1.5 text-muted">{item.avgWords}</td>
                <td className="border border-border px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${STATUS_BAR[item.status]}`} style={{ width: `${item.coverageScore}%` }} />
                    </div>
                    <span className="text-[11px] text-muted w-8 text-right">{item.coverageScore}%</span>
                  </div>
                </td>
                <td className="border border-border px-3 py-1.5">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${STATUS_BAR[item.status]} text-white`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </td>
                <td className="border border-border px-3 py-1.5 text-right">
                  <button
                    onClick={() => loadCategoryGaps(item.id, item.slug)}
                    className="text-[11px] text-accent hover:underline"
                  >
                    Find gaps
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* AI Category Gap Panel */}
      {selectedCategory && (
        <div className="wiki-portal mb-6">
          <div className="wiki-portal-header">
            AI-suggested gaps in &ldquo;{filtered.find((i) => i.slug === selectedCategory)?.name ?? selectedCategory}&rdquo;
          </div>
          <div className="wiki-portal-body">
            {aiGapsLoading ? (
              <div className="flex items-center gap-1.5 py-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="text-[12px] text-muted ml-1">Analysing category…</span>
              </div>
            ) : aiGaps.length > 0 ? (
              <div className="space-y-1">
                {aiGaps.map((gap, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px] py-1 border-b border-border last:border-0">
                    <span>{gap}</span>
                    <Link
                      href={`/articles/new?title=${encodeURIComponent(gap)}`}
                      className="text-[11px] text-accent hover:underline ml-4 flex-shrink-0"
                    >
                      Create article
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted">No gaps suggested for this category.</p>
            )}
          </div>
        </div>
      )}

      {/* Knowledge gaps from broken wiki links */}
      <div className="wiki-portal">
        <div className="wiki-portal-header">
          Broken wiki links — referenced topics with no article
        </div>
        <div className="wiki-portal-body">
          {gapsLoading ? (
            <p className="text-[13px] text-muted">Scanning wiki links…</p>
          ) : gaps.length === 0 ? (
            <p className="text-[13px] text-muted">No broken wiki links found. Every referenced topic has an article.</p>
          ) : (
            <div className="space-y-1">
              {gaps.map((gap, i) => (
                <div key={i} className="flex items-center justify-between text-[13px] py-1 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium">{gap.title}</span>
                    <span className="text-[11px] text-muted ml-2">
                      referenced by {gap.count} article{gap.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Link
                    href={`/articles/new?title=${encodeURIComponent(gap.title)}`}
                    className="text-[11px] text-accent hover:underline ml-4 flex-shrink-0"
                  >
                    Create article
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
