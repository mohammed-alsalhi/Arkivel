import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;

  const series = await prisma.articleSeries.findUnique({
    where: { slug },
    include: {
      members: {
        orderBy: { position: "asc" },
        include: {
          article: { select: { id: true, title: true, slug: true, excerpt: true, status: true } },
        },
      },
    },
  });

  if (!series) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-muted-foreground mb-1">
        <Link href="/series" className="hover:underline">Series</Link>
      </p>
      <h1 className="text-2xl font-semibold mb-2">{series.name}</h1>
      {series.description && (
        <p className="text-muted-foreground mb-6">{series.description}</p>
      )}

      <ol className="space-y-3 mt-4">
        {series.members.map((m, i) => (
          <li key={m.id} className="flex gap-4 border border-border rounded-lg p-4 hover:bg-muted/30">
            <span className="text-2xl font-light text-muted-foreground w-8 flex-shrink-0 text-center">
              {i + 1}
            </span>
            <div>
              <Link href={`/articles/${m.article.slug}`} className="font-medium hover:underline">
                {m.article.title}
              </Link>
              {m.article.excerpt && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {m.article.excerpt}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
