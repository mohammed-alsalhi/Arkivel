import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DataTable, EmptyState, Page, PageHeader, Section, StatCard, StatGrid } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await getSession();
  if (!user || !await isAdmin()) redirect("/admin");

  const [topPaths, recentScrollAvg, searchGapCount] = await Promise.all([
    prisma.readerPathEvent.groupBy({
      by: ["fromSlug", "toSlug"],
      _count: { toSlug: true },
      orderBy: { _count: { toSlug: "desc" } },
      take: 10,
    }),
    prisma.scrollDepthLog.aggregate({ _avg: { depth: true } }),
    prisma.metricLog.count({ where: { type: "search_no_results" } }),
  ]);

  const avgDepth = Math.round(searchGapCount >= 0 ? (recentScrollAvg._avg.depth ?? 0) : 0);

  return (
    <Page>
      <PageHeader title="Analytics Dashboard" />

      <StatGrid>
        <StatCard label="Avg. scroll depth" value={`${avgDepth}%`} />
        <StatCard label="Navigation paths tracked" value={topPaths.length} />
        <StatCard
          label={
            <Link href="/admin/search-gaps" className="text-wiki-link hover:underline">
              Zero-result searches →
            </Link>
          }
          value={searchGapCount}
        />
      </StatGrid>

      <Section title="Top Navigation Paths">
        {topPaths.length === 0 ? (
          <EmptyState title="No navigation events recorded yet." />
        ) : (
          <DataTable>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th className="w-20">Count</th>
              </tr>
            </thead>
            <tbody>
              {topPaths.map((p, i) => (
                <tr key={i}>
                  <td>
                    <Link href={`/articles/${p.fromSlug}`} className="text-wiki-link hover:underline text-xs">
                      {p.fromSlug}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/articles/${p.toSlug}`} className="text-wiki-link hover:underline text-xs">
                      {p.toSlug}
                    </Link>
                  </td>
                  <td className="text-muted">{p._count.toSlug}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Section>

      <div className="flex gap-4 flex-wrap">
        <Link href="/admin/search-gaps" className="text-sm text-wiki-link hover:underline">
          Search Gap Dashboard →
        </Link>
        <Link href="/admin/staleness" className="text-sm text-wiki-link hover:underline">
          Stale Articles →
        </Link>
        <Link href="/admin/health" className="text-sm text-wiki-link hover:underline">
          Wiki Health Score →
        </Link>
      </div>
    </Page>
  );
}
