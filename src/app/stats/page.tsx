"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StatsData = {
  totalArticles: number;
  publishedArticles: number;
  totalCategories: number;
  totalTags: number;
  totalRevisions: number;
  totalUsers: number;
  totalWords: number;
  weeklyActiveUsers: number;
  topContributors: { username: string; displayName: string | null; revisions: number }[];
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-border bg-surface rounded p-4">
      <div className="text-[1.6rem] font-bold text-accent tabular-nums">{value}</div>
      <div className="text-[12px] font-semibold mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function formatWords(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Wiki Statistics
      </h1>

      {!stats ? (
        <p className="text-[13px] text-muted italic">Loading statistics...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Published Articles" value={stats.publishedArticles} sub={`${stats.totalArticles} total`} />
            <StatCard label="Total Words" value={formatWords(stats.totalWords)} sub="across all articles" />
            <StatCard label="Categories" value={stats.totalCategories} />
            <StatCard label="Tags" value={stats.totalTags} />
            <StatCard label="Total Edits" value={stats.totalRevisions.toLocaleString()} />
            <StatCard label="Contributors" value={stats.totalUsers} />
            <StatCard label="Active This Week" value={stats.weeklyActiveUsers} sub="unique editors" />
          </div>

          {stats.topContributors.length > 0 && (
            <div className="border border-border bg-surface rounded p-4">
              <h2 className="text-[12px] font-semibold uppercase text-muted mb-3">
                Top Contributors (all time)
              </h2>
              <ol className="space-y-1.5">
                {stats.topContributors.map((c, i) => (
                  <li key={c.username} className="flex items-center gap-3 text-[13px]">
                    <span className="w-5 text-muted text-right text-[11px]">{i + 1}.</span>
                    <Link href={`/users/${c.username}`} className="text-wiki-link hover:underline flex-1">
                      {c.displayName || c.username}
                    </Link>
                    <span className="text-muted text-[11px]">{c.revisions.toLocaleString()} edits</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
