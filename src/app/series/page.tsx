import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SeriesIndexPage() {
  const allSeries = await prisma.articleSeries.findMany({
    orderBy: { name: "asc" },
    include: {
      members: {
        orderBy: { position: "asc" },
        take: 1,
        include: { article: { select: { slug: true } } },
      },
      _count: { select: { members: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Article Series</h1>
      {allSeries.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">No series yet.</p>
      ) : (
        <div className="space-y-3">
          {allSeries.map((s) => (
            <div key={s.id} className="border border-border rounded-lg p-4 hover:bg-muted/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/series/${s.slug}`} className="font-medium hover:underline">
                    {s.name}
                  </Link>
                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {s._count.members} article{s._count.members !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
