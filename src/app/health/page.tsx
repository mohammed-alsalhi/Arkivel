"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ArticleIssue = {
  slug: string;
  title: string;
  category: string | null;
  status: string;
  updatedAt: string;
  issues: string[];
};

type HealthData = {
  total: number;
  healthScore: number;
  stubs: number;
  outdated: number;
  noExcerpt: number;
  noCategory: number;
  noTags: number;
  longArticles: number;
  brokenLinks: number;
  articleIssues: ArticleIssue[];
};

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-600";
};

const SCORE_LABEL = (score: number) => {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs work";
  return "Critical";
};

type Stat = { label: string; value: number; desc: string; color: string };

export default function WikiHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/health/wiki")
      .then((r) => r.json())
      .then((d: HealthData) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-1.5">
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    );
  }

  if (!data) return <p className="text-muted text-[13px]">Failed to load health data.</p>;

  const stats: Stat[] = [
    { label: "Stubs", value: data.stubs, desc: "< 100 words", color: "text-red-500" },
    { label: "Outdated", value: data.outdated, desc: "1+ year old", color: "text-orange-500" },
    { label: "No excerpt", value: data.noExcerpt, desc: "Missing summary", color: "text-yellow-600" },
    { label: "No category", value: data.noCategory, desc: "Uncategorized", color: "text-purple-500" },
    { label: "No tags", value: data.noTags, desc: "Untagged", color: "text-blue-500" },
    { label: "Broken links", value: data.brokenLinks, desc: "Dead wiki links", color: "text-red-600" },
    { label: "Very long", value: data.longArticles, desc: "> 5000 words", color: "text-gray-500" },
  ];

  const FILTERS = [
    { value: "all", label: "All issues" },
    { value: "Stub", label: "Stubs" },
    { value: "Outdated", label: "Outdated" },
    { value: "excerpt", label: "No excerpt" },
    { value: "category", label: "No category" },
    { value: "tags", label: "No tags" },
    { value: "broken", label: "Broken links" },
    { value: "long", label: "Very long" },
  ];

  const filtered =
    filter === "all"
      ? data.articleIssues
      : data.articleIssues.filter((a) =>
          a.issues.some((i) => i.toLowerCase().includes(filter.toLowerCase()))
        );

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-1"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Wiki Health Dashboard
        </h1>
        <p className="text-[13px] text-muted">
          Quality audit across {data.total} articles. Fix issues to improve your wiki&apos;s health score.
        </p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-surface border border-border rounded">
        <div className="text-center">
          <p className={`text-5xl font-bold tabular-nums ${SCORE_COLOR(data.healthScore)}`}>
            {data.healthScore}
          </p>
          <p className={`text-[12px] font-semibold mt-1 ${SCORE_COLOR(data.healthScore)}`}>
            {SCORE_LABEL(data.healthScore)}
          </p>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-surface-hover rounded-full overflow-hidden border border-border">
            <div
              className={`h-full rounded-full transition-all ${
                data.healthScore >= 80
                  ? "bg-green-500"
                  : data.healthScore >= 60
                  ? "bg-yellow-500"
                  : data.healthScore >= 40
                  ? "bg-orange-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${data.healthScore}%` }}
            />
          </div>
          <p className="text-[11px] text-muted mt-2">
            {data.articleIssues.length} of {data.total} articles have at least one issue
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded p-3">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[12px] font-medium text-foreground">{s.label}</p>
            <p className="text-[10px] text-muted">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`h-6 px-2.5 text-[11px] border rounded transition-colors ${
              filter === f.value
                ? "bg-accent text-white border-accent"
                : "border-border text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Article list */}
      {filtered.length === 0 ? (
        <p className="text-[13px] text-muted py-8 text-center">No issues found for this filter.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <div key={a.slug} className="bg-surface border border-border rounded p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="text-[13px] font-semibold text-heading hover:underline"
                    >
                      {a.title}
                    </Link>
                    {a.category && (
                      <span className="text-[10px] text-muted bg-surface-hover border border-border px-1.5 py-0.5 rounded">
                        {a.category}
                      </span>
                    )}
                    {a.status !== "published" && (
                      <span className="text-[10px] text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded capitalize">
                        {a.status}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {a.issues.map((issue, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/articles/${a.slug}/edit`}
                  className="flex-shrink-0 h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Fix
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
