import prisma from "@/lib/prisma";
import { generateSlug, stripHtml, truncateText, wordCount } from "@/lib/utils";

export type StudioTone = "primary" | "good" | "warn" | "danger" | "info";
export type StudioNodeType = "system" | "article" | "base" | "move";

export type StudioBoardNode = {
  id: string;
  type: StudioNodeType;
  title: string;
  subtitle: string;
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone: StudioTone;
  metric: string;
  meta: string;
};

export type StudioBoardEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  tone: StudioTone;
};

export type StudioBaseItem = {
  title: string;
  href: string;
  meta: string;
};

export type StudioBaseView = {
  id: string;
  title: string;
  description: string;
  href: string;
  count: number;
  tone: StudioTone;
  items: StudioBaseItem[];
};

export type StudioAction = {
  title: string;
  description: string;
  href: string;
  command: string;
  tone: StudioTone;
};

export type StudioReport = {
  generatedAt: string;
  summary: {
    articles: number;
    boardNodes: number;
    links: number;
    reviewQueue: number;
    publishableSurfaces: number;
  };
  board: {
    width: number;
    height: number;
    nodes: StudioBoardNode[];
    edges: StudioBoardEdge[];
  };
  bases: StudioBaseView[];
  actions: StudioAction[];
};

type JsonCanvasNode = {
  id: string;
  type: "text" | "file";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  file?: string;
  color?: string;
};

type JsonCanvasEdge = {
  id: string;
  fromNode: string;
  toNode: string;
  label?: string;
  color?: string;
};

export type JsonCanvas = {
  nodes: JsonCanvasNode[];
  edges: JsonCanvasEdge[];
};

async function getStudioArticles() {
  return prisma.article.findMany({
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
          reviews: true,
          claimReviews: true,
        },
      },
    },
  });
}

async function getStudioSemanticLinks() {
  return prisma.articleLink.findMany({
    select: {
      sourceId: true,
      targetSlug: true,
      relation: true,
    },
  });
}

type StudioArticle = Awaited<ReturnType<typeof getStudioArticles>>[number];
type StudioSemanticLink = Awaited<ReturnType<typeof getStudioSemanticLinks>>[number];

const DAY_MS = 24 * 60 * 60 * 1000;
const BOARD_WIDTH = 1160;
const BOARD_HEIGHT = 700;

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

function articleExcerpt(article: StudioArticle): string {
  const value = article.excerpt || article.summaryShort || article.summary || stripHtml(article.content);
  return truncateText(value || "No excerpt yet.", 120);
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function toneForPressure(value: number, warnAt: number, dangerAt: number): StudioTone {
  if (value >= dangerAt) return "danger";
  if (value >= warnAt) return "warn";
  return value > 0 ? "info" : "good";
}

function baseItems(articles: StudioArticle[], meta: (article: StudioArticle) => string): StudioBaseItem[] {
  return articles.slice(0, 5).map((article) => ({
    title: article.title,
    href: `/articles/${article.slug}`,
    meta: meta(article),
  }));
}

function starterStudioReport(): StudioReport {
  const nodes: StudioBoardNode[] = [
    {
      id: "studio-command",
      type: "system",
      title: "Arkivel Studio",
      subtitle: "A publishable command board for your wiki.",
      href: "/studio",
      x: 430,
      y: 250,
      width: 300,
      height: 132,
      tone: "primary",
      metric: "Starter",
      meta: "Create articles, categories, and wiki links to light up the live board.",
    },
    {
      id: "starter-article",
      type: "move",
      title: "Create an anchor article",
      subtitle: "Write one substantial page so Studio has a first card to place.",
      href: "/articles/new",
      x: 92,
      y: 118,
      width: 250,
      height: 120,
      tone: "good",
      metric: "Step 1",
      meta: "Articles become canvas cards.",
    },
    {
      id: "starter-links",
      type: "move",
      title: "Add wiki links",
      subtitle: "Use [[Article Name]] links to create real graph edges.",
      href: "/articles",
      x: 820,
      y: 112,
      width: 250,
      height: 120,
      tone: "info",
      metric: "Step 2",
      meta: "Links become board connections.",
    },
    {
      id: "starter-taxonomy",
      type: "base",
      title: "Shape a taxonomy",
      subtitle: "Categories and tags turn loose notes into base views.",
      href: "/categories",
      x: 170,
      y: 476,
      width: 260,
      height: 124,
      tone: "warn",
      metric: "Step 3",
      meta: "Bases become operating views.",
    },
    {
      id: "starter-export",
      type: "move",
      title: "Export JSON Canvas",
      subtitle: "Studio can emit a .canvas-compatible board for portability.",
      href: "/api/studio/canvas",
      x: 730,
      y: 484,
      width: 270,
      height: 124,
      tone: "primary",
      metric: ".canvas",
      meta: "Portable visual knowledge.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      articles: 0,
      boardNodes: nodes.length,
      links: 4,
      reviewQueue: 0,
      publishableSurfaces: 1,
    },
    board: {
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      nodes,
      edges: [
        { id: "starter-edge-article", source: "studio-command", target: "starter-article", label: "seed", tone: "good" },
        { id: "starter-edge-links", source: "studio-command", target: "starter-links", label: "connect", tone: "info" },
        { id: "starter-edge-taxonomy", source: "studio-command", target: "starter-taxonomy", label: "structure", tone: "warn" },
        { id: "starter-edge-export", source: "studio-command", target: "starter-export", label: "portable", tone: "primary" },
      ],
    },
    bases: [
      {
        id: "starter",
        title: "Studio setup lane",
        description: "The board becomes more powerful once the wiki has articles, links, and review signals.",
        href: "/articles/new",
        count: 3,
        tone: "primary",
        items: [
          { title: "Create first article", href: "/articles/new", meta: "Article card" },
          { title: "Create first category", href: "/categories", meta: "Base view" },
          { title: "Add first wiki link", href: "/articles", meta: "Graph edge" },
        ],
      },
    ],
    actions: [
      {
        title: "Create the first Studio card",
        description: "Write one article, then return to Studio to see it placed on the board.",
        href: "/articles/new",
        command: "Create article",
        tone: "primary",
      },
      {
        title: "Open existing canvases",
        description: "Use saved canvases for manual boards while Studio generates live command boards.",
        href: "/canvas",
        command: "Open canvas",
        tone: "info",
      },
    ],
  };
}

function buildStudioReport(articles: StudioArticle[], semanticLinks: StudioSemanticLink[]): StudioReport {
  const published = articles.filter((article) => article.published && article.status === "published");
  if (published.length === 0) return starterStudioReport();

  const now = Date.now();
  const idByTarget = new Map<string, string>();
  const articleById = new Map<string, StudioArticle>();
  const articleBySlug = new Map<string, StudioArticle>();
  const wordCounts = new Map<string, number>();
  const linkCounts = new Map<string, string[]>();
  const inbound = new Map<string, number>();

  for (const article of published) {
    articleById.set(article.id, article);
    articleBySlug.set(article.slug, article);
    idByTarget.set(normalizeTarget(article.title), article.id);
    idByTarget.set(normalizeTarget(article.slug), article.id);
    idByTarget.set(normalizeTarget(generateSlug(article.title)), article.id);
    wordCounts.set(article.id, wordCount(article.content));
    inbound.set(article.id, 0);
  }

  let brokenLinks = 0;
  const graphEdges: StudioBoardEdge[] = [];
  const graphEdgeKeys = new Set<string>();

  for (const article of published) {
    const links = extractWikiLinks(article.content);
    linkCounts.set(article.id, links);

    for (const link of links) {
      const targetId = idByTarget.get(normalizeTarget(link)) ?? idByTarget.get(normalizeTarget(generateSlug(link)));
      if (!targetId) {
        brokenLinks += 1;
        continue;
      }
      if (targetId === article.id) continue;
      inbound.set(targetId, (inbound.get(targetId) ?? 0) + 1);
      const key = `${article.id}:${targetId}:wiki`;
      if (!graphEdgeKeys.has(key)) {
        graphEdgeKeys.add(key);
        graphEdges.push({
          id: `wiki-${graphEdges.length + 1}`,
          source: article.id,
          target: targetId,
          label: "wiki link",
          tone: "info",
        });
      }
    }
  }

  for (const link of semanticLinks) {
    const source = articleById.get(link.sourceId);
    const target = articleBySlug.get(link.targetSlug);
    if (!source || !target || source.id === target.id) continue;
    const key = `${source.id}:${target.id}:${link.relation}`;
    if (graphEdgeKeys.has(key)) continue;
    graphEdgeKeys.add(key);
    graphEdges.push({
      id: `semantic-${graphEdges.length + 1}`,
      source: source.id,
      target: target.id,
      label: link.relation,
      tone: "primary",
    });
  }

  const scored = published
    .map((article) => {
      const words = wordCounts.get(article.id) ?? 0;
      const outbound = linkCounts.get(article.id)?.length ?? 0;
      const inboundCount = inbound.get(article.id) ?? 0;
      const engagement = article._count.reads + article._count.pageViews + article._count.reactions + article._count.bookmarks;
      const reviewSignal = article._count.reviews + article._count.claimReviews;
      const score = inboundCount * 5 + outbound * 3 + words / 420 + engagement * 0.25 + article._count.revisions * 1.2 + reviewSignal * 2 + (article.isPinned || article.isFeatured ? 14 : 0);
      return { article, score, inbound: inboundCount, outbound, words };
    })
    .sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, 10);
  const centerNode: StudioBoardNode = {
    id: "studio-command",
    type: "system",
    title: "Arkivel Studio",
    subtitle: "Live command board from articles, links, bases, and review pressure.",
    href: "/studio",
    x: 430,
    y: 252,
    width: 300,
    height: 132,
    tone: "primary",
    metric: `${formatNumber(published.length)} pages`,
    meta: "Every card is generated from wiki data.",
  };

  const articleNodes: StudioBoardNode[] = selected.map((item, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(1, selected.length)) * Math.PI * 2;
    const orbitX = index < 5 ? 382 : 454;
    const orbitY = index < 5 ? 220 : 286;
    const x = Math.round(BOARD_WIDTH / 2 + Math.cos(angle) * orbitX - 125);
    const y = Math.round(BOARD_HEIGHT / 2 + Math.sin(angle) * orbitY - 58);
    const tone: StudioTone = item.words < 250 ? "warn" : item.inbound + item.outbound >= 4 ? "good" : "info";

    return {
      id: item.article.id,
      type: "article",
      title: item.article.title,
      subtitle: articleExcerpt(item.article),
      href: `/articles/${item.article.slug}`,
      x,
      y,
      width: 250,
      height: 118,
      tone,
      metric: `${item.inbound + item.outbound} links`,
      meta: item.article.category?.name ?? `${formatNumber(item.words)} words`,
    };
  });

  const visibleNodeIds = new Set(articleNodes.map((node) => node.id));
  const visibleEdges = graphEdges
    .filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
    .slice(0, 18);

  const boardEdges: StudioBoardEdge[] = [
    ...articleNodes.slice(0, 5).map((node, index) => ({
      id: `command-${index + 1}`,
      source: "studio-command",
      target: node.id,
      label: index === 0 ? "anchor" : "signal",
      tone: node.tone,
    })),
    ...visibleEdges,
  ];

  const stubs = published
    .filter((article) => (wordCounts.get(article.id) ?? 0) < 250)
    .sort((a, b) => (wordCounts.get(a.id) ?? 0) - (wordCounts.get(b.id) ?? 0));
  const orphans = published
    .filter((article) => (inbound.get(article.id) ?? 0) === 0)
    .sort((a, b) => (linkCounts.get(a.id)?.length ?? 0) - (linkCounts.get(b.id)?.length ?? 0));
  const reviewQueue = articles
    .filter((article) => article.status === "review" || article._count.reviews > 0 || article._count.claimReviews > 0)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const taxonomyDebt = published
    .filter((article) => !article.categoryId || article.tags.length === 0)
    .sort((a, b) => {
      const aDebt = (a.categoryId ? 0 : 1) + (a.tags.length > 0 ? 0 : 1);
      const bDebt = (b.categoryId ? 0 : 1) + (b.tags.length > 0 ? 0 : 1);
      return bDebt - aDebt;
    });
  const stale = published
    .filter((article) => now - article.updatedAt.getTime() > 180 * DAY_MS)
    .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

  const bases: StudioBaseView[] = [
    {
      id: "review",
      title: "Review cockpit",
      description: "Articles with active review, claim review, or review status signals.",
      href: "/review",
      count: reviewQueue.length,
      tone: toneForPressure(reviewQueue.length, 1, 8),
      items: baseItems(reviewQueue, (article) => `${article.status} / ${article._count.reviews + article._count.claimReviews} review signals`),
    },
    {
      id: "stubs",
      title: "Expansion lane",
      description: "Short published articles that need more substance before they can carry a public knowledge base.",
      href: stubs[0] ? `/articles/${stubs[0].slug}` : "/articles",
      count: stubs.length,
      tone: toneForPressure(stubs.length, 3, 12),
      items: baseItems(stubs, (article) => `${formatNumber(wordCounts.get(article.id) ?? 0)} words`),
    },
    {
      id: "orphans",
      title: "Bridge builder",
      description: "Published pages with no inbound links from the rest of the wiki graph.",
      href: "/graph",
      count: orphans.length,
      tone: toneForPressure(orphans.length, 3, 12),
      items: baseItems(orphans, (article) => `${linkCounts.get(article.id)?.length ?? 0} outgoing links`),
    },
    {
      id: "taxonomy",
      title: "Bases-ready taxonomy",
      description: "Pages missing categories or tags, blocking clean database-style views.",
      href: "/categories",
      count: taxonomyDebt.length,
      tone: toneForPressure(taxonomyDebt.length, 3, 12),
      items: baseItems(taxonomyDebt, (article) => `${article.categoryId ? "categorized" : "no category"} / ${article.tags.length} tags`),
    },
    {
      id: "stale",
      title: "Publish refresh lane",
      description: "Older pages to refresh before publishing a Studio board publicly.",
      href: "/admin/staleness",
      count: stale.length,
      tone: toneForPressure(stale.length, 3, 12),
      items: baseItems(stale, (article) => `updated ${article.updatedAt.toLocaleDateString("en-US")}`),
    },
  ];

  const actions: StudioAction[] = [
    {
      title: reviewQueue.length ? "Clear the review cockpit" : "Create a review ritual",
      description: reviewQueue.length
        ? `${formatNumber(reviewQueue.length)} articles have review pressure.`
        : "No review pressure yet. Add review requests to make Studio useful for teams.",
      href: "/review",
      command: "Open review cockpit",
      tone: reviewQueue.length ? "warn" : "info",
    },
    {
      title: brokenLinks ? "Repair missing destinations" : "Export the live board",
      description: brokenLinks
        ? `${formatNumber(brokenLinks)} wiki links point at pages that do not exist.`
        : "Download a JSON Canvas version of this board for portable visual knowledge work.",
      href: brokenLinks ? "/coverage" : "/api/studio/canvas",
      command: brokenLinks ? "Repair links" : "Export .canvas",
      tone: brokenLinks ? "danger" : "primary",
    },
    {
      title: orphans.length ? "Build bridge articles" : "Publish the map",
      description: orphans.length
        ? `${formatNumber(orphans.length)} pages need inbound links.`
        : "Your selected board has enough graph signal to become a public knowledge surface.",
      href: orphans.length ? "/graph" : "/studio",
      command: orphans.length ? "Open graph" : "Prepare publish view",
      tone: orphans.length ? "warn" : "good",
    },
  ];

  const publishableSurfaces = 1 + bases.filter((base) => base.count > 0).length;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      articles: published.length,
      boardNodes: 1 + articleNodes.length,
      links: boardEdges.length,
      reviewQueue: reviewQueue.length,
      publishableSurfaces,
    },
    board: {
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      nodes: [centerNode, ...articleNodes],
      edges: boardEdges,
    },
    bases,
    actions,
  };
}

function canvasColor(tone: StudioTone): string {
  switch (tone) {
    case "primary":
      return "6";
    case "good":
      return "4";
    case "warn":
      return "3";
    case "danger":
      return "1";
    case "info":
    default:
      return "2";
  }
}

export function toJsonCanvas(report: StudioReport): JsonCanvas {
  const nodeById = new Map(report.board.nodes.map((node) => [node.id, node]));

  return {
    nodes: report.board.nodes.map((node) => {
      const text = `# ${node.title}\n\n${node.subtitle}\n\n${node.metric} / ${node.meta}\n\n${node.href}`;
      if (node.type === "article") {
        return {
          id: node.id,
          type: "file",
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          file: node.href.replace(/^\/articles\//, "articles/") + ".md",
          color: canvasColor(node.tone),
        };
      }

      return {
        id: node.id,
        type: "text",
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        text,
        color: canvasColor(node.tone),
      };
    }),
    edges: report.board.edges
      .filter((edge) => nodeById.has(edge.source) && nodeById.has(edge.target))
      .map((edge) => ({
        id: edge.id,
        fromNode: edge.source,
        toNode: edge.target,
        label: edge.label,
        color: canvasColor(edge.tone),
      })),
  };
}

export async function getStudioReport(): Promise<StudioReport> {
  try {
    const [articles, semanticLinks] = await Promise.all([
      getStudioArticles(),
      getStudioSemanticLinks(),
    ]);
    return buildStudioReport(articles, semanticLinks);
  } catch {
    return starterStudioReport();
  }
}
