import Link from "next/link";
import prisma from "@/lib/prisma";
import { EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  const maxCount = Math.max(...tags.map((t) => t._count.articles), 1);

  function sizeClass(count: number) {
    const ratio = count / maxCount;
    if (ratio > 0.6) return "tag-cloud-item-lg";
    if (ratio > 0.3) return "tag-cloud-item-md";
    return "tag-cloud-item-sm";
  }

  return (
    <Page>
      <PageHeader
        title="All Tags"
        description={`${tags.length} tags in the wiki`}
        actions={<LinkButton href="/tags/cloud">Tag cloud</LinkButton>}
      />

      {tags.length === 0 ? (
        <EmptyState title="No tags yet." />
      ) : (
        <div className="tag-cloud">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={`tag-cloud-item ${sizeClass(tag._count.articles)}`}
              style={tag.color ? { borderColor: tag.color } : undefined}
            >
              {tag.name}
              <span className="text-[10px] text-muted ml-1">({tag._count.articles})</span>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}

export const dynamic = "force-dynamic";
