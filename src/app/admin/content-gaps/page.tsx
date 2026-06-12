import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DataTable, EmptyState, Page, PageHeader, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ContentGapsPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  // Find zero-result searches from SearchQueryLog
  const zeroResultSearches = await prisma.searchQueryLog.groupBy({
    by: ["query"],
    where: { resultCount: 0 },
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: 100,
  });

  // Also find low-result searches (1–3 results, high volume)
  const lowResultSearches = await prisma.searchQueryLog.groupBy({
    by: ["query"],
    where: { resultCount: { gte: 1, lte: 3 } },
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: 50,
  });

  return (
    <Page>
      <PageHeader
        title="Content gap analysis"
        description={
          <>Search queries that returned zero or very few results — these represent gaps in your wiki&apos;s coverage.</>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Zero results */}
        <Section title={`Zero-result searches (${zeroResultSearches.length} unique queries)`}>
          {zeroResultSearches.length === 0 ? (
            <EmptyState title="No zero-result searches recorded." />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <th>Query</th>
                  <th className="text-right">Searches</th>
                </tr>
              </thead>
              <tbody>
                {zeroResultSearches.map((row, i) => (
                  <tr key={i}>
                    <td className="text-foreground">{row.query}</td>
                    <td className="text-right text-muted">{row._count.query}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </Section>

        {/* Low results */}
        <Section title={`Low-result searches (1–3) (${lowResultSearches.length} unique queries)`}>
          {lowResultSearches.length === 0 ? (
            <EmptyState title="No low-result searches recorded." />
          ) : (
            <DataTable>
              <thead>
                <tr>
                  <th>Query</th>
                  <th className="text-right">Searches</th>
                </tr>
              </thead>
              <tbody>
                {lowResultSearches.map((row, i) => (
                  <tr key={i}>
                    <td className="text-foreground">{row.query}</td>
                    <td className="text-right text-muted">{row._count.query}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </Section>
      </div>
    </Page>
  );
}
