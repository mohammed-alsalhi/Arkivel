import Link from "next/link";
import prisma from "@/lib/prisma";
import { semanticSearch } from "@/lib/embeddings";
import { LinkButton, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader kicker="Guided Explore" title="Explore" />
      <div className="border border-border bg-surface px-5 text-center py-16">
        {article ? (
          <>
            <h2 className="text-2xl font-normal text-heading mb-2">{article.title}</h2>
            <p className="text-sm text-muted mb-6 max-w-lg mx-auto">
              {article.summaryShort || article.excerpt || "Discover something new."}
            </p>
            <div className="flex items-center justify-center gap-4">
              <LinkButton href={`/articles/${article.slug}`} variant="primary">
                Read this article
              </LinkButton>
              <LinkButton href={`/explore?from=${article.slug}`}>
                Take me somewhere else →
              </LinkButton>
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
    </Page>
  );
}

export const dynamic = "force-dynamic";
