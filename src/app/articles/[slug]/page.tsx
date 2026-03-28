import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { config } from "@/lib/config";
import { resolveWikiLinks, getBacklinks, resolveTransclusions } from "@/lib/wikilinks";
import { expandMacros } from "@/lib/macros";
import AdminEditTab from "@/components/AdminEditTab";
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
import { getSession, isAdmin } from "@/lib/auth";
import AnnotationLayer from "@/components/AnnotationLayer";
import ArticleSeriesNav from "@/components/ArticleSeriesNav";
import SeeAlsoSection from "@/components/SeeAlsoSection";
import ArticleChangelogPanel from "@/components/ArticleChangelogPanel";
import WordGoalBadge from "@/components/WordGoalBadge";
import YouMightAlsoLike from "@/components/YouMightAlsoLike";
import VerifyButton from "@/components/VerifyButton";
import TableOfContentsFloat from "@/components/TableOfContentsFloat";
import ArticleStatsPanel from "@/components/ArticleStatsPanel";
import ArticleFlags from "@/components/ArticleFlags";
import ReadingModeToggle from "@/components/ReadingModeToggle";
import DuplicateArticleButton from "@/components/DuplicateArticleButton";
import CopyMarkdownButton from "@/components/CopyMarkdownButton";
import ArticlePasswordWrapper from "@/components/ArticlePasswordWrapper";
import FreshnessBadge from "@/components/FreshnessBadge";
import ReadingLevelBadge from "@/components/ReadingLevelBadge";
import StreakTracker from "@/components/StreakTracker";
import { computeQualityScore } from "@/app/api/articles/[id]/quality-score/route";
import { resolveGlossaryTerms } from "@/lib/glossary";
import GlossaryTooltipLayer from "@/components/GlossaryTooltipLayer";
import HeadingPermalinks from "@/components/HeadingPermalinks";
import StickyArticleHeader from "@/components/StickyArticleHeader";
import ArticleViewHistory from "@/components/ArticleViewHistory";
import ArticleQA from "@/components/ArticleQA";
import SuggestEditButton from "@/components/SuggestEditButton";
import ReferrerTracker from "@/components/ReferrerTracker";
import ArticleRatingWidget from "@/components/ArticleRatingWidget";
import ArticleTodoList from "@/components/ArticleTodoList";
import ScrollPositionRestorer from "@/components/ScrollPositionRestorer";
import ExternalLinkTracker from "@/components/ExternalLinkTracker";
import PrefetchArticleLinks from "@/components/PrefetchArticleLinks";
import FontSizeControl from "@/components/FontSizeControl";
import FocusModeToggle from "@/components/FocusModeToggle";
import SpeedReader from "@/components/SpeedReader";
import ArticlePollWidget from "@/components/ArticlePollWidget";
import ArticleReadingETA from "@/components/ArticleReadingETA";
import NightModeToggle from "@/components/NightModeToggle";
import HighContrastToggle from "@/components/HighContrastToggle";
import TextOnlyToggle from "@/components/TextOnlyToggle";
import ContentWarningBanner from "@/components/ContentWarningBanner";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import FontPreference from "@/components/FontPreference";
import ArticleQuickNote from "@/components/ArticleQuickNote";
import CleanupTagsBanner from "@/components/CleanupTagsBanner";
import ArticleAdoptionBanner from "@/components/ArticleAdoptionBanner";
import CopyPlainTextButton from "@/components/CopyPlainTextButton";
import FeaturedArticleBadge from "@/components/FeaturedArticleBadge";

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
  const session = await getSession();

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article) {
    // Check the Redirect table — slug may have been renamed
    const slugRedirect = await prisma.redirect.findUnique({ where: { fromSlug: slug } });
    if (slugRedirect) redirect(`/articles/${slugRedirect.toSlug}`);
    notFound();
  }
  if (article.redirectTo) redirect(`/articles/${article.redirectTo}`);

  const macroExpanded = await expandMacros(article.content);
  const expandedContent = await resolveTransclusions(macroExpanded);
  const glossaryTerms = await prisma.glossaryTerm.findMany({ select: { term: true, definition: true, aliases: true } });
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

  const [lastRevision, recentRevisions, adminFlag, coAuthors, readCount, reactionCount] = await Promise.all([
    prisma.articleRevision.findFirst({
      where: { articleId: article.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, displayName: true } } },
    }),
    prisma.articleRevision.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        editSummary: true,
        createdAt: true,
        user: { select: { username: true, displayName: true } },
      },
    }),
    isAdmin(),
    prisma.articleCoAuthor.findMany({
      where: { articleId: article.id },
      select: { user: { select: { username: true, displayName: true } } },
      orderBy: { addedAt: "asc" },
    }),
    prisma.articleRead.count({ where: { articleId: article.id } }),
    prisma.articleReaction.count({ where: { articleId: article.id } }),
  ]);

  const quality = computeQualityScore({ content: article.content, excerpt: article.excerpt ?? null, updatedAt: article.updatedAt });

  // word count for goal badge + reading time
  const plainTextWords = article.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.round(plainTextWords / 200));

  // expiry warning: reviewDueAt within 30 days
  const now30 = new Date();
  now30.setDate(now30.getDate() + 30);
  const showExpiryWarning = article.reviewDueAt && article.reviewDueAt <= now30 && article.reviewDueAt > new Date();

  // article age in days (computed server-side to avoid react-hooks/purity lint)
  const articleAgeDays = Math.floor((now30.getTime() - 30 * 86400000 - article.createdAt.getTime()) / 86400000);

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
        <Link href={`/articles/${slug}/blame`} className="wiki-tab">
          Blame
        </Link>
      </div>

      {/* Article body in bordered content area */}
      <div className="border border-t-0 border-border bg-surface px-5 py-4">
        <Breadcrumb items={[
          ...(article.category ? [{ label: article.category.name, href: `/categories/${article.category.slug}` }] : []),
          { label: article.title },
        ]} />

        <StickyArticleHeader title={article.title} slug={article.slug} isAdmin={adminFlag} />

        {/* Article title */}
        <div className="flex items-start gap-2 border-b border-border pb-1 mb-0.5">
          <h1
            id="article-h1"
            className="text-[1.7rem] font-normal text-heading flex-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {article.title}
          </h1>
          <div className="flex items-center gap-2 mt-2 shrink-0">
            <CertifiedBadge certifiedAt={article.certifiedAt} />
            {article.isFeatured && <FeaturedArticleBadge />}
          </div>
        </div>

        {/* From World Wiki line + export buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] text-muted">
            <span>From {config.name} &mdash; Last edited {formatDate(article.updatedAt)}</span>
            <span className="ml-2"><FreshnessBadge updatedAt={article.updatedAt} /></span>
            {lastRevision?.user && (
              <span> by <a href={`/users/${lastRevision.user.username}`} className="text-wiki-link">{lastRevision.user.displayName || lastRevision.user.username}</a></span>
            )}
            <span className="ml-2"><WordCount html={article.content} /></span>
            <span className="ml-2">· ~{readingTimeMin} min read</span>
            <span className="ml-2"><ArticleReadingETA wordCount={plainTextWords} /></span>
            <span className="ml-2"><ReadingLevelBadge text={article.content.replace(/<[^>]+>/g, " ")} /></span>
            <ArticleViewHistory slug={article.slug} title={article.title} />
            {article.lastVerifiedAt && (
              <span className="ml-2 inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Verified {new Date(article.lastVerifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* — Navigate — */}
            <Link
              href={`/present/${article.slug}`}
              className="flex items-center h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              title="Present as slideshow"
            >
              Present
            </Link>

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* — Save / collect — */}
            <BookmarkButton articleId={article.id} />
            <AddToReadingList articleId={article.id} />

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* — Share / output — */}
            <CopyButton text={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/articles/${article.slug}`} label="Copy link" />
            <ShareButton title={article.title} />
            <PrintButton />
            <ArticleExportMenu
              articleId={article.id}
              articleSlug={article.slug}
              articleTitle={article.title}
              contentRaw={article.contentRaw}
              contentHtml={resolvedContent}
            />

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* — Reading tools — */}
            <FontSizeControl />
            <FocusModeToggle />
            <NightModeToggle />
            <HighContrastToggle />
            <TextOnlyToggle />
            <SpeedReader articleId={article.id} />
            <DyslexiaToggle />
            <RTLToggle defaultDir={article.dir ?? "ltr"} />
            <TranslateButton articleId={article.id} />
            <ReadingModeToggle />
            <CopyMarkdownButton markdown={article.contentRaw} title={article.title} />
            <CopyPlainTextButton html={resolvedContent} />
            <FontPreference />
            <ThemeCustomizer />

            <span className="w-px h-4 bg-border mx-0.5" />

            {/* — Admin tools — */}
            <DuplicateArticleButton articleId={article.id} />
          </div>
        </div>

        {/* Co-authors */}
        {coAuthors.length > 0 && (
          <div className="text-[11px] text-muted-foreground mb-1">
            Co-authored by{" "}
            {coAuthors.map((ca, i) => (
              <span key={i}>
                {i > 0 && ", "}
                <a href={`/users/${ca.user.username}`} className="text-wiki-link hover:underline">
                  {ca.user.displayName || ca.user.username}
                </a>
              </span>
            ))}
          </div>
        )}

        {/* Article flags */}
        <ArticleFlags flags={article.flags} />

        {/* Status badge */}
        {article.status !== "published" && (
          <div className={`wiki-notice ${article.status === "draft" ? "border-l-3 border-l-yellow-500" : "border-l-3 border-l-blue-500"}`}>
            <strong>{article.status === "draft" ? "Draft" : "Under Review"}</strong>
            {" — "} This article has not been published yet.
          </div>
        )}

        {/* Expiry warning banner */}
        {showExpiryWarning && (
          <div className="wiki-notice border-l-3 border-l-yellow-500 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>This article is due for review by <strong>{new Date(article.reviewDueAt!).toLocaleDateString()}</strong>. Please verify its accuracy.</span>
          </div>
        )}

        {/* Pinned indicator */}
        {article.isPinned && (
          <div className="text-[11px] text-muted mb-1 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
            </svg>
            Pinned article
          </div>
        )}

        {/* Disambiguation notice */}
        {article.isDisambiguation && (
          <div className="wiki-disambiguation-notice">
            <strong>{article.title}</strong> may refer to multiple subjects.
            This is a <em>disambiguation page</em> listing articles with similar names.
          </div>
        )}

        {/* Article body — password-gated for non-admins when accessPassword is set */}
        <ArticlePasswordWrapper
          articleId={article.id}
          hasPassword={!!article.accessPassword && !adminFlag}
        >

        {/* Infobox */}
        <InfoboxDisplay
          title={article.title}
          coverImage={article.coverImage}
          coverFocalX={article.coverFocalX}
          coverFocalY={article.coverFocalY}
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

        {/* In Brief summary box */}
        {article.summaryShort && (
          <div className="wiki-in-brief">
            <strong>In brief:</strong> {article.summaryShort}
          </div>
        )}

        {/* Table of contents */}
        <TableOfContents html={resolvedContent} />

        {/* Cleanup tags */}
        {article.cleanupTags && article.cleanupTags.length > 0 && (
          <CleanupTagsBanner tags={article.cleanupTags} />
        )}

        {/* Abandoned / adoption notice */}
        {article.isAbandoned && (
          <ArticleAdoptionBanner articleId={article.id} adoptedBy={article.adoptedBy ?? null} />
        )}

        {/* Content warnings */}
        {article.contentWarnings && article.contentWarnings.length > 0 && (
          <ContentWarningBanner warnings={article.contentWarnings} />
        )}

        {/* Article content */}
        <div id="article-content" dir={article.dir ?? "ltr"} className="relative">
          <SpecialBlocksRenderer html={addHeadingIds(appendFootnoteSection(resolveGlossaryTerms(resolvedContent, glossaryTerms)))} />
          <GlossaryTooltipLayer />
          <HeadingPermalinks />
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

        {/* Star rating */}
        <ArticleRatingWidget articleId={article.id} />

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

        {/* Series navigation */}
        <ArticleSeriesNav articleId={article.id} />

        {/* Word goal progress */}
        {article.wordGoal && (
          <WordGoalBadge wordGoal={article.wordGoal} currentWords={plainTextWords} />
        )}

        {/* Article stats panel */}
        <ArticleStatsPanel
          articleId={article.id}
          reads={readCount}
          reactions={reactionCount}
          qualityScore={quality.score}
          qualityLabel={quality.label}
          ageDays={articleAgeDays}
          wordCount={plainTextWords}
        />

        {/* Changelog panel */}
        <ArticleChangelogPanel slug={article.slug} revisions={recentRevisions.map(r => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))} />

        {/* See also */}
        <SeeAlsoSection articleId={article.id} isAdmin={adminFlag} />

        {/* You might also like */}
        <YouMightAlsoLike
          articleId={article.id}
          tagIds={article.tags.map(t => t.tag.id)}
        />

        {/* Verify button (admin only) */}
        {adminFlag && (
          <VerifyButton articleId={article.id} lastVerifiedAt={article.lastVerifiedAt?.toISOString() ?? null} />
        )}

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

        </ArticlePasswordWrapper>

        <div className="mt-2 text-right">
          <SuggestEditButton articleId={article.id} />
        </div>
        <ArticleTodoList articleId={article.id} isAdmin={adminFlag} />
        <ArticleQuickNote articleId={article.id} />
        <ArticlePollWidget articleId={article.id} isAdmin={adminFlag} />
        <ArticleQA articleSlug={article.slug} />
        <SessionReadingTrail slug={article.slug} title={article.title} />
        <ScrollDepthTracker articleId={article.id} />
        <ReferrerTracker articleId={article.id} />
        <ReaderPathTracker currentSlug={article.slug} />
        <StreakTracker />
        <ScrollPositionRestorer slug={article.slug} />
        <ExternalLinkTracker articleId={article.id} />
        <PrefetchArticleLinks />
        <AnnotationLayer articleId={article.id} isLoggedIn={!!session} />
        <BackToTop />
        <ReadingProgress />
      </div>

      {/* Floating TOC — rendered outside the padded box so it can be fixed */}
      <TableOfContentsFloat html={resolvedContent} />
    </div>
  );
}

export const dynamic = "force-dynamic";
