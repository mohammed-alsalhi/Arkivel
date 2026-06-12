import prisma from "@/lib/prisma";
import Link from "next/link";
import { EmptyState, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader title="Article Series" />
      {allSeries.length === 0 ? (
        <EmptyState title="No series yet." />
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
                    <p className="text-sm text-muted mt-0.5">{s.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted flex-shrink-0">
                  {s._count.members} article{s._count.members !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
