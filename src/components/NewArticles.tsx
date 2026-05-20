import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getNewArticles(limit = 6) {
  try {
    return await prisma.article.findMany({
      take: limit,
      where: { status: "published", redirectTo: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, createdAt: true, category: { select: { name: true, slug: true } } },
    });
  } catch {
    return [];
  }
}

export default async function NewArticles({ limit = 6 }: { limit?: number }) {
  const articles = await getNewArticles(limit);
  if (articles.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[12px] font-bold text-heading uppercase">
          New articles
        </h2>
        <Link href="/articles" className="text-[11px] text-muted hover:text-foreground transition-colors">
          All &rarr;
        </Link>
      </div>
      <ul className="space-y-1.5">
        {articles.map((a) => (
          <li key={a.id} className="text-[13px]">
            <Link href={`/articles/${a.slug}`} className="text-wiki-link hover:underline">
              {a.title}
            </Link>
            {a.category && (
              <span className="ml-1 text-[11px] text-muted">
                — <Link href={`/categories/${a.category.slug}`} className="hover:underline">{a.category.name}</Link>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
