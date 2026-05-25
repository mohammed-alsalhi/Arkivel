import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { config } from "@/lib/config";
import { resolveWikiLinks, getBacklinks, resolveTransclusions } from "@/lib/wikilinks";
import { expandMacros } from "@/lib/macros";
import AdminEditTab from "@/components/AdminEditTab";
import InfoboxDisplay from "@/components/InfoboxDisplay";
import TableOfContents, { addHeadingIds } from "@/components/TableOfContents";
import RelatedArticles from "@/components/RelatedArticles";
import CopyButton from "@/components/CopyButton";
import ShareButton from "@/components/ShareButton";
import PrintButton from "@/components/PrintButton";
import BackToTop from "@/components/BackToTop";
import ReadingProgress from "@/components/ReadingProgress";
import Breadcrumb from "@/components/Breadcrumb";
import SessionReadingTrail from "@/components/SessionReadingTrail";
import BookmarkButton from "@/components/BookmarkButton";
import AddToReadingList from "@/components/AddToReadingList";
import ArticleReactionBar from "@/components/ArticleReactionBar";
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
import StreakTracker from "@/components/StreakTracker";
import { computeQualityScore } from "@/app/api/articles/[id]/quality-score/route";
import { resolveGlossaryTerms } from "@/lib/glossary";
import StickyArticleHeader from "@/components/StickyArticleHeader";
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
import ArticleWidthPreference from "@/components/ArticleWidthPreference";
import ImageLightbox from "@/components/ImageLightbox";
import SeriesTableOfContents from "@/components/SeriesTableOfContents";
import WordFrequencyCloud from "@/components/WordFrequencyCloud";
import ArticleActionPanel from "@/components/article/ArticleActionPanel";
import ArticlePageHeader from "@/components/article/ArticlePageHeader";
import ArticleTaxonomyFooter from "@/components/article/ArticleTaxonomyFooter";
import TabsActivator from "@/components/article/TabsActivator";
import WikiChatAssistant from "@/components/article/WikiChatAssistant";
import ArticleQuizMode from "@/components/article/ArticleQuizMode";
import ArticleBodyWithReadingLevel from "@/components/article/ArticleBodyWithReadingLevel";
import ReviewEnrollButton from "@/components/article/ReviewEnrollButton";
import ReviewRequestButton from "@/components/article/ReviewRequestButton";
import ClaimsPanel from "@/components/article/ClaimsPanel";
import TutorButton from "@/components/article/TutorButton";
import AudioNarration from "@/components/article/AudioNarration";
import FactCheckPanel from "@/components/article/FactCheckPanel";
import SpaceGovernanceBadges from "@/components/article/SpaceGovernanceBadges";
import ArticleRightSidebar from "@/components/ArticleRightSidebar";
import { resolveQueryBlocks } from "@/lib/queryblocks";
import { ACTIVE_REVIEW_STATUSES } from "@/lib/reviews";
import { defaultGlobalSpaceGovernance, resolveSpaceGovernanceInheritance, type SpaceGovernanceValues } from "@/lib/space-governance";

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
    title: article.title,
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
  const transcluded = await resolveTransclusions(macroExpanded);
  const expandedContent = await resolveQueryBlocks(transcluded);
  const glossaryTerms = await prisma.glossaryTerm.findMany({ select: { term: true, definition: true, aliases: true } });
  const [resolvedContent, backlinks, allCategories, governanceCategories] = await Promise.all([
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
    prisma.category.findMany({ include: { governance: true } }),
  ]);
  const governance = article.categoryId
    ? resolveArticleGovernance(governanceCategories, article.categoryId)
    : resolveSpaceGovernanceInheritance({ categoryChain: [], globalDefaults: defaultGlobalSpaceGovernance() });

  const [lastRevision, recentRevisions, adminFlag, coAuthors, readCount, reactionCount, activeReview] = await Promise.all([
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
    prisma.reviewRequest.findFirst({
      where: {
        articleId: article.id,
        status: { in: ACTIVE_REVIEW_STATUSES },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        reviewer: {
          select: { username: true, displayName: true },
        },
      },
    }),
  ]);

  const quality = computeQualityScore({ content: article.content, excerpt: article.excerpt ?? null, updatedAt: article.updatedAt });

  // stats used in byline + progress chips
  const plainText = article.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const plainTextWords = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const plainTextChars = plainText.length;
  const readingTimeMin = Math.max(1, Math.round(plainTextWords / 200));
  const canRequestReview = session?.role === "admin" || session?.role === "editor";

  // expiry warning: reviewDueAt within 30 days
  const now30 = new Date();
  now30.setDate(now30.getDate() + 30);
  const showExpiryWarning = article.reviewDueAt && article.reviewDueAt <= now30 && article.reviewDueAt > new Date();

  // article age in days (computed server-side to avoid react-hooks/purity lint)
  const articleAgeDays = Math.floor((now30.getTime() - 30 * 86400000 - article.createdAt.getTime()) / 86400000);

  return (
    <div id="top" className="article-page">
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
      <nav className="article-tabbar" aria-label="Article sections">
        <span className="article-tab article-tab-active">Article</span>
        <AdminEditTab slug={slug} className="article-tab" />
        <Link href={`/articles/${slug}/history`} className="article-tab">
          History
        </Link>
        <Link href={`/articles/${slug}/discussion`} className="article-tab">
          Discussion
        </Link>
        <Link href={`/articles/${slug}/blame`} className="article-tab">
          Blame
        </Link>
      </nav>

      <article className="article-shell" data-article-id={article.id}>
        <Breadcrumb items={[
          ...(article.category ? [{ label: article.category.name, href: `/categories/${article.category.slug}` }] : []),
          { label: article.title },
        ]} />

        <StickyArticleHeader title={article.title} slug={article.slug} isAdmin={adminFlag} />

        <ArticlePageHeader
          title={article.title}
          slug={article.slug}
          excerpt={article.excerpt}
          category={article.category}
          updatedAt={article.updatedAt}
          lastRevisionUser={lastRevision?.user ?? null}
          coAuthors={coAuthors}
          words={plainTextWords}
          characters={plainTextChars}
          readingTimeMin={readingTimeMin}
          plainText={plainText}
          readCount={readCount}
          reactionCount={reactionCount}
          certifiedAt={article.certifiedAt}
          isFeatured={article.isFeatured}
          status={article.status}
          lastVerifiedAt={article.lastVerifiedAt}
        />

        <ArticleActionPanel
          groups={[
            {
              label: "Navigate",
              children: (
                <Link href={`/present/${article.slug}`} className="ui-button" title="Present as slideshow">
                  Present
                </Link>
              ),
            },
            ...(canRequestReview
              ? [
                  {
                    label: "Workflow",
                    children: (
                      <ReviewRequestButton
                        articleId={article.id}
                        articleTitle={article.title}
                        activeReview={activeReview}
                      />
                    ),
                  },
                ]
              : []),
            {
              label: "Collect",
              children: (
                <>
                  <BookmarkButton articleId={article.id} />
                  <AddToReadingList articleId={article.id} />
                </>
              ),
            },
            {
              label: "Share",
              children: (
                <>
                  <CopyButton text={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/articles/${article.slug}`} label="Copy link" />
                  <ShareButton title={article.title} />
                  <PrintButton />
                  <ArticleExportMenu
                    articleId={article.id}
                    articleSlug={article.slug}
                    articleTitle={article.title}
                    contentRaw={article.contentRaw}
                    contentHtml={resolvedContent}
                  />
                </>
              ),
            },
            {
              label: "Read",
              children: (
                <>
                  <FontSizeControl />
                  <FontPreference />
                  <FocusModeToggle />
                  <NightModeToggle />
                  <HighContrastToggle />
                  <TextOnlyToggle />
                  <DyslexiaToggle />
                  <RTLToggle defaultDir={article.dir ?? "ltr"} />
                  <ReadingModeToggle />
                  <ArticleWidthPreference />
                  <ThemeCustomizer />
                </>
              ),
            },
            {
              label: "Tools",
              children: (
                <>
                  <AudioNarration html={resolvedContent} title={article.title} />
                  <SpeedReader articleId={article.id} />
                  <ArticleQuizMode articleId={article.id} articleTitle={article.title} />
                  <TutorButton articleId={article.id} articleTitle={article.title} />
                  <ReviewEnrollButton articleId={article.id} />
                  <TranslateButton articleId={article.id} />
                  <CopyMarkdownButton markdown={article.contentRaw} title={article.title} />
                  <CopyPlainTextButton html={resolvedContent} />
                  <DuplicateArticleButton articleId={article.id} />
                </>
              ),
            },
          ]}
        />

        <div className="article-notice-stack">
          <ArticleFlags flags={article.flags} />
          <SpaceGovernanceBadges badges={governance.badges} />

          {article.status !== "published" && (
            <div className={`wiki-notice article-status-notice ${article.status === "draft" ? "article-status-notice-warning" : "article-status-notice-info"}`}>
              <strong>{article.status === "draft" ? "Draft" : "Under Review"}</strong>
              {" - "}This article has not been published yet.
            </div>
          )}

          {showExpiryWarning && (
            <div className="wiki-notice article-status-notice article-status-notice-warning">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                This article is due for review by{" "}
                <strong>{new Date(article.reviewDueAt!).toLocaleDateString()}</strong>.
                Please verify its accuracy.
              </span>
            </div>
          )}

          {article.isPinned && (
            <div className="article-soft-banner">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="17" x2="12" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
              </svg>
              Pinned article
            </div>
          )}

          {article.isDisambiguation && (
            <div className="wiki-disambiguation-notice">
              <strong>{article.title}</strong> may refer to multiple subjects.
              This is a <em>disambiguation page</em> listing articles with similar names.
            </div>
          )}
        </div>

        {/* Article body — password-gated for non-admins when accessPassword is set */}
        <ArticlePasswordWrapper
          articleId={article.id}
          hasPassword={!!article.accessPassword && !adminFlag}
        >

        <div className="article-prelude">
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
            <div className="wiki-in-brief article-in-brief">
              <span className="article-in-brief-label">In brief</span>
              <span>{article.summaryShort}</span>
            </div>
          )}

          {/* Table of contents */}
          <TableOfContents html={resolvedContent} />
        </div>

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

        {/* Article content — wraps with adaptive reading level control */}
        <ArticleBodyWithReadingLevel
          articleId={article.id}
          originalHtml={addHeadingIds(appendFootnoteSection(resolveGlossaryTerms(resolvedContent, glossaryTerms)))}
          dir={article.dir ?? "ltr"}
        />

        {/* Claims summary panel */}
        <ClaimsPanel articleId={article.id} html={resolvedContent} />

        {/* Fact-check panel */}
        <FactCheckPanel html={resolvedContent} />

        {/* Clear float from infobox */}
        <div className="clear-both" />

        <ArticleTaxonomyFooter
          category={article.category}
          tags={article.tags.map(({ tag }) => tag)}
        />

        {/* Issue links */}
        <IssueLinkBadge articleId={article.id} />

        {/* Reaction bar */}
        <ArticleReactionBar articleId={article.id} />

        {/* Star rating */}
        <ArticleRatingWidget articleId={article.id} />

        {/* Fork this article */}
        <div className="article-footer-actions">
          <Link
            href={`/api/articles/${article.id}/fork`}
            className="ui-button"
            title="Fork this article to propose a complete rewrite"
            prefetch={false}
          >
            Fork this article
          </Link>
        </div>

        {/* Series table of contents + navigation */}
        <SeriesTableOfContents articleId={article.id} />
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

        {/* Word frequency cloud */}
        <WordFrequencyCloud html={article.content} />

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
          <section className="article-link-section">
            <div className="article-link-section-header">
              <h2>What links here</h2>
              <span>{backlinks.length.toLocaleString()} backlink{backlinks.length === 1 ? "" : "s"}</span>
            </div>
            <ul className="article-link-list">
              {backlinks.map((link) => (
                <li key={link.id}>
                  <Link href={`/articles/${link.slug}`}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
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
        <ImageLightbox />
        <TabsActivator />
        <WikiChatAssistant articleTitle={article.title} />
      </article>

      {/* Floating TOC — rendered outside the padded box so it can be fixed */}
      <TableOfContentsFloat html={resolvedContent} />

      {/* Right sidebar: outline + backlinks + local graph */}
      <ArticleRightSidebar slug={slug} backlinks={backlinks} />
    </div>
  );
}

function resolveArticleGovernance(
  categories: Array<{
    governance: (Omit<Partial<SpaceGovernanceValues>, "defaultVisibility" | "healthRequiredSignals"> & {
      defaultVisibility?: string | null;
      healthRequiredSignals?: unknown;
    }) | null;
    id: string;
    name: string;
    parentId: string | null;
  }>,
  categoryId: string,
) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const chain: typeof categories = [];
  let cursor = byId.get(categoryId);

  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
  }

  return resolveSpaceGovernanceInheritance({
    categoryChain: chain.map((category) => ({
      ...(category.governance ?? {}),
      id: category.id,
      label: category.name,
      parentId: category.parentId,
    })),
    globalDefaults: defaultGlobalSpaceGovernance(),
  });
}

export const dynamic = "force-dynamic";
