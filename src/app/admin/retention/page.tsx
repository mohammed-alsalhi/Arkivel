"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ArticleRetention = {
  articleId: string;
  title: string;
  slug: string;
  sessions: number;
  avgDepth: number;
  buckets: { from: number; to: number; count: number; pct: number }[];
};

export default function RetentionPage() {
  const [articles, setArticles] = useState<ArticleRetention[]>([]);
  const [selected, setSelected] = useState<ArticleRetention | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/retention")
      .then((r) => r.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) setSelected(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        Reader Retention
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Scroll depth distribution per article — shows how far readers get through each article before leaving.
      </p>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="text-[13px] text-muted italic">No scroll depth data yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
          {/* Article list */}
          <div className="border border-border rounded overflow-hidden">
            <div className="px-3 py-1.5 text-[11px] font-medium text-muted bg-surface-hover border-b border-border">
              Articles
            </div>
            <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {articles.map((a) => (
                <li key={a.articleId}>
                  <button
                    onClick={() => setSelected(a)}
                    className={`w-full text-left px-3 py-2 text-[12px] hover:bg-surface-hover ${selected?.articleId === a.articleId ? "bg-surface-hover font-medium" : ""}`}
                  >
                    <div className="truncate">{a.title}</div>
                    <div className="text-[10px] text-muted">{a.sessions} sessions · avg {a.avgDepth}%</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Detail */}
          {selected && (
            <div className="border border-border rounded p-4">
              <div className="flex items-baseline justify-between mb-3">
                <Link href={`/articles/${selected.slug}`} className="wiki-link hover:underline text-[13px] font-medium">
                  {selected.title}
                </Link>
                <span className="text-[11px] text-muted">{selected.sessions} readers · avg {selected.avgDepth}% read</span>
              </div>

              <div className="space-y-1.5">
                {selected.buckets.map((b) => (
                  <div key={b.from} className="flex items-center gap-2 text-[11px]">
                    <span className="text-muted w-14 text-right">{b.from}–{b.to}%</span>
                    <div className="flex-1 h-4 bg-surface-hover rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-sm"
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <span className="text-muted w-10">{b.count}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3 text-center">
                {[25, 50, 75, 90, 100].map((threshold) => {
                  const reached = selected.buckets
                    .filter((b) => b.from >= threshold - 10 && b.to <= threshold)
                    .reduce((sum, b) => sum + b.count, 0);
                  // eslint-disable-next-line react-hooks/purity
                  const pct = selected.sessions > 0 ? Math.round((selected.buckets.filter(b => b.from >= threshold - 1).reduce((s, b) => s + b.count, 0) / selected.sessions) * 100) : 0;
                  return (
                    <div key={threshold} className="border border-border rounded py-2">
                      <div className="text-[16px] font-bold">{pct}%</div>
                      <div className="text-[10px] text-muted">reached {threshold}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
