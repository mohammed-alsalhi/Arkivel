"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MetricsSummary {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalTags: number;
  totalRevisions: number;
  totalDiscussions: number;
  recentEdits24h: number;
  recentArticles24h: number;
  topCategories: { name: string; slug: string; count: number }[];
  articlesByMonth: { month: string; count: number }[];
  timestamp: string;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => {
        if (r.status === 401) {
          setError("Unauthorized. Please log in as admin.");
          router.push("/admin");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setMetrics(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load metrics");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="py-8 text-center text-muted italic text-[13px]">
        Loading metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-wiki-link-broken text-[13px]">
        {error}
      </div>
    );
  }

  if (!metrics) return null;

  const maxCategoryCount = Math.max(...metrics.topCategories.map((c) => c.count), 1);
  const maxMonthCount = Math.max(...metrics.articlesByMonth.map((m) => m.count), 1);

  return (
    <div>
      <h1
        className="text-[1.5rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Wiki Metrics
      </h1>

      <p className="text-[11px] text-muted mb-4">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Articles" value={metrics.totalArticles} />
        <StatCard label="Published" value={metrics.publishedArticles} />
        <StatCard label="Drafts" value={metrics.draftArticles} />
        <StatCard label="Categories" value={metrics.totalCategories} />
        <StatCard label="Tags" value={metrics.totalTags} />
        <StatCard label="Revisions" value={metrics.totalRevisions} />
        <StatCard label="Discussions" value={metrics.totalDiscussions} />
        <StatCard label="Edits (24h)" value={metrics.recentEdits24h} highlight />
      </div>

      {/* Recent activity */}
      <div className="wiki-notice mb-4">
        <strong>Recent Activity (24h):</strong>{" "}
        {metrics.recentEdits24h} edit(s), {metrics.recentArticles24h} new article(s)
      </div>

      {/* Top categories bar chart */}
      <div className="border border-border mb-6">
        <div className="bg-infobox-header px-3 py-1.5">
          <h3 className="text-[12px] font-bold text-foreground uppercase tracking-wider">
            Top Categories by Article Count
          </h3>
        </div>
        <div className="p-3 space-y-2">
          {metrics.topCategories.length === 0 && (
            <p className="text-[12px] text-muted italic">No categories yet.</p>
          )}
          {metrics.topCategories.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-2">
              <span className="w-28 text-[12px] text-foreground truncate flex-shrink-0">
                {cat.name}
              </span>
              <div className="flex-1 h-5 bg-background border border-border-light relative">
                <div
                  className="h-full bg-accent"
                  style={{
                    width: `${(cat.count / maxCategoryCount) * 100}%`,
                    minWidth: cat.count > 0 ? "2px" : "0",
                  }}
                />
              </div>
              <span className="text-[11px] text-muted w-8 text-right flex-shrink-0">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Articles by month chart */}
      {metrics.articlesByMonth.length > 0 && (
        <div className="border border-border mb-6">
          <div className="bg-infobox-header px-3 py-1.5">
            <h3 className="text-[12px] font-bold text-foreground uppercase tracking-wider">
              Articles Created by Month
            </h3>
          </div>
          <div className="p-3 space-y-2">
            {metrics.articlesByMonth.map((m) => (
              <div key={m.month} className="flex items-center gap-2">
                <span className="w-20 text-[12px] text-foreground flex-shrink-0">
                  {m.month}
                </span>
                <div className="flex-1 h-5 bg-background border border-border-light relative">
                  <div
                    className="h-full bg-accent"
                    style={{
                      width: `${(m.count / maxMonthCount) * 100}%`,
                      minWidth: m.count > 0 ? "2px" : "0",
                    }}
                  />
                </div>
                <span className="text-[11px] text-muted w-8 text-right flex-shrink-0">
                  {m.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="border border-border bg-surface p-3 text-center">
      <div
        className={`text-xl font-bold ${
          highlight ? "text-accent" : "text-heading"
        }`}
      >
        {value.toLocaleString()}
      </div>
      <div className="text-[11px] text-muted mt-0.5">{label}</div>
    </div>
  );
}
