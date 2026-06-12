import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded p-4 text-center">
          <div className="text-3xl font-bold">{avgDepth}%</div>
          <div className="text-sm text-muted mt-1">Avg. scroll depth</div>
        </div>
        <div className="border border-border rounded p-4 text-center">
          <div className="text-3xl font-bold">{topPaths.length}</div>
          <div className="text-sm text-muted mt-1">Navigation paths tracked</div>
        </div>
        <div className="border border-border rounded p-4 text-center">
          <div className="text-3xl font-bold">{searchGapCount}</div>
          <div className="text-sm text-muted mt-1">
            <Link href="/admin/search-gaps" className="text-wiki-link hover:underline">
              Zero-result searches →
            </Link>
          </div>
        </div>
      </div>

      <h2 className="text-base font-medium mb-2">Top Navigation Paths</h2>
      {topPaths.length === 0 ? (
        <p className="text-muted text-sm">No navigation events recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mb-8">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-3 py-2 text-left font-medium">From</th>
                <th className="px-3 py-2 text-left font-medium">To</th>
                <th className="px-3 py-2 text-left font-medium w-20">Count</th>
              </tr>
            </thead>
            <tbody>
              {topPaths.map((p, i) => (
                <tr key={i} className="border-b border-border hover:bg-surface-hover">
                  <td className="px-3 py-2">
                    <Link href={`/articles/${p.fromSlug}`} className="text-wiki-link hover:underline text-xs">
                      {p.fromSlug}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/articles/${p.toSlug}`} className="text-wiki-link hover:underline text-xs">
                      {p.toSlug}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted">{p._count.toSlug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
}
