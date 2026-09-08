import prisma from "@/lib/prisma";
import Link from "next/link";

type Props = { articleId: string; isAdmin: boolean };

export default async function SeeAlsoSection({ articleId, isAdmin }: Props) {
  const items = await prisma.seeAlso.findMany({
    where: { articleId },
    orderBy: { position: "asc" },
  });

  if (items.length === 0 && !isAdmin) return null;

  // Resolve titles for each target slug
  const slugs = items.map((i) => i.targetSlug);
  const articles = slugs.length
    ? await prisma.article.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, title: true },
      })
    : [];
  const bySlug = new Map(articles.map((a) => [a.slug, a.title]));

  return (
    <div className="mt-6 border-t border-border pt-4">
      <h3 className="text-sm font-semibold mb-2">See also</h3>
      {items.length === 0 ? (
        isAdmin && <p className="text-xs text-muted-foreground italic">No see-also links yet.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              <Link href={`/articles/${item.targetSlug}`} className="text-wiki-link hover:underline">
                {item.label || bySlug.get(item.targetSlug) || item.targetSlug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
