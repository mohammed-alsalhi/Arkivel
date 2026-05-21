import prisma from "@/lib/prisma";
import { wordCount } from "@/lib/utils";

type IntelligenceTone = "good" | "warn" | "danger" | "info";

export type IntelligenceCard = {
  id: string;
  title: string;
  value: string;
  label: string;
  description: string;
  href: string;
  cta: string;
  tone: IntelligenceTone;
};

export type IntelligenceSection = {
  id: string;
  title: string;
  subtitle: string;
  cards: IntelligenceCard[];
};

export type IntelligenceAction = {
  title: string;
  description: string;
  href: string;
  priority: "High" | "Medium" | "Low";
};

export type IntelligenceReport = {
  generatedAt: string;
  readinessScore: number;
  summary: {
    articles: number;
    published: number;
    drafts: number;
    reviews: number;
    categories: number;
    tags: number;
    revisions: number;
    words: number;
    links: number;
  };
  sections: IntelligenceSection[];
  actions: IntelligenceAction[];
};

async function getArticlesForIntelligence() {
  return prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
      _count: {
        select: {
          revisions: true,
          discussions: true,
          translations: true,
          reads: true,
          pageViews: true,
          reactions: true,
          bookmarks: true,
          reviews: true,
        },
      },
    },
  });
}

async function getCategoriesForIntelligence() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });
}

async function getTagsForIntelligence() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
}

type IntelligenceArticle = Awaited<ReturnType<typeof getArticlesForIntelligence>>[number];
type IntelligenceCategory = Awaited<ReturnType<typeof getCategoriesForIntelligence>>[number];
type IntelligenceTag = Awaited<ReturnType<typeof getTagsForIntelligence>>[number];

const DAY_MS = 24 * 60 * 60 * 1000;

function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function countBy<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.reduce((total, item) => total + (predicate(item) ? 1 : 0), 0);
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function normalizeTarget(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractWikiLinks(content: string): string[] {
  const links: string[] = [];
  const htmlRegex = /data-wiki-link="([^"]+)"/g;
  const markdownRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = htmlRegex.exec(content)) !== null) {
    links.push(match[1].trim());
  }

  while ((match = markdownRegex.exec(content)) !== null) {
    links.push(match[1].trim());
  }

  return links;
}

function topArticleLink(articles: IntelligenceArticle[], predicate: (article: IntelligenceArticle) => boolean): string {
  const article = articles.find(predicate);
  return article ? `/articles/${article.slug}` : "/articles";
}

function buildReport(
  articles: IntelligenceArticle[],
  categories: IntelligenceCategory[],
  tags: IntelligenceTag[],
  revisionCount: number
): IntelligenceReport {
  const now = Date.now();
  const published = articles.filter((article) => article.published && article.status === "published");
  const draftCount = countBy(articles, (article) => article.status === "draft");
  const reviewCount = countBy(articles, (article) => article.status === "review");
  const reviewDue = countBy(articles, (article) => Boolean(article.reviewDueAt && new Date(article.reviewDueAt).getTime() <= now + 14 * DAY_MS));
  const stale = countBy(published, (article) => now - new Date(article.updatedAt).getTime() > 180 * DAY_MS);

  const wordCounts = new Map<string, number>();
  const linkCounts = new Map<string, string[]>();
  const existingTargets = new Set<string>();
  const inboundCounts = new Map<string, number>();

  for (const article of published) {
    wordCounts.set(article.id, wordCount(article.content));
    existingTargets.add(normalizeTarget(article.title));
    existingTargets.add(normalizeTarget(article.slug));
    inboundCounts.set(article.id, 0);
  }

  const idByTarget = new Map<string, string>();
  for (const article of published) {
    idByTarget.set(normalizeTarget(article.title), article.id);
    idByTarget.set(normalizeTarget(article.slug), article.id);
  }

  let totalWikiLinks = 0;
  let brokenLinks = 0;
  for (const article of published) {
    const links = extractWikiLinks(article.content);
    linkCounts.set(article.id, links);
    totalWikiLinks += links.length;

    for (const link of links) {
      const target = normalizeTarget(link);
      const targetId = idByTarget.get(target);
      if (targetId && targetId !== article.id) {
        inboundCounts.set(targetId, (inboundCounts.get(targetId) ?? 0) + 1);
      } else if (!existingTargets.has(target)) {
        brokenLinks += 1;
      }
    }
  }

  const totalWords = [...wordCounts.values()].reduce((sum, count) => sum + count, 0);
  const stubs = published.filter((article) => (wordCounts.get(article.id) ?? 0) < 250);
  const longform = published.filter((article) => (wordCounts.get(article.id) ?? 0) > 2500);
  const linkless = published.filter((article) => (linkCounts.get(article.id) ?? []).length === 0);
  const orphans = published.filter((article) => (inboundCounts.get(article.id) ?? 0) === 0);
  const uncategorized = published.filter((article) => !article.categoryId);
  const untagged = published.filter((article) => article.tags.length === 0);
  const heavyTags = tags.filter((tag) => tag._count.articles >= 3);
  const featured = published.filter((article) => article.isFeatured || article.isPinned);
  const withInfobox = published.filter((article) => article.infobox);
  const translated = published.filter((article) => article._count.translations > 0);
  const discussed = published.filter((article) => article._count.discussions > 0);
  const verified = published.filter((article) => article.lastVerifiedAt);
  const cleanupTagged = published.filter((article) => article.cleanupTags.length > 0 || article.flags.length > 0);
  const totalReads = published.reduce((sum, article) => sum + article._count.reads + article._count.pageViews, 0);
  const activeThisWeek = countBy(articles, (article) => now - new Date(article.updatedAt).getTime() <= 7 * DAY_MS);
  const staleRatio = percent(stale, published.length);
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100
          - percent(stubs.length, Math.max(1, published.length)) * 0.16
          - percent(orphans.length, Math.max(1, published.length)) * 0.16
          - percent(uncategorized.length + untagged.length, Math.max(1, published.length * 2)) * 0.18
          - Math.min(20, brokenLinks)
          - staleRatio * 0.12
          + Math.min(10, percent(featured.length, Math.max(1, published.length)))
      )
    )
  );

  const actions: IntelligenceAction[] = [
    {
      title: stubs.length ? "Expand the shortest pages" : "Seed the first deep article",
      description: stubs.length
        ? `${formatNumber(stubs.length)} published pages are under 250 words.`
        : "No stub pressure detected. Use the article index to choose the next flagship page.",
      href: topArticleLink(stubs, () => true),
      priority: stubs.length > 5 ? "High" : "Medium",
    },
    {
      title: brokenLinks ? "Repair broken wiki links" : "Add more cross-links",
      description: brokenLinks
        ? `${formatNumber(brokenLinks)} wiki links point at missing pages.`
        : `${formatNumber(linkless.length)} pages still have no outgoing wiki links.`,
      href: brokenLinks ? "/coverage" : topArticleLink(linkless, () => true),
      priority: brokenLinks ? "High" : "Medium",
    },
    {
      title: stale ? "Refresh stale canon" : "Protect the fresh streak",
      description: stale
        ? `${formatNumber(stale)} articles have not been updated in 180+ days.`
        : "No stale pressure detected from published articles.",
      href: "/admin/staleness",
      priority: stale > 10 ? "High" : "Low",
    },
    {
      title: uncategorized.length || untagged.length ? "Pay down taxonomy debt" : "Grow a signature taxonomy",
      description: `${formatNumber(uncategorized.length)} uncategorized and ${formatNumber(untagged.length)} untagged published pages.`,
      href: "/categories",
      priority: uncategorized.length + untagged.length > 10 ? "High" : "Medium",
    },
    {
      title: reviewCount || reviewDue ? "Clear the editorial queue" : "Create a review ritual",
      description: `${formatNumber(reviewCount)} pages in review and ${formatNumber(reviewDue)} due within 14 days.`,
      href: "/review",
      priority: reviewCount + reviewDue > 0 ? "High" : "Low",
    },
  ];

  const cards: IntelligenceCard[] = [
    {
      id: "readiness-score",
      title: "Mission readiness score",
      value: `${readinessScore}%`,
      label: "operational health",
      description: "Composite score from stubs, orphans, stale pages, taxonomy debt, broken links, and featured canon.",
      href: "/health",
      cta: "Inspect health",
      tone: readinessScore >= 80 ? "good" : readinessScore >= 55 ? "warn" : "danger",
    },
    {
      id: "content-velocity",
      title: "Content velocity",
      value: formatNumber(activeThisWeek),
      label: "updated this week",
      description: "Shows whether the wiki is actively moving or starting to coast.",
      href: "/recent-changes",
      cta: "View activity",
      tone: activeThisWeek > 0 ? "good" : "warn",
    },
    {
      id: "editorial-pipeline",
      title: "Editorial pipeline radar",
      value: formatNumber(draftCount + reviewCount),
      label: "draft/review pages",
      description: "Turns hidden unfinished work into a visible queue for editors.",
      href: "/review",
      cta: "Open queue",
      tone: draftCount + reviewCount > 0 ? "warn" : "good",
    },
    {
      id: "review-deadlines",
      title: "Review deadline sentinel",
      value: formatNumber(reviewDue),
      label: "due within 14 days",
      description: "Finds pages with review due dates before they age into trust debt.",
      href: "/admin/staleness",
      cta: "Check dates",
      tone: reviewDue > 0 ? "danger" : "good",
    },
    {
      id: "staleness-heat",
      title: "Staleness heat map",
      value: `${staleRatio}%`,
      label: "stale published pages",
      description: "Flags articles untouched for 180+ days so the canon stays alive.",
      href: "/admin/staleness",
      cta: "Refresh canon",
      tone: staleRatio > 25 ? "danger" : staleRatio > 10 ? "warn" : "good",
    },
    {
      id: "orphan-rescue",
      title: "Orphan rescue lane",
      value: formatNumber(orphans.length),
      label: "pages with no backlinks",
      description: "Reveals pages that exist but are not woven into the wiki graph.",
      href: topArticleLink(orphans, () => true),
      cta: "Link one in",
      tone: orphans.length > 10 ? "danger" : orphans.length > 0 ? "warn" : "good",
    },
    {
      id: "broken-links",
      title: "Broken link radar",
      value: formatNumber(brokenLinks),
      label: "missing targets",
      description: "Counts wiki links pointing at pages that do not exist yet.",
      href: "/coverage",
      cta: "Repair links",
      tone: brokenLinks > 0 ? "danger" : "good",
    },
    {
      id: "linkless-pages",
      title: "Bridge builder",
      value: formatNumber(linkless.length),
      label: "pages without outgoing links",
      description: "Finds articles that should become launchpads into nearby context.",
      href: topArticleLink(linkless, () => true),
      cta: "Add bridges",
      tone: linkless.length > 0 ? "warn" : "good",
    },
    {
      id: "link-density",
      title: "Link density engine",
      value: published.length ? (totalWikiLinks / published.length).toFixed(1) : "0.0",
      label: "wiki links per page",
      description: "Shows whether the wiki reads as connected knowledge or isolated notes.",
      href: "/graph",
      cta: "Open graph",
      tone: published.length && totalWikiLinks / published.length >= 2 ? "good" : "warn",
    },
    {
      id: "stub-accelerator",
      title: "Stub accelerator",
      value: formatNumber(stubs.length),
      label: "short published pages",
      description: "Locates pages under 250 words that need expansion before they can sell the canon.",
      href: topArticleLink(stubs, () => true),
      cta: "Expand one",
      tone: stubs.length > 10 ? "danger" : stubs.length > 0 ? "warn" : "good",
    },
    {
      id: "longform-splitter",
      title: "Longform splitter",
      value: formatNumber(longform.length),
      label: "large articles",
      description: "Identifies articles over 2,500 words that may deserve summaries, splits, or reading aids.",
      href: topArticleLink(longform, () => true),
      cta: "Audit length",
      tone: longform.length > 0 ? "info" : "good",
    },
    {
      id: "taxonomy-debt",
      title: "Taxonomy debt scanner",
      value: formatNumber(uncategorized.length + untagged.length),
      label: "category/tag gaps",
      description: "Combines uncategorized and untagged pages into one cleanup target.",
      href: "/categories",
      cta: "Organize pages",
      tone: uncategorized.length + untagged.length > 0 ? "warn" : "good",
    },
    {
      id: "tag-constellations",
      title: "Tag constellation finder",
      value: formatNumber(heavyTags.length),
      label: "multi-article tags",
      description: "Spots labels strong enough to become collections, portals, or guided reading routes.",
      href: "/tags",
      cta: "Explore tags",
      tone: heavyTags.length > 0 ? "good" : "info",
    },
    {
      id: "featured-canon",
      title: "Featured canon builder",
      value: `${percent(featured.length, published.length)}%`,
      label: "featured or pinned",
      description: "Measures how much of the wiki is ready to present as flagship material.",
      href: "/articles",
      cta: "Promote canon",
      tone: featured.length > 0 ? "good" : "warn",
    },
    {
      id: "infobox-coverage",
      title: "Infobox coverage grid",
      value: `${percent(withInfobox.length, published.length)}%`,
      label: "with infoboxes",
      description: "Highlights whether structured facts are visible on article pages.",
      href: "/articles",
      cta: "Add structure",
      tone: percent(withInfobox.length, published.length) >= 40 ? "good" : "info",
    },
    {
      id: "translation-surface",
      title: "Translation surface",
      value: formatNumber(translated.length),
      label: "localized articles",
      description: "Shows how many articles already have multilingual reach.",
      href: "/features",
      cta: "Plan locales",
      tone: translated.length > 0 ? "good" : "info",
    },
    {
      id: "conversation-heat",
      title: "Conversation heat",
      value: formatNumber(discussed.length),
      label: "articles with discussion",
      description: "Finds where readers or editors are already debating and improving the canon.",
      href: "/discussions",
      cta: "Join discussion",
      tone: discussed.length > 0 ? "good" : "info",
    },
    {
      id: "reader-demand",
      title: "Reader demand pulse",
      value: formatNumber(totalReads),
      label: "reads and views",
      description: "Combines article reads and page views into a demand signal.",
      href: "/popular",
      cta: "See demand",
      tone: totalReads > 0 ? "good" : "info",
    },
    {
      id: "verification-debt",
      title: "Verification debt ledger",
      value: formatNumber(published.length - verified.length),
      label: "unverified pages",
      description: "Tracks articles without an explicit verification timestamp.",
      href: "/admin/quality",
      cta: "Verify facts",
      tone: published.length - verified.length > 0 ? "warn" : "good",
    },
    {
      id: "cleanup-tags",
      title: "Cleanup tag command",
      value: formatNumber(cleanupTagged.length),
      label: "flagged pages",
      description: "Turns flags and cleanup tags into an operational queue.",
      href: "/admin/quality",
      cta: "Clear flags",
      tone: cleanupTagged.length > 0 ? "warn" : "good",
    },
  ];

  const sections: IntelligenceSection[] = [
    {
      id: "command",
      title: "Command layer",
      subtitle: "Signals that tell you whether the wiki is ready to show, sell, or scale.",
      cards: cards.slice(0, 5),
    },
    {
      id: "graph",
      title: "Graph layer",
      subtitle: "Signals that turn disconnected articles into a navigable knowledge network.",
      cards: cards.slice(5, 9),
    },
    {
      id: "canon",
      title: "Canon layer",
      subtitle: "Signals that improve article depth, structure, readability, and trust.",
      cards: cards.slice(9, 16),
    },
    {
      id: "audience",
      title: "Audience layer",
      subtitle: "Signals that reveal demand, conversation, review pressure, and cleanup work.",
      cards: cards.slice(16),
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    readinessScore,
    summary: {
      articles: articles.length,
      published: published.length,
      drafts: draftCount,
      reviews: reviewCount,
      categories: categories.length,
      tags: tags.length,
      revisions: revisionCount,
      words: totalWords,
      links: totalWikiLinks,
    },
    sections,
    actions,
  };
}

export async function getIntelligenceReport(): Promise<IntelligenceReport> {
  try {
    const [articles, categories, tags, revisionCount] = await Promise.all([
      getArticlesForIntelligence(),
      getCategoriesForIntelligence(),
      getTagsForIntelligence(),
      prisma.articleRevision.count(),
    ]);

    return buildReport(articles, categories, tags, revisionCount);
  } catch {
    return buildReport([], [], [], 0);
  }
}
