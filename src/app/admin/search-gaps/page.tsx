import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SearchGapsPage() {
  const user = await getSession();
  if (!user || !await isAdmin()) redirect("/admin");

  const logs = await prisma.metricLog.findMany({
    where: { type: "search_no_results" },
    select: { path: true },
  });

  const counts: Record<string, number> = {};
  for (const log of logs) {
    if (log.path) counts[log.path] = (counts[log.path] ?? 0) + 1;
  }

  const rows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Search Gap Dashboard
      </h1>
      <p className="text-sm text-muted mb-4">
        Queries that returned zero results, sorted by frequency. Use these to prioritise new articles.
      </p>

      {rows.length === 0 ? (
        <p className="text-muted text-sm">No zero-result searches recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-3 py-2 text-left font-medium">Query</th>
                <th className="px-3 py-2 text-left font-medium w-24">Count</th>
                <th className="px-3 py-2 text-left font-medium w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([query, count]) => (
                <tr key={query} className="border-b border-border hover:bg-surface-hover">
                  <td className="px-3 py-2 font-mono text-xs">{query}</td>
                  <td className="px-3 py-2 text-muted">{count}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin?action=new&title=${encodeURIComponent(query)}`}
                      className="text-xs text-wiki-link hover:underline"
                    >
                      Create article
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
