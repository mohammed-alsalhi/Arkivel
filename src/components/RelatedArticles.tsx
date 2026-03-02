import Link from "next/link";
import prisma from "@/lib/prisma";

type Props = {
  articleId: string;
  categoryId: string | null;
  tagIds: string[];
};

export default async function RelatedArticles({ articleId, categoryId, tagIds }: Props) {
  if (!categoryId && tagIds.length === 0) return null;

  // Find articles sharing the same category or tags
  const related = await prisma.article.findMany({
    where: {
      id: { not: articleId },
      published: true,
      OR: [
        ...(categoryId ? [{ categoryId }] : []),
        ...(tagIds.length > 0 ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      tags: { select: { tagId: true } },
    },
    take: 20,
  });

  if (related.length === 0) return null;

  // Rank by tag overlap count
  const ranked = related
    .map((a) => ({
      ...a,
      overlap: a.tags.filter((t) => tagIds.includes(t.tagId)).length + (categoryId ? 1 : 0),
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5);

  return (
    <div className="mt-4">
      <h2
        className="text-base font-normal text-heading border-b border-border pb-1 mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Related articles
      </h2>
      <ul className="list-disc pl-6 text-[13px] space-y-0.5">
        {ranked.map((a) => (
          <li key={a.id}>
            <Link href={`/articles/${a.slug}`}>{a.title}</Link>
            {a.excerpt && (
              <span className="text-muted ml-1">
                &mdash; {a.excerpt.slice(0, 80)}{a.excerpt.length > 80 ? "..." : ""}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
