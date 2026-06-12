import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DataTable, EmptyState, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader
        title="Search Gap Dashboard"
        description="Queries that returned zero results, sorted by frequency. Use these to prioritise new articles."
      />

      {rows.length === 0 ? (
        <EmptyState title="No zero-result searches recorded yet." />
      ) : (
        <DataTable>
          <thead>
            <tr>
              <th>Query</th>
              <th className="w-24">Count</th>
              <th className="w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([query, count]) => (
              <tr key={query}>
                <td className="font-mono text-xs">{query}</td>
                <td className="text-muted">{count}</td>
                <td>
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
        </DataTable>
      )}
    </Page>
  );
}
