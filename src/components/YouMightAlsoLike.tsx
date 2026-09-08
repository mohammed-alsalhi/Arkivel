import prisma from "@/lib/prisma";
import Link from "next/link";

type Props = {
  articleId: string;
  tagIds: string[];
};

export default async function YouMightAlsoLike({ articleId, tagIds }: Props) {
  if (tagIds.length === 0) return null;

  const suggestions = await prisma.article.findMany({
    where: {
      id: { not: articleId },
      status: "published",
      tags: { some: { tagId: { in: tagIds } } },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: { include: { tag: true } },
    },
    take: 5,
    orderBy: { updatedAt: "desc" },
  });

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6">
      <h2
        className="text-base font-normal text-heading border-b border-border pb-1 mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        You might also like
      </h2>
      <ul className="space-y-2">
        {suggestions.map((a) => (
          <li key={a.id} className="flex items-start gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-muted-foreground shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <div className="min-w-0">
              <Link href={`/articles/${a.slug}`} className="text-sm text-wiki-link hover:underline">
                {a.title}
              </Link>
              {a.excerpt && (
                <p className="text-xs text-muted-foreground truncate">{a.excerpt}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
