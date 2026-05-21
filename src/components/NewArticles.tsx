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
    <div className="wiki-portal">
      <div className="wiki-portal-header">
        <span>New articles</span>
        <Link href="/articles" className="wiki-portal-header-link">All</Link>
      </div>
      <div className="wiki-portal-body p-0">
        <ul className="wiki-compact-list">
          {articles.map((a) => (
            <li key={a.id} className="wiki-compact-list-item">
              <Link href={`/articles/${a.slug}`} className="wiki-compact-list-title">
                {a.title}
              </Link>
              {a.category && (
                <Link href={`/categories/${a.category.slug}`} className="wiki-compact-list-meta">
                  {a.category.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
