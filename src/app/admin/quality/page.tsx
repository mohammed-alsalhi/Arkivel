import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { computeQualityScore } from "@/app/api/articles/[id]/quality-score/route";

export const dynamic = "force-dynamic";

export default async function AdminQualityPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/login");

  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const scored = articles
    .map((a) => ({ ...a, quality: computeQualityScore(a) }))
    .sort((a, b) => a.quality.score - b.quality.score); // worst first

  const colorMap: Record<string, string> = {
    Poor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    Fair: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    Good: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    Excellent: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-xl font-semibold">Article Quality</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        {scored.length} published articles sorted by quality score (worst first). Score is 0–100 based on word count, links, images, freshness, and excerpt.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded overflow-hidden">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Title</th>
              <th className="text-left px-3 py-2 font-medium">Category</th>
              <th className="text-center px-3 py-2 font-medium">Score</th>
              <th className="text-right px-3 py-2 font-medium">Words</th>
              <th className="text-right px-3 py-2 font-medium">Links</th>
              <th className="text-right px-3 py-2 font-medium">Images</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {scored.map((a) => {
              const wc = a.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length;
              const links = (a.content.match(/data-wiki-link=/g) || []).length;
              const images = (a.content.match(/<img/g) || []).length;
              return (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link href={`/articles/${a.slug}`} className="hover:underline font-medium">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {a.category?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${colorMap[a.quality.label]}`}>
                      {a.quality.score} · {a.quality.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-xs">{wc}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-xs">{links}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-xs">{images}</td>
                  <td className="px-3 py-2">
                    <Link href={`/articles/${a.slug}/edit`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
