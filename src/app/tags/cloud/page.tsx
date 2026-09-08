import Link from "next/link";
import prisma from "@/lib/prisma";
import { EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TagCloudPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  if (tags.length === 0) {
    return (
      <Page>
        <PageHeader title="Tag cloud" />
        <EmptyState title="No tags yet." />
      </Page>
    );
  }

  const counts = tags.map((t) => t._count.articles);
  const max = Math.max(...counts, 1);
  const min = Math.min(...counts.filter((c) => c > 0), 1);

  function fontSize(count: number): string {
    if (max === min) return "1rem";
    const ratio = (count - min) / (max - min);
    const size = 0.8 + ratio * 1.6; // 0.8rem – 2.4rem
    return `${size.toFixed(2)}rem`;
  }

  function opacity(count: number): number {
    if (max === min) return 1;
    return 0.5 + 0.5 * ((count - min) / (max - min));
  }

  return (
    <Page>
      <PageHeader
        title="Tag cloud"
        actions={<LinkButton href="/tags">All tags</LinkButton>}
      />

      <div className="flex flex-wrap gap-x-3 gap-y-2 leading-loose">
        {tags.filter((t) => t._count.articles > 0).map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            title={`${tag._count.articles} article${tag._count.articles !== 1 ? "s" : ""}`}
            style={{
              fontSize: fontSize(tag._count.articles),
              opacity: opacity(tag._count.articles),
              color: tag.color ?? undefined,
            }}
            className="text-accent hover:underline transition-opacity"
          >
            {tag.name}
          </Link>
        ))}
      </div>

      <p className="text-[11px] text-muted mt-6">
        {tags.filter((t) => t._count.articles > 0).length} tags · font size proportional to article count
      </p>
    </Page>
  );
}
