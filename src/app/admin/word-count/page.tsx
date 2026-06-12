"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Bucket = { label: string; count: number };
type ArticleEntry = { id: string; title: string; slug: string; wordCount: number };
type Stats = { total: number; avg: number; max: number; min: number };
type Data = {
  distribution: Bucket[];
  topArticles: ArticleEntry[];
  shortArticles: ArticleEntry[];
  stats: Stats;
};

export default function WordCountPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/word-count")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
          Word Count Distribution
        </h1>
        <p className="text-[13px] text-muted italic">Loading…</p>
      </div>
    );
  }

  if (!data) return null;

  const maxCount = Math.max(...data.distribution.map((b) => b.count), 1);

  return (
    <div>
      <h1
        className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Word Count Distribution
      </h1>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Articles", value: data.stats.total },
          { label: "Average words", value: data.stats.avg.toLocaleString() },
          { label: "Longest", value: data.stats.max.toLocaleString() },
          { label: "Shortest", value: data.stats.min.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border bg-surface px-3 py-2">
            <div className="text-[11px] text-muted uppercase">{label}</div>
            <div className="text-[18px] font-bold text-heading mt-0.5">{value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="wiki-portal mb-6">
        <div className="wiki-portal-header">Distribution</div>
        <div className="wiki-portal-body">
          <div className="space-y-2">
            {data.distribution.map((b) => {
              const pct = Math.round((b.count / maxCount) * 100);
              return (
                <div key={b.label} className="flex items-center gap-3 text-[13px]">
                  <span className="w-24 text-right text-muted shrink-0">{b.label}</span>
                  <div className="flex-1 bg-surface-hover h-5 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-sm transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted text-right shrink-0">{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top + shortest articles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="wiki-portal">
          <div className="wiki-portal-header">Longest articles</div>
          <div className="wiki-portal-body">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <tbody>
                  {data.topArticles.map((a) => (
                    <tr key={a.id} className="border-t border-border-light">
                      <td className="py-1 pr-2">
                        <Link href={`/articles/${a.slug}`} className="text-accent hover:underline line-clamp-1">
                          {a.title}
                        </Link>
                      </td>
                      <td className="py-1 text-right text-muted whitespace-nowrap">{a.wordCount.toLocaleString()} w</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="wiki-portal">
          <div className="wiki-portal-header">Shortest articles</div>
          <div className="wiki-portal-body">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <tbody>
                  {data.shortArticles.map((a) => (
                    <tr key={a.id} className="border-t border-border-light">
                      <td className="py-1 pr-2">
                        <Link href={`/articles/${a.slug}`} className="text-accent hover:underline line-clamp-1">
                          {a.title}
                        </Link>
                      </td>
                      <td className="py-1 text-right text-muted whitespace-nowrap">{a.wordCount.toLocaleString()} w</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
