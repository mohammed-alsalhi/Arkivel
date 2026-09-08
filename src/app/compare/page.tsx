import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { resolveWikiLinks } from "@/lib/wikilinks";
import { expandMacros } from "@/lib/macros";
import Link from "next/link";
import { Page, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ a?: string; b?: string }> };

export default async function CompareArticlesPage({ searchParams }: Props) {
  const { a, b } = await searchParams;

  if (!a || !b) {
    return (
      <Page>
        <PageHeader
          title="Compare Articles"
          description="Provide two article slugs to compare side by side."
        />
        <p className="text-[12px] text-muted font-mono">
          /compare?a=first-article&b=second-article
        </p>
      </Page>
    );
  }

  const [artA, artB] = await Promise.all([
    prisma.article.findUnique({ where: { slug: a }, select: { id: true, title: true, slug: true, content: true, updatedAt: true, category: { select: { name: true } } } }),
    prisma.article.findUnique({ where: { slug: b }, select: { id: true, title: true, slug: true, content: true, updatedAt: true, category: { select: { name: true } } } }),
  ]);

  if (!artA || !artB) notFound();

  const [htmlA, htmlB] = await Promise.all([
    expandMacros(artA.content).then(resolveWikiLinks),
    expandMacros(artB.content).then(resolveWikiLinks),
  ]);

  return (
    <Page>
      <PageHeader title="Compare Articles" />
      <div className="grid grid-cols-2 gap-4">
        {/* Header row */}
        {[{ art: artA, html: htmlA }, { art: artB, html: htmlB }].map(({ art }) => (
          <div key={art.id} className="border border-border rounded-t px-4 py-3 bg-muted/20">
            <Link href={`/articles/${art.slug}`} className="text-lg font-semibold text-wiki-link hover:underline">
              {art.title}
            </Link>
            <div className="text-[11px] text-muted mt-0.5">
              {art.category?.name && <span>{art.category.name} · </span>}
              Last edited {new Date(art.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {/* Content columns */}
        {[{ art: artA, html: htmlA }, { art: artB, html: htmlB }].map(({ art, html }) => (
          <div
            key={art.id}
            className="border border-t-0 border-border rounded-b px-4 py-4 overflow-auto max-h-[70vh] text-sm article-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </div>
    </Page>
  );
}
