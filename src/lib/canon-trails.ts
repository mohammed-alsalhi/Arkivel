import prisma from "@/lib/prisma";
import { wordCount } from "@/lib/utils";

type TrailTone = "canon" | "fresh" | "repair" | "deep";

export type CanonTrailStop = {
  id: string;
  title: string;
  href: string;
  category: string;
  excerpt: string;
  reason: string;
  words: number;
  wikiLinks: number;
};

export type CanonTrail = {
  id: string;
  title: string;
  subtitle: string;
  tone: TrailTone;
  estimatedMinutes: number;
  totalWords: number;
  stops: CanonTrailStop[];
};

export type CanonTrailsReport = {
  generatedAt: string;
  summary: {
    trails: number;
    stops: number;
    words: number;
    links: number;
  };
  trails: CanonTrail[];
};

async function getTrailArticles() {
  return prisma.article.findMany({
    where: { published: true, status: "published" },
    orderBy: { updatedAt: "desc" },
    take: 180,
    include: {
      category: { select: { name: true, slug: true } },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
      _count: {
        select: {
          revisions: true,
          discussions: true,
          reads: true,
          pageViews: true,
          reactions: true,
          bookmarks: true,
        },
      },
    },
  });
}

type TrailArticle = Awaited<ReturnType<typeof getTrailArticles>>[number];

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

function fallbackExcerpt(article: TrailArticle): string {
  if (article.excerpt?.trim()) return article.excerpt.trim();
  if (article.summaryShort?.trim()) return article.summaryShort.trim();
  if (article.summary?.trim()) return article.summary.trim();
  return "No excerpt yet. This stop is still worth placing because it anchors a route through the wiki.";
}

function toStop(
  article: TrailArticle,
  words: number,
  wikiLinks: number,
  reason: string
): CanonTrailStop {
  return {
    id: article.id,
    title: article.title,
    href: `/articles/${article.slug}`,
    category: article.category?.name ?? "Uncharted",
    excerpt: fallbackExcerpt(article),
    reason,
    words,
    wikiLinks,
  };
}

function createTrail(
  id: string,
  title: string,
  subtitle: string,
  tone: TrailTone,
  articles: TrailArticle[],
  wordCounts: Map<string, number>,
  linkCounts: Map<string, string[]>,
  reason: (article: TrailArticle, index: number) => string
): CanonTrail {
  const stops = articles.slice(0, 7).map((article, index) => (
    toStop(article, wordCounts.get(article.id) ?? 0, linkCounts.get(article.id)?.length ?? 0, reason(article, index))
  ));
  const totalWords = stops.reduce((sum, stop) => sum + stop.words, 0);

  return {
    id,
    title,
    subtitle,
    tone,
    estimatedMinutes: Math.max(1, Math.ceil(totalWords / 220)),
    totalWords,
    stops,
  };
}

function buildConnectedTrail(
  scored: Array<{ article: TrailArticle; score: number }>,
  articleById: Map<string, TrailArticle>,
  idByTarget: Map<string, string>,
  linkCounts: Map<string, string[]>
): TrailArticle[] {
  const route: TrailArticle[] = [];
  const used = new Set<string>();
  const start = scored[0]?.article;
  if (!start) return route;

  let current: TrailArticle | undefined = start;
  while (current && route.length < 7) {
    route.push(current);
    used.add(current.id);

    const candidates = (linkCounts.get(current.id) ?? [])
      .map((link) => articleById.get(idByTarget.get(normalizeTarget(link)) ?? ""))
      .filter((article): article is TrailArticle => Boolean(article && !used.has(article.id)));

    current = candidates
      .map((article) => ({ article, score: scored.find((item) => item.article.id === article.id)?.score ?? 0 }))
      .sort((a, b) => b.score - a.score)[0]?.article;

    if (!current) {
      current = scored.find((item) => !used.has(item.article.id))?.article;
    }
  }

  return route;
}

function starterTrails(): CanonTrail[] {
  const stops: CanonTrailStop[] = [
    {
      id: "seed-first-article",
      title: "Create the first anchor",
      href: "/articles/new",
      category: "Starter",
      excerpt: "Write one substantial article and trails will begin routing readers through the wiki.",
      reason: "Every trail needs a first anchor.",
      words: 0,
      wikiLinks: 0,
    },
    {
      id: "seed-categories",
      title: "Shape the first territory",
      href: "/categories",
      category: "Starter",
      excerpt: "Create a category so future routes can move through meaningful territory.",
      reason: "Routes become stronger when articles belong to places.",
      words: 0,
      wikiLinks: 0,
    },
    {
      id: "seed-links",
      title: "Add the first wiki link",
      href: "/articles",
      category: "Starter",
      excerpt: "Use wiki links to turn separate entries into a readable path.",
      reason: "The route engine follows real links.",
      words: 0,
      wikiLinks: 0,
    },
  ];

  return [
    {
      id: "starter",
      title: "Starter Trail",
      subtitle: "A guided setup route for an empty wiki.",
      tone: "canon",
      estimatedMinutes: 1,
      totalWords: 0,
      stops,
    },
  ];
}

function buildTrailsReport(articles: TrailArticle[]): CanonTrailsReport {
  if (articles.length === 0) {
    const trails = starterTrails();
    return {
      generatedAt: new Date().toISOString(),
      summary: { trails: trails.length, stops: trails[0].stops.length, words: 0, links: 0 },
      trails,
    };
  }

  const articleById = new Map<string, TrailArticle>();
  const idByTarget = new Map<string, string>();
  const wordCounts = new Map<string, number>();
  const linkCounts = new Map<string, string[]>();
  const inbound = new Map<string, number>();

  for (const article of articles) {
    articleById.set(article.id, article);
    idByTarget.set(normalizeTarget(article.title), article.id);
    idByTarget.set(normalizeTarget(article.slug), article.id);
    wordCounts.set(article.id, wordCount(article.content));
    inbound.set(article.id, 0);
  }

  for (const article of articles) {
    const links = extractWikiLinks(article.content);
    linkCounts.set(article.id, links);
    for (const link of links) {
      const targetId = idByTarget.get(normalizeTarget(link));
      if (targetId && targetId !== article.id) {
        inbound.set(targetId, (inbound.get(targetId) ?? 0) + 1);
      }
    }
  }

  const scored = articles
    .map((article) => {
      const words = wordCounts.get(article.id) ?? 0;
      const links = linkCounts.get(article.id)?.length ?? 0;
      const engagement = article._count.reads + article._count.pageViews + article._count.reactions + article._count.bookmarks;
      const score = (inbound.get(article.id) ?? 0) * 5 + links * 3 + words / 450 + article._count.revisions * 1.4 + article._count.discussions * 2 + engagement * 0.25 + (article.isPinned || article.isFeatured ? 12 : 0);
      return { article, score };
    })
    .sort((a, b) => b.score - a.score);

  const connectedTrail = buildConnectedTrail(scored, articleById, idByTarget, linkCounts);
  const recentTrail = [...articles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 7);
  const deepTrail = scored
    .filter((item) => (wordCounts.get(item.article.id) ?? 0) >= 600)
    .map((item) => item.article)
    .slice(0, 7);
  const repairTrail = scored
    .filter((item) => (linkCounts.get(item.article.id)?.length ?? 0) === 0 || (wordCounts.get(item.article.id) ?? 0) < 300)
    .map((item) => item.article)
    .slice(0, 7);

  const trails = [
    createTrail(
      "canon-route",
      "Canon Route",
      "Follow the strongest connected path through the published wiki.",
      "canon",
      connectedTrail,
      wordCounts,
      linkCounts,
      (article, index) => index === 0
        ? "Highest-signal starting point."
        : `${inbound.get(article.id) ?? 0} backlinks pull this stop into the route.`
    ),
    createTrail(
      "fresh-route",
      "Fresh Route",
      "Read what changed most recently without opening a changelog.",
      "fresh",
      recentTrail,
      wordCounts,
      linkCounts,
      () => "Recently updated and ready for a return visit."
    ),
    createTrail(
      "deep-route",
      "Deep Route",
      "A longer-form path through the most substantial pages.",
      "deep",
      deepTrail.length ? deepTrail : scored.map((item) => item.article),
      wordCounts,
      linkCounts,
      (article) => `${wordCounts.get(article.id) ?? 0} words of context.`
    ),
    createTrail(
      "repair-route",
      "Repair Route",
      "A playable cleanup path through pages that need links or expansion.",
      "repair",
      repairTrail.length ? repairTrail : scored.slice().reverse().map((item) => item.article),
      wordCounts,
      linkCounts,
      (article) => {
        const links = linkCounts.get(article.id)?.length ?? 0;
        const words = wordCounts.get(article.id) ?? 0;
        if (links === 0 && words < 300) return "Needs both outgoing links and more body.";
        if (links === 0) return "Needs outgoing wiki links.";
        return "Short enough to deserve expansion.";
      }
    ),
  ].filter((trail) => trail.stops.length > 0);

  const uniqueStops = new Set(trails.flatMap((trail) => trail.stops.map((stop) => stop.id)));
  const totalWords = trails.reduce((sum, trail) => sum + trail.totalWords, 0);
  const totalLinks = [...linkCounts.values()].reduce((sum, links) => sum + links.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      trails: trails.length,
      stops: uniqueStops.size,
      words: totalWords,
      links: totalLinks,
    },
    trails,
  };
}

export async function getCanonTrailsReport(): Promise<CanonTrailsReport> {
  try {
    const articles = await getTrailArticles();
    return buildTrailsReport(articles);
  } catch {
    return buildTrailsReport([]);
  }
}
