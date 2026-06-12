import prisma from "@/lib/prisma";
import Link from "next/link";
import { EmptyState, Page, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ article?: string; author?: string }> };

export default async function DiscussionsIndexPage({ searchParams }: Props) {
  const { article: articleFilter, author: authorFilter } = await searchParams;

  const discussions = await prisma.discussion.findMany({
    where: {
      parentId: null, // top-level only
      ...(articleFilter
        ? { article: { slug: articleFilter } }
        : {}),
      ...(authorFilter
        ? { OR: [{ author: { contains: authorFilter, mode: "insensitive" } }, { user: { username: { contains: authorFilter, mode: "insensitive" } } }] }
        : {}),
    },
    select: {
      id: true,
      content: true,
      author: true,
      createdAt: true,
      article: { select: { title: true, slug: true } },
      user: { select: { username: true, displayName: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <Page>
      <PageHeader
        title="All Discussions"
        description={
          <>
            Open threads across all articles.{" "}
            {articleFilter && <span>Filtered by article: <strong>{articleFilter}</strong>. </span>}
            {authorFilter && <span>Filtered by author: <strong>{authorFilter}</strong>.</span>}
          </>
        }
      />

      {discussions.length === 0 ? (
        <EmptyState title="No discussions found." />
      ) : (
        <ul className="space-y-3">
          {discussions.map((d) => (
            <li key={d.id} className="border border-border rounded-lg px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Link href={`/articles/${d.article.slug}/discussion`} className="text-sm font-medium text-wiki-link hover:underline">
                  {d.article.title}
                </Link>
                <span className="text-[11px] text-muted">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-foreground line-clamp-2">{d.content}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted">
                <span>
                  by{" "}
                  {d.user ? (
                    <Link href={`/users/${d.user.username}`} className="text-wiki-link hover:underline">
                      {d.user.displayName || d.user.username}
                    </Link>
                  ) : (
                    d.author
                  )}
                </span>
                {d._count.replies > 0 && (
                  <span>{d._count.replies} {d._count.replies === 1 ? "reply" : "replies"}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
