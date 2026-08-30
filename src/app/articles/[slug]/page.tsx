import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ArticlePasswordWrapper from "@/components/ArticlePasswordWrapper";
import ArticleRightSidebar from "@/components/ArticleRightSidebar";
import InfoboxDisplay from "@/components/InfoboxDisplay";
import { addHeadingIds } from "@/components/TableOfContents";
import { isAdmin } from "@/lib/auth";
import { canViewArticle } from "@/lib/article-visibility";
import { config } from "@/lib/config";
import prisma from "@/lib/prisma";
import { resolveQueryBlocks } from "@/lib/queryblocks";
import { getBacklinks, resolveTransclusions, resolveWikiLinks } from "@/lib/wikilinks";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [article, canViewDrafts] = await Promise.all([
    prisma.article.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        summaryShort: true,
        coverImage: true,
        slug: true,
        published: true,
        status: true,
      },
    }),
    isAdmin(),
  ]);

  if (!article || !canViewArticle(article, canViewDrafts)) return { title: "Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return {
    title: article.title,
    description: article.summaryShort || article.excerpt || undefined,
    alternates: { canonical: `${baseUrl}/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt || `Read ${article.title} on ${config.name}`,
      type: "article",
      url: `${baseUrl}/articles/${article.slug}`,
      ...(article.coverImage ? { images: [{ url: article.coverImage }] } : {}),
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.excerpt || undefined,
    },
  };
}

function appendFootnoteSection(html: string): string {
  const footnotes: string[] = [];
  const regex = /data-footnote="([^"]*)"/g;
  let match;

  while ((match = regex.exec(html)) !== null) footnotes.push(match[1]);
  if (footnotes.length === 0) return html;

  const items = footnotes
    .map(
      (note, index) =>
        `<div class="footnote-item" style="padding-left:1.5rem"><sup style="position:absolute;left:0;font-weight:700;color:var(--color-accent)">[${index + 1}]</sup> ${note}</div>`,
    )
    .join("");

  return `${html}<div class="footnote-section"><div class="footnote-section-title">Notes</div>${items}</div>`;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const [article, adminFlag] = await Promise.all([
    prisma.article.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            parent: { include: { parent: true } },
          },
        },
        tags: { include: { tag: true } },
      },
    }),
    isAdmin(),
  ]);

  if (!article || !canViewArticle(article, adminFlag)) {
    const slugRedirect = await prisma.redirect.findUnique({ where: { fromSlug: slug } });
    if (slugRedirect) redirect(`/articles/${slugRedirect.toSlug}`);
    notFound();
  }
  if (article.redirectTo) redirect(`/articles/${article.redirectTo}`);

  const transcluded = await resolveTransclusions(article.content);
  const expandedContent = await resolveQueryBlocks(transcluded);

  const [resolvedContent, backlinks, allCategories] = await Promise.all([
    resolveWikiLinks(expandedContent),
    getBacklinks(slug),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: { children: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
  ]);

  const renderedContent = addHeadingIds(appendFootnoteSection(resolvedContent));
  const categoryPath = [article.category?.parent?.parent, article.category?.parent, article.category].filter(
    (category) => category !== null && category !== undefined,
  );
  const hasPageDetails = Boolean(
    adminFlag || article.coverImage || article.infobox || article.tags.length > 0,
  );

  return (
    <div id="top" className="article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            datePublished: article.createdAt.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            ...(article.excerpt ? { description: article.excerpt } : {}),
            ...(article.category ? { articleSection: article.category.name } : {}),
            ...(article.coverImage ? { image: article.coverImage } : {}),
          }),
        }}
      />

      <div className="article-reader-grid">
        <article className="article-shell article-reader" data-article-id={article.id}>
          <nav className="focused-breadcrumb" aria-label="Breadcrumb">
            {categoryPath.map((category, index) => (
              <span key={category.id}>
                {index > 0 && <span aria-hidden="true"> / </span>}
                <Link href={`/categories/${category.slug}`}>{category.name}</Link>
              </span>
            ))}
            {categoryPath.length > 0 && <span aria-hidden="true"> / </span>}
            <span aria-current="page">{article.title}</span>
          </nav>

          <header className="article-reader-header">
            <h1>{article.title}</h1>
          </header>

          {article.status !== "published" && (
            <div className="wiki-notice article-reader-notice">
              <strong>{article.status}</strong>
              <span>this page has not been published yet.</span>
            </div>
          )}

          {article.contentWarnings.length > 0 && (
            <div className="wiki-notice article-reader-notice">
              <strong>content note</strong>
              <span>{article.contentWarnings.join(", ")}</span>
            </div>
          )}

          <ArticlePasswordWrapper articleId={article.id} hasPassword={Boolean(article.accessPassword && !adminFlag)}>
            <div
              id="article-content"
              className="wiki-content article-reader-content"
              dir={article.dir === "rtl" ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {hasPageDetails && (
              <details className="article-reader-details">
                <summary>page details</summary>
                <nav className="article-reader-detail-actions" aria-label="Page actions">
                  {adminFlag && <Link href={`/articles/${slug}/edit`}>edit</Link>}
                  <Link href={`/articles/${slug}/history`}>history</Link>
                </nav>
                <InfoboxDisplay
                  title={article.title}
                  coverImage={article.coverImage}
                  coverFocalX={article.coverFocalX}
                  coverFocalY={article.coverFocalY}
                  category={article.category}
                  tags={article.tags.map(({ tag }) => tag)}
                  infobox={article.infobox as Record<string, string> | null}
                  allCategories={allCategories}
                  createdAt={article.createdAt}
                  updatedAt={article.updatedAt}
                />
              </details>
            )}
          </ArticlePasswordWrapper>
        </article>

        <ArticleRightSidebar slug={slug} backlinks={backlinks} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
