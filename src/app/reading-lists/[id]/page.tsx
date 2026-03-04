import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export default async function ReadingListPage({ params }: Props) {
  const { id } = await params;
  const user = await getSession();

  const list = await prisma.readingList.findFirst({
    where: { id, OR: [{ isPublic: true }, ...(user ? [{ userId: user.id }] : [])] },
    include: {
      items: {
        include: { article: { select: { id: true, title: true, slug: true, excerpt: true } } },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!list) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/reading-lists/${id}`;

  return (
    <div>
      <div className="wiki-tabs">
        <Link href="/reading-lists" className="wiki-tab">Reading Lists</Link>
        <span className="wiki-tab wiki-tab-active">{list.name}</span>
      </div>
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-normal text-heading">{list.name}</h1>
            {list.description && <p className="text-sm text-muted mt-0.5">{list.description}</p>}
          </div>
          {list.isPublic && (
            <button
              onClick={undefined}
              title="Copy share link"
              className="text-xs border border-border rounded px-2 py-1 hover:bg-surface transition-colors"
              data-share-url={shareUrl}
            >
              Share link
            </button>
          )}
        </div>

        {list.items.length === 0 ? (
          <p className="text-sm text-muted">No articles in this list yet.</p>
        ) : (
          <ol className="space-y-2 list-decimal pl-5">
            {list.items.map((item, i) => (
              <li key={item.id} value={i + 1}>
                <Link href={`/articles/${item.article.slug}`} className="text-wiki-link hover:underline">
                  {item.article.title}
                </Link>
                {item.article.excerpt && (
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{item.article.excerpt}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
