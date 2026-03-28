import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Content gap analysis
      </h1>
      <p className="text-[13px] text-muted mb-6">
        Search queries that returned zero or very few results — these represent gaps in your wiki&apos;s coverage.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Zero results */}
        <div>
          <h2 className="text-[14px] font-semibold text-heading mb-2">
            Zero-result searches
            <span className="ml-2 text-[11px] text-muted font-normal">({zeroResultSearches.length} unique queries)</span>
          </h2>
          {zeroResultSearches.length === 0 ? (
            <p className="text-[13px] text-muted italic">No zero-result searches recorded.</p>
          ) : (
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-3 py-1.5 text-muted font-medium">Query</th>
                    <th className="text-right px-3 py-1.5 text-muted font-medium">Searches</th>
                  </tr>
                </thead>
                <tbody>
                  {zeroResultSearches.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "" : "bg-surface"}>
                      <td className="px-3 py-1.5 text-foreground">{row.query}</td>
                      <td className="px-3 py-1.5 text-right text-muted">{row._count.query}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low results */}
        <div>
          <h2 className="text-[14px] font-semibold text-heading mb-2">
            Low-result searches (1–3)
            <span className="ml-2 text-[11px] text-muted font-normal">({lowResultSearches.length} unique queries)</span>
          </h2>
          {lowResultSearches.length === 0 ? (
            <p className="text-[13px] text-muted italic">No low-result searches recorded.</p>
          ) : (
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="text-left px-3 py-1.5 text-muted font-medium">Query</th>
                    <th className="text-right px-3 py-1.5 text-muted font-medium">Searches</th>
                  </tr>
                </thead>
                <tbody>
                  {lowResultSearches.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "" : "bg-surface"}>
                      <td className="px-3 py-1.5 text-foreground">{row.query}</td>
                      <td className="px-3 py-1.5 text-right text-muted">{row._count.query}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
