import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StalenessPage() {
  const user = await getSession();
  if (!user || !await isAdmin()) redirect("/admin");

  // eslint-disable-next-line react-hooks/purity
  const cutoff = new Date(Date.now() - 180 * 86400000); // 6 months

  const articles = await prisma.article.findMany({
    where: { status: "published", updatedAt: { lt: cutoff } },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "asc" },
    take: 100,
  });

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Stale Articles
      </h1>
      <p className="text-sm text-muted mb-4">
        Published articles not updated in the past 6 months, sorted oldest first.
      </p>

      {articles.length === 0 ? (
        <p className="text-muted text-sm">No stale articles — great job keeping content fresh!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-hover">
                <th className="px-3 py-2 text-left font-medium">Article</th>
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-left font-medium">Last Updated</th>
                <th className="px-3 py-2 text-left font-medium w-24">Days Stale</th>
                <th className="px-3 py-2 text-left font-medium w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => {
                // eslint-disable-next-line react-hooks/purity
                const daysStale = Math.floor((Date.now() - a.updatedAt.getTime()) / 86400000);
                return (
                  <tr key={a.id} className="border-b border-border hover:bg-surface-hover">
                    <td className="px-3 py-2">
                      <Link href={`/articles/${a.slug}`} className="text-wiki-link hover:underline">
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted">{a.category?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-muted text-xs">{formatDate(a.updatedAt)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-medium ${daysStale > 365 ? "text-red-500" : "text-yellow-600"}`}
                      >
                        {daysStale}d
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/edit/${a.slug}`}
                        className="text-xs text-wiki-link hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
