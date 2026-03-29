import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TagTrendsPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  // Get all tags with article counts per month (last 12 months)
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const tagArticles = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      articles: {
        where: { article: { status: "published", createdAt: { gte: since } } },
        select: { article: { select: { createdAt: true } } },
      },
      _count: { select: { articles: true } },
    },
    orderBy: { articles: { _count: "desc" } },
    take: 30,
  });

  // Build monthly buckets for the last 12 months
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  type TagRow = {
    id: string;
    name: string;
    slug: string;
    total: number;
    monthlyCounts: number[];
    maxCount: number;
  };

  const rows: TagRow[] = tagArticles.map((t) => {
    const monthlyCounts = months.map((m) =>
      t.articles.filter((a) => {
        const d = new Date(a.article.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === m;
      }).length
    );
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      total: t._count.articles,
      monthlyCounts,
      maxCount: Math.max(...monthlyCounts, 1),
    };
  });

  const shortMonths = months.map((m) => {
    const [y, mo] = m.split("-");
    const d = new Date(parseInt(y), parseInt(mo) - 1);
    return d.toLocaleString("en", { month: "short" });
  });

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Tag Usage Trends
      </h1>
      <p className="text-[13px] text-muted mb-4">
        New published articles per tag per month, last 12 months. Top 30 tags by total article count.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="text-muted border-b border-border">
              <th className="text-left pb-1 pr-3 font-medium text-[12px]">Tag</th>
              <th className="text-right pb-1 pr-3 font-medium w-12">Total</th>
              {shortMonths.map((m, i) => (
                <th key={i} className="text-center pb-1 px-0.5 font-medium w-8">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border-light hover:bg-surface-hover">
                <td className="py-1 pr-3">
                  <Link href={`/tags/${row.slug}`} className="text-wiki-link hover:underline font-medium">
                    {row.name}
                  </Link>
                </td>
                <td className="py-1 pr-3 text-right tabular-nums text-muted">{row.total}</td>
                {row.monthlyCounts.map((c, i) => (
                  <td key={i} className="py-1 px-0.5 text-center">
                    {c > 0 ? (
                      <span
                        className="inline-block rounded-sm text-[10px] font-mono"
                        style={{
                          width: "1.6rem",
                          height: "1.3rem",
                          lineHeight: "1.3rem",
                          background: `rgba(var(--color-accent-rgb, 99 102 241) / ${Math.min(1, 0.2 + (c / row.maxCount) * 0.8)})`,
                          color: c / row.maxCount > 0.5 ? "white" : "var(--color-foreground)",
                        }}
                      >
                        {c}
                      </span>
                    ) : (
                      <span className="text-muted">·</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
