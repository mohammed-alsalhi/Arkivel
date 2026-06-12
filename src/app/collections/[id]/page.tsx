import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

export default async function CollectionPage({ params }: Props) {
  const { id } = await params;
  const user = await getSession();

  const collection = await prisma.smartCollection.findFirst({
    where: { id, OR: [{ isPublic: true }, ...(user ? [{ userId: user.id }] : [])] },
  });
  if (!collection) notFound();

  const q = collection.query as Record<string, unknown>;
  const articles = await prisma.article.findMany({
    where: {
      status: (q.status as string | undefined) || "published",
      ...(q.categoryId ? { categoryId: q.categoryId as string } : {}),
      ...(q.authorId ? { userId: q.authorId as string } : {}),
      ...(q.dateFrom || q.dateTo
        ? {
            createdAt: {
              ...(q.dateFrom ? { gte: new Date(q.dateFrom as string) } : {}),
              ...(q.dateTo ? { lte: new Date(q.dateTo as string) } : {}),
            },
          }
        : {}),
      ...(q.tags && Array.isArray(q.tags) && q.tags.length > 0
        ? { tags: { some: { tag: { slug: { in: q.tags as string[] } } } } }
        : {}),
    },
    select: { id: true, title: true, slug: true, excerpt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <Page>
      <PageHeader
        title={collection.name}
        description={<>{articles.length} article{articles.length !== 1 ? "s" : ""} • auto-updates</>}
        actions={<LinkButton href="/collections">Collections</LinkButton>}
      />

      {articles.length === 0 ? (
        <EmptyState description={<>No articles match this collection&apos;s criteria yet.</>} />
      ) : (
        <ul className="space-y-2">
          {articles.map((a) => (
            <li key={a.id} className="border border-border rounded p-3">
              <Link href={`/articles/${a.slug}`} className="text-wiki-link font-medium hover:underline">
                {a.title}
              </Link>
              {a.excerpt && <p className="text-xs text-muted mt-0.5 line-clamp-2">{a.excerpt}</p>}
              <p className="text-[10px] text-muted mt-1">Updated {formatDate(a.updatedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

export const dynamic = "force-dynamic";
