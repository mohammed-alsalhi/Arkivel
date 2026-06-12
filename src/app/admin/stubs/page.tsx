import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(html: string) {
  return stripHtml(html).split(/\s+/).filter(Boolean).length;
}

export default async function AdminStubsPage({
  searchParams,
}: {
  searchParams: Promise<{ threshold?: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/login");

  const { threshold: thresholdParam } = await searchParams;
  const threshold = Math.max(1, parseInt(thresholdParam ?? "150", 10) || 150);

  const articles = await prisma.article.findMany({
    where: { status: { not: "draft" } },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const stubs = articles
    .map((a) => ({ ...a, wc: wordCount(a.content) }))
    .filter((a) => a.wc < threshold)
    .sort((a, b) => a.wc - b.wc);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-xl font-semibold">Stub Tracker</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <p className="text-sm text-muted-foreground">
          {stubs.length} article{stubs.length !== 1 ? "s" : ""} with fewer than {threshold} words
        </p>
        <form method="get" className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Threshold:</label>
          <input
            name="threshold"
            type="number"
            min={1}
            defaultValue={threshold}
            className="h-7 w-20 px-2 text-sm border border-border rounded bg-background"
          />
          <button type="submit" className="h-7 px-2 text-xs border border-border rounded hover:bg-muted">
            Update
          </button>
        </form>
      </div>

      {stubs.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No stub articles found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded overflow-hidden">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Title</th>
                <th className="text-left px-3 py-2 font-medium">Category</th>
                <th className="text-right px-3 py-2 font-medium">Words</th>
                <th className="text-left px-3 py-2 font-medium">Last updated</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {stubs.map((a) => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Link href={`/articles/${a.slug}`} className="hover:underline font-medium">
                      {a.title}
                    </Link>
                    <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 font-medium">
                      stub
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {a.category ? (
                      <Link href={`/categories/${a.category.slug}`} className="hover:underline">
                        {a.category.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{a.wc}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/articles/${a.slug}/edit`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Expand
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
