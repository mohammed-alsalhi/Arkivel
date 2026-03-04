import Link from "next/link";
import prisma from "@/lib/prisma";

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
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        All Tags
      </h1>
      <p className="text-[12px] text-muted mb-4">{tags.length} tags in the wiki</p>

      {tags.length === 0 ? (
        <div className="border border-border bg-surface p-8 text-center text-muted italic">
          No tags yet.
        </div>
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
    </div>
  );
}

export const dynamic = "force-dynamic";
