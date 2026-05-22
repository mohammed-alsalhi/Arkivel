"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Section, StatCard, StatGrid } from "@/components/ui";

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
    <Page>
      <PageHeader
        title="Wiki statistics"
        description="A quick read on content volume, editing activity, and contributor coverage."
      />
      {!stats ? (
        <p className="text-[13px] text-muted italic">Loading statistics...</p>
      ) : (
        <>
          <StatGrid>
            <StatCard label="Published Articles" value={stats.publishedArticles} detail={`${stats.totalArticles} total`} />
            <StatCard label="Total Words" value={formatWords(stats.totalWords)} detail="across all articles" />
            <StatCard label="Categories" value={stats.totalCategories} />
            <StatCard label="Tags" value={stats.totalTags} />
            <StatCard label="Total Edits" value={stats.totalRevisions.toLocaleString()} />
            <StatCard label="Contributors" value={stats.totalUsers} />
            <StatCard label="Active This Week" value={stats.weeklyActiveUsers} detail="unique editors" />
          </StatGrid>

          {stats.topContributors.length > 0 && (
            <Section title="Top contributors (all time)">
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
            </Section>
          )}
        </>
      )}
    </Page>
  );
}
