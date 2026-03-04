import Link from "next/link";
import prisma from "@/lib/prisma";
import { semanticSearch } from "@/lib/embeddings";

type Props = { searchParams: Promise<{ from?: string }> };

export default async function ExplorePage({ searchParams }: Props) {
  const { from } = await searchParams;

  let article;
  const trail: string[] = [];

  if (from) {
    // Try semantic walk: find articles similar to the current one
    const current = await prisma.article.findUnique({
      where: { slug: from, status: "published" },
      select: { title: true, summary: true, summaryShort: true, content: true },
    });

    if (current) {
      const queryText = current.summaryShort || current.title;
      const semanticResults = process.env.OPENAI_API_KEY
        ? await semanticSearch(queryText, 10)
        : [];

      const excludeSlugs = [from];
      const candidates = semanticResults
        .map((r) => r.slug)
        .filter((s): s is string => !!s && !excludeSlugs.includes(s));

      if (candidates.length > 0) {
        // eslint-disable-next-line react-hooks/purity
        const randomSlug = candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];
        article = await prisma.article.findUnique({
          where: { slug: randomSlug, status: "published" },
          select: { title: true, slug: true, excerpt: true, summaryShort: true },
        });
      }
    }
  }

  // Fallback to random published article
  if (!article) {
    const count = await prisma.article.count({ where: { status: "published" } });
    // eslint-disable-next-line react-hooks/purity
    const skip = Math.floor(Math.random() * count);
    article = await prisma.article.findFirst({
      where: { status: "published" },
      select: { title: true, slug: true, excerpt: true, summaryShort: true },
      skip,
    });
  }

  return (
    <div>
      <div className="wiki-tabs">
        <span className="wiki-tab wiki-tab-active">Explore</span>
      </div>
      <div className="border border-t-0 border-border bg-surface px-5 py-4 text-center py-16">
        <p className="text-xs text-muted uppercase tracking-widest mb-6">Guided Explore</p>
        {article ? (
          <>
            <h1 className="text-2xl font-normal text-heading mb-2">{article.title}</h1>
            <p className="text-sm text-muted mb-6 max-w-lg mx-auto">
              {article.summaryShort || article.excerpt || "Discover something new."}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href={`/articles/${article.slug}`}
                className="px-5 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
              >
                Read this article
              </Link>
              <Link
                href={`/explore?from=${article.slug}`}
                className="px-5 py-2 border border-border rounded hover:bg-surface transition-colors"
              >
                Take me somewhere else →
              </Link>
            </div>
            {from && (
              <p className="text-[11px] text-muted mt-6">
                Navigated from <Link href={`/articles/${from}`} className="text-wiki-link hover:underline">{from}</Link>
              </p>
            )}
          </>
        ) : (
          <p className="text-muted">No articles available to explore.</p>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
