import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader
        title={list.name}
        description={list.description}
        actions={
          <>
            <LinkButton href="/reading-lists">Reading Lists</LinkButton>
            {list.isPublic && (
              <button
                onClick={undefined}
                title="Copy share link"
                className="ui-button"
                data-share-url={shareUrl}
              >
                Share link
              </button>
            )}
          </>
        }
      />

      {list.items.length === 0 ? (
        <EmptyState title="No articles in this list yet." />
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
    </Page>
  );
}

export const dynamic = "force-dynamic";
