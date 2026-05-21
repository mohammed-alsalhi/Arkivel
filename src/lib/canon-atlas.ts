import prisma from "@/lib/prisma";
import { formatDate, wordCount } from "@/lib/utils";

type AtlasTone = "good" | "warn" | "danger" | "info";

export type AtlasTerritory = {
  id: string;
  title: string;
  href: string;
  articles: number;
  words: number;
  x: number;
  y: number;
  radius: number;
  tone: AtlasTone;
  summary: string;
};

export type AtlasSignal = {
  id: string;
  title: string;
  href: string;
  label: string;
  value: string;
  x: number;
  y: number;
  radius: number;
  tone: AtlasTone;
};

export type AtlasThread = {
  sourceId: string;
  targetId: string;
  sourceTitle: string;
  targetTitle: string;
  sourceHref: string;
  targetHref: string;
};

export type AtlasDossier = {
  title: string;
  href: string;
  category: string;
  excerpt: string;
  words: number;
  updated: string;
};

export type AtlasContinuityMetric = {
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: AtlasTone;
};

export type AtlasAction = {
  title: string;
  description: string;
  href: string;
  priority: "High" | "Medium" | "Low";
};

export type CanonAtlasReport = {
  generatedAt: string;
  summary: {
    articles: number;
    territories: number;
    signals: number;
    threads: number;
    words: number;
  };
  dossier: AtlasDossier;
  territories: AtlasTerritory[];
  signals: AtlasSignal[];
  threads: AtlasThread[];
  continuity: AtlasContinuityMetric[];
  actions: AtlasAction[];
};

async function getAtlasArticles() {
  return prisma.article.findMany({
    where: { published: true, status: "published" },
    orderBy: { updatedAt: "desc" },
    take: 160,
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
        },
      },
    },
  });
}

async function getAtlasCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });
}

type AtlasArticle = Awaited<ReturnType<typeof getAtlasArticles>>[number];
type AtlasCategory = Awaited<ReturnType<typeof getAtlasCategories>>[number];

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

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function toneForPressure(value: number, warnAt: number, dangerAt: number): AtlasTone {
  if (value >= dangerAt) return "danger";
  if (value >= warnAt) return "warn";
  return "good";
}

function atlasPoint(index: number, total: number, inner = false) {
  const angle = -Math.PI / 2 + (index / Math.max(1, total)) * Math.PI * 2;
  const radius = inner ? 25 : 38;
  return {
    x: Math.round((50 + Math.cos(angle) * radius) * 10) / 10,
    y: Math.round((50 + Math.sin(angle) * radius) * 10) / 10,
  };
}

function starterTerritories(): AtlasTerritory[] {
  return ["People", "Places", "Factions", "Events", "Artifacts", "Ideas"].map((title, index, all) => {
    const point = atlasPoint(index, all.length);
    return {
      id: `starter-${title.toLowerCase()}`,
      title,
      href: "/articles/new",
      articles: 0,
      words: 0,
      x: point.x,
      y: point.y,
      radius: 8,
      tone: "info",
      summary: "Starter territory waiting for the first published article.",
    };
  });
}

function buildAtlasReport(articles: AtlasArticle[], categories: AtlasCategory[]): CanonAtlasReport {
  const idByTarget = new Map<string, string>();
  const articleById = new Map<string, AtlasArticle>();
  const linkTargetsByArticle = new Map<string, string[]>();
  const articleWords = new Map<string, number>();

  for (const article of articles) {
    articleById.set(article.id, article);
    idByTarget.set(normalizeTarget(article.title), article.id);
    idByTarget.set(normalizeTarget(article.slug), article.id);
    articleWords.set(article.id, wordCount(article.content));
  }

  for (const article of articles) {
    linkTargetsByArticle.set(article.id, extractWikiLinks(article.content));
  }

  const categoryStats = new Map<string, { category: AtlasCategory; articles: number; words: number; recent: number }>();
  for (const category of categories) {
    categoryStats.set(category.id, { category, articles: 0, words: 0, recent: 0 });
  }

  let uncategorizedArticles = 0;
  let uncategorizedWords = 0;
  for (const article of articles) {
    const words = articleWords.get(article.id) ?? 0;
    if (!article.categoryId) {
      uncategorizedArticles += 1;
      uncategorizedWords += words;
      continue;
    }

    const stat = categoryStats.get(article.categoryId);
    if (stat) {
      stat.articles += 1;
      stat.words += words;
      if (Date.now() - new Date(article.updatedAt).getTime() <= 30 * 24 * 60 * 60 * 1000) {
        stat.recent += 1;
      }
    }
  }

  const territories = [...categoryStats.values()]
    .filter((stat) => stat.articles > 0)
    .sort((a, b) => b.articles - a.articles || b.words - a.words)
    .slice(0, 8)
    .map((stat, index, all): AtlasTerritory => {
      const point = atlasPoint(index, all.length);
      return {
        id: stat.category.id,
        title: stat.category.name,
        href: `/categories/${stat.category.slug}`,
        articles: stat.articles,
        words: stat.words,
        x: point.x,
        y: point.y,
        radius: Math.max(7, Math.min(15, 7 + stat.articles * 1.1)),
        tone: stat.recent > 0 ? "good" : "info",
        summary: `${formatNumber(stat.articles)} articles, ${formatNumber(stat.words)} words, ${formatNumber(stat.recent)} updated this month.`,
      };
    });

  if (uncategorizedArticles > 0) {
    territories.push({
      id: "uncategorized",
      title: "Uncharted",
      href: "/categories",
      articles: uncategorizedArticles,
      words: uncategorizedWords,
      x: 50,
      y: 50,
      radius: Math.max(8, Math.min(14, 7 + uncategorizedArticles)),
      tone: "warn",
      summary: `${formatNumber(uncategorizedArticles)} articles need a territory before the atlas can place them.`,
    });
  }

  const articleScores = articles
    .map((article) => {
      const links = linkTargetsByArticle.get(article.id)?.length ?? 0;
      const engagement = article._count.reads + article._count.pageViews + article._count.bookmarks + article._count.reactions;
      const score = links * 4 + article._count.revisions * 1.6 + article._count.discussions * 2.2 + engagement * 0.3 + (article.isPinned || article.isFeatured ? 10 : 0);
      return { article, score, links };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 14);

  const signals = articleScores.map((item, index, all): AtlasSignal => {
    const point = atlasPoint(index, all.length, index % 3 === 0);
    const words = articleWords.get(item.article.id) ?? 0;
    return {
      id: item.article.id,
      title: item.article.title,
      href: `/articles/${item.article.slug}`,
      label: item.article.category?.name ?? "Uncharted",
      value: `${formatNumber(words)} words`,
      x: point.x,
      y: point.y,
      radius: Math.max(3.8, Math.min(8.5, 4 + item.score / 14)),
      tone: item.links > 0 ? "good" : "warn",
    };
  });

  const signalIds = new Set(signals.map((signal) => signal.id));
  const threadKeys = new Set<string>();
  const threads: AtlasThread[] = [];
  for (const signal of signals) {
    const article = articleById.get(signal.id);
    if (!article) continue;

    for (const link of linkTargetsByArticle.get(article.id) ?? []) {
      const targetId = idByTarget.get(normalizeTarget(link));
      const target = targetId ? articleById.get(targetId) : null;
      if (!target || target.id === article.id || !signalIds.has(target.id)) continue;

      const key = `${article.id}:${target.id}`;
      if (threadKeys.has(key)) continue;
      threadKeys.add(key);
      threads.push({
        sourceId: article.id,
        targetId: target.id,
        sourceTitle: article.title,
        targetTitle: target.title,
        sourceHref: `/articles/${article.slug}`,
        targetHref: `/articles/${target.slug}`,
      });
    }
  }

  const fallbackTerritories = territories.length > 0 ? territories : starterTerritories();
  const fallbackSignals = signals.length > 0
    ? signals
    : fallbackTerritories.map((territory, index): AtlasSignal => ({
        id: `seed-${territory.id}`,
        title: `Seed ${territory.title}`,
        href: "/articles/new",
        label: "Starter signal",
        value: "0 words",
        x: territory.x,
        y: territory.y,
        radius: index === 0 ? 8 : 5.5,
        tone: "info",
      }));
  const fallbackThreads = threads.length > 0
    ? threads.slice(0, 16)
    : fallbackSignals.slice(1).map((signal) => ({
        sourceId: fallbackSignals[0]?.id ?? signal.id,
        targetId: signal.id,
        sourceTitle: fallbackSignals[0]?.title ?? "Starter",
        targetTitle: signal.title,
        sourceHref: fallbackSignals[0]?.href ?? "/articles/new",
        targetHref: signal.href,
      }));

  const stubs = articles.filter((article) => (articleWords.get(article.id) ?? 0) < 300).length;
  const noExcerpt = articles.filter((article) => !article.excerpt?.trim()).length;
  const noCategory = articles.filter((article) => !article.categoryId).length;
  const noTags = articles.filter((article) => article.tags.length === 0).length;
  const noLinks = articles.filter((article) => (linkTargetsByArticle.get(article.id) ?? []).length === 0).length;
  const noInfobox = articles.filter((article) => !article.infobox).length;
  const totalWords = [...articleWords.values()].reduce((sum, count) => sum + count, 0);

  const continuity: AtlasContinuityMetric[] = [
    {
      label: "Stub pressure",
      value: formatNumber(stubs),
      detail: "Published entries under 300 words.",
      href: "/admin/stubs",
      tone: toneForPressure(stubs, 4, 12),
    },
    {
      label: "Uncharted pages",
      value: formatNumber(noCategory),
      detail: "Articles without a category territory.",
      href: "/categories",
      tone: toneForPressure(noCategory, 2, 8),
    },
    {
      label: "Tag silence",
      value: formatNumber(noTags),
      detail: "Articles without cross-cutting labels.",
      href: "/tags",
      tone: toneForPressure(noTags, 4, 12),
    },
    {
      label: "Thread gaps",
      value: formatNumber(noLinks),
      detail: "Articles with no outgoing wiki links.",
      href: "/graph",
      tone: toneForPressure(noLinks, 4, 12),
    },
    {
      label: "Dossier gaps",
      value: formatNumber(noExcerpt + noInfobox),
      detail: "Missing excerpts or structured infoboxes.",
      href: "/admin/quality",
      tone: toneForPressure(noExcerpt + noInfobox, 6, 18),
    },
  ];

  const featured = articles.find((article) => article.isPinned || article.isFeatured) ?? articles[0];
  const dossier: AtlasDossier = featured
    ? {
        title: featured.title,
        href: `/articles/${featured.slug}`,
        category: featured.category?.name ?? "Uncharted",
        excerpt: featured.excerpt?.trim() || "No excerpt yet. Add a short dossier summary so this page can anchor the atlas.",
        words: articleWords.get(featured.id) ?? 0,
        updated: formatDate(featured.updatedAt),
      }
    : {
        title: "Create the first atlas anchor",
        href: "/articles/new",
        category: "Starter",
        excerpt: "Publish the first article and the atlas will turn it into the opening dossier.",
        words: 0,
        updated: "Not started",
      };

  const actions: AtlasAction[] = [
    {
      title: noCategory ? "Place uncharted articles" : "Create a new territory",
      description: noCategory
        ? `${formatNumber(noCategory)} articles are published without a category.`
        : "The atlas has every article placed. Add the next major world category.",
      href: noCategory ? "/categories" : "/admin/categories",
      priority: noCategory > 0 ? "High" : "Medium",
    },
    {
      title: noLinks ? "Weave story threads" : "Deepen the strongest routes",
      description: noLinks
        ? `${formatNumber(noLinks)} articles have no outgoing wiki links.`
        : `${formatNumber(fallbackThreads.length)} visible atlas threads are already active.`,
      href: "/graph",
      priority: noLinks > 0 ? "High" : "Low",
    },
    {
      title: stubs ? "Turn stubs into dossiers" : "Build the next flagship dossier",
      description: stubs
        ? `${formatNumber(stubs)} articles are too short to feel like living canon.`
        : "No stub pressure found in the current published set.",
      href: stubs ? "/admin/stubs" : "/articles/new",
      priority: stubs > 0 ? "Medium" : "Low",
    },
    {
      title: noExcerpt + noInfobox ? "Add visible lore structure" : "Package atlas-ready entries",
      description: `${formatNumber(noExcerpt)} missing excerpts and ${formatNumber(noInfobox)} missing infoboxes.`,
      href: "/admin/quality",
      priority: noExcerpt + noInfobox > 0 ? "Medium" : "Low",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      articles: articles.length,
      territories: territories.length,
      signals: signals.length,
      threads: threads.length,
      words: totalWords,
    },
    dossier,
    territories: fallbackTerritories,
    signals: fallbackSignals,
    threads: fallbackThreads,
    continuity,
    actions,
  };
}

export async function getCanonAtlasReport(): Promise<CanonAtlasReport> {
  try {
    const [articles, categories] = await Promise.all([
      getAtlasArticles(),
      getAtlasCategories(),
    ]);

    return buildAtlasReport(articles, categories);
  } catch {
    return buildAtlasReport([], []);
  }
}
