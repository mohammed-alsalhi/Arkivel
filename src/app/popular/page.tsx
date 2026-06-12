import prisma from "@/lib/prisma";
import Link from "next/link";
import { EmptyState, Page, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PopularPage() {
  // Fetch published articles with read + reaction counts
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: { select: { name: true, slug: true } },
      _count: {
        select: {
          reads: true,
          reactions: true,
        },
      },
    },
  });

  // Score: reads * 2 + reactions
  const scored = articles
    .map((a) => ({
      ...a,
      score: a._count.reads * 2 + a._count.reactions,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  return (
    <Page>
      <PageHeader
        title="Popular Articles"
        description="Ranked by reads and reactions."
      />

      {scored.length === 0 ? (
        <EmptyState title="No activity recorded yet." />
      ) : (
        <ol className="space-y-3">
          {scored.map((article, i) => (
            <li key={article.id} className="flex items-start gap-4 border border-border rounded-lg px-4 py-3">
              <span className="text-2xl font-bold text-muted w-8 shrink-0 text-center leading-tight mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link href={`/articles/${article.slug}`} className="font-medium text-wiki-link hover:underline">
                  {article.title}
                </Link>
                {article.category && (
                  <span className="ml-2 text-xs text-muted">
                    <Link href={`/categories/${article.category.slug}`} className="hover:underline">
                      {article.category.name}
                    </Link>
                  </span>
                )}
                {article.excerpt && (
                  <p className="text-sm text-muted mt-0.5 truncate">{article.excerpt}</p>
                )}
              </div>
              <div className="text-xs text-muted shrink-0 text-right space-y-0.5">
                <div>{article._count.reads} reads</div>
                <div>{article._count.reactions} reactions</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Page>
  );
}
