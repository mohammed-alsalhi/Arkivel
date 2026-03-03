import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";
import { resolveWikiLinks, getBacklinks } from "@/lib/wikilinks";
import AdminEditTab from "@/components/AdminEditTab";
import ArticleExportButtons from "@/components/ArticleExportButtons";
import InfoboxDisplay from "@/components/InfoboxDisplay";
import TableOfContents, { addHeadingIds } from "@/components/TableOfContents";
import RelatedArticles from "@/components/RelatedArticles";
import WordCount from "@/components/WordCount";
import CopyButton from "@/components/CopyButton";
import ShareButton from "@/components/ShareButton";
import PrintButton from "@/components/PrintButton";
import BackToTop from "@/components/BackToTop";
import ReadingProgress from "@/components/ReadingProgress";
import Breadcrumb from "@/components/Breadcrumb";
import SpecialBlocksRenderer from "@/components/SpecialBlocksRenderer";
import SessionReadingTrail from "@/components/SessionReadingTrail";
import BookmarkButton from "@/components/BookmarkButton";
import AddToReadingList from "@/components/AddToReadingList";
import ArticleReactionBar from "@/components/ArticleReactionBar";
import CertifiedBadge from "@/components/CertifiedBadge";
import IssueLinkBadge from "@/components/IssueLinkBadge";
import ArticleExportMenu from "@/components/ArticleExportMenu";
import ScrollDepthTracker from "@/components/ScrollDepthTracker";
import ReaderPathTracker from "@/components/ReaderPathTracker";
import AudioNarrationPlayer from "@/components/AudioNarrationPlayer";
import DyslexiaToggle from "@/components/DyslexiaToggle";
import RTLToggle from "@/components/RTLToggle";
import TranslateButton from "@/components/TranslateButton";
import { htmlToSpeakableText } from "@/lib/tts";

// ISR: revalidate published articles every 5 minutes
export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, summaryShort: true, coverImage: true, slug: true },
  });

  if (!article) return { title: "Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return {
    title: `${article.title} — ${config.name}`,
    description: article.summaryShort || article.excerpt || undefined,
    alternates: {
      canonical: `${baseUrl}/articles/${article.slug}`,
    },
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
  let m;
  while ((m = regex.exec(html)) !== null) {
    footnotes.push(m[1]);
  }
  if (footnotes.length === 0) return html;

  const items = footnotes
    .map((note, i) => `<div class="footnote-item" style="padding-left:1.5rem"><sup style="position:absolute;left:0;font-weight:700;color:var(--color-accent)">[${i + 1}]</sup> ${note}</div>`)
    .join("");

  return html + `<div class="footnote-section"><div class="footnote-section-title">Notes</div>${items}</div>`;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article) notFound();
  if (article.redirectTo) redirect(`/articles/${article.redirectTo}`);

  const [resolvedContent, backlinks, allCategories] = await Promise.all([
    resolveWikiLinks(article.content),
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

  const lastRevision = await prisma.articleRevision.findFirst({
    where: { articleId: article.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, displayName: true } } },
  });

  return (
    <div>
      {/* JSON-LD structured data */}
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

      {/* Article tabs */}
      <div className="wiki-tabs">
        <span className="wiki-tab wiki-tab-active">Article</span>
        <AdminEditTab slug={slug} />
        <Link href={`/articles/${slug}/history`} className="wiki-tab">
          History
        </Link>
        <Link href={`/articles/${slug}/discussion`} className="wiki-tab">
          Discussion
        </Link>
      </div>

      {/* Article body in bordered content area */}
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <Breadcrumb items={[
          ...(article.category ? [{ label: article.category.name, href: `/categories/${article.category.slug}` }] : []),
          { label: article.title },
        ]} />

        {/* Article title */}
        <div className="flex items-start gap-2 border-b border-border pb-1 mb-0.5">
          <h1
            className="text-[1.7rem] font-normal text-heading flex-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {article.title}
          </h1>
          <div className="flex items-center gap-2 mt-2 shrink-0">
            <CertifiedBadge certifiedAt={article.certifiedAt} />
          </div>
        </div>

        {/* From World Wiki line + export buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] text-muted">
            <span>From {config.name} &mdash; Last edited {formatDate(article.updatedAt)}</span>
            {lastRevision?.user && (
              <span> by <a href={`/users/${lastRevision.user.username}`} className="text-wiki-link">{lastRevision.user.displayName || lastRevision.user.username}</a></span>
            )}
            <span className="ml-2"><WordCount html={article.content} /></span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/present/${article.slug}`}
              className="px-2 py-0.5 text-[11px] border border-border rounded hover:bg-surface transition-colors"
              title="Present this article as a slideshow"
            >
              Present
            </Link>
            <BookmarkButton articleId={article.id} />
            <AddToReadingList articleId={article.id} />
            <CopyButton text={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/articles/${article.slug}`} label="Copy link" />
            <ShareButton title={article.title} />
            <PrintButton />
            <ArticleExportButtons
              title={article.title}
              slug={article.slug}
              contentRaw={article.contentRaw}
              contentHtml={resolvedContent}
            />
            <ArticleExportMenu articleId={article.id} articleSlug={article.slug} />
            <DyslexiaToggle />
            <RTLToggle defaultDir={article.dir ?? "ltr"} />
            <TranslateButton articleId={article.id} />
          </div>
        </div>

        {/* Status badge */}
        {article.status !== "published" && (
          <div className={`wiki-notice ${article.status === "draft" ? "border-l-3 border-l-yellow-500" : "border-l-3 border-l-blue-500"}`}>
            <strong>{article.status === "draft" ? "Draft" : "Under Review"}</strong>
            {" — "} This article has not been published yet.
          </div>
        )}

        {/* Pinned indicator */}
        {article.isPinned && (
          <div className="text-[11px] text-muted mb-1">📌 Pinned article</div>
        )}

        {/* Disambiguation notice */}
        {article.isDisambiguation && (
          <div className="wiki-disambiguation-notice">
            <strong>{article.title}</strong> may refer to multiple subjects.
            This is a <em>disambiguation page</em> listing articles with similar names.
          </div>
        )}

        {/* Infobox */}
        <InfoboxDisplay
          title={article.title}
          coverImage={article.coverImage}
          category={article.category}
          tags={article.tags.map((t) => t.tag)}
          infobox={article.infobox as Record<string, string> | null}
          allCategories={allCategories}
          createdAt={article.createdAt}
          updatedAt={article.updatedAt}
        />

        {/* Audio narration */}
        <AudioNarrationPlayer
          articleId={article.id}
          articleText={htmlToSpeakableText(article.content).slice(0, 3000)}
        />

        {/* Table of contents */}
        <TableOfContents html={resolvedContent} />

        {/* Article content */}
        <div id="article-content" dir={article.dir ?? "ltr"}>
          <SpecialBlocksRenderer html={addHeadingIds(appendFootnoteSection(resolvedContent))} />
        </div>

        {/* Clear float from infobox */}
        <div className="clear-both" />

        {/* Categories bar at bottom */}
        <div className="wiki-categories">
          <strong>Categories: </strong>
          {article.category ? (
            <Link href={`/categories/${article.category.slug}`}>
              {article.category.name}
            </Link>
          ) : (
            <span className="italic">Uncategorized</span>
          )}
          {article.tags.length > 0 && (
            <>
              {" | "}
              {article.tags.map(({ tag }, i) => (
                <span key={tag.id}>
                  {i > 0 && " | "}
                  <Link href={`/tags/${tag.slug}`}>{tag.name}</Link>
                </span>
              ))}
            </>
          )}
        </div>

        {/* Issue links */}
        <IssueLinkBadge articleId={article.id} />

        {/* Reaction bar */}
        <ArticleReactionBar articleId={article.id} />

        {/* Fork this article */}
        <div className="mt-3 text-right">
          <Link
            href={`/api/articles/${article.id}/fork`}
            className="text-[11px] text-muted hover:text-wiki-link transition-colors"
            title="Fork this article to propose a complete rewrite"
            prefetch={false}
          >
            Fork this article
          </Link>
        </div>

        {/* Related articles */}
        <RelatedArticles
          articleId={article.id}
          categoryId={article.categoryId}
          tagIds={article.tags.map(t => t.tag.id)}
        />

        {/* What links here */}
        {backlinks.length > 0 && (
          <div className="mt-4">
            <h2
              className="text-base font-normal text-heading border-b border-border pb-1 mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              What links here
            </h2>
            <ul className="list-disc pl-6 text-[13px] space-y-0.5">
              {backlinks.map((link) => (
                <li key={link.id}>
                  <Link href={`/articles/${link.slug}`}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SessionReadingTrail slug={article.slug} title={article.title} />
        <ScrollDepthTracker articleId={article.id} />
        <ReaderPathTracker currentSlug={article.slug} />
        <BackToTop />
        <ReadingProgress />
      </div>
    </div>
  );
}
