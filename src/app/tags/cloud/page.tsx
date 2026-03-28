import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TagCloudPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });

  if (tags.length === 0) {
    return (
      <div>
        <h1 className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Tag cloud
        </h1>
        <p className="text-[13px] text-muted italic">No tags yet.</p>
      </div>
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
    <div>
      <div className="flex items-center gap-3 border-b border-border pb-1 mb-4">
        <h1 className="text-[1.7rem] font-normal text-heading flex-1" style={{ fontFamily: "var(--font-serif)" }}>
          Tag cloud
        </h1>
        <Link href="/tags" className="text-[12px] text-accent hover:underline">
          All tags
        </Link>
      </div>

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
    </div>
  );
}
