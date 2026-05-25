export const DISCOVERY_ENGINE_SCHEMA_VERSION = "arkivel.discovery-engines.v1";

export type DiscoveryArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
  tags?: Array<{ tag?: { name?: string | null; slug?: string | null } }>;
};

export type DiscoveryOpportunity = {
  id: string;
  title: string;
  description: string;
  href: string;
  severity: "info" | "warning" | "high";
  type: "duplicate-page" | "unresolved-question" | "canon-conflict" | "glossary-gap" | "orphan-topic";
};

export const discoveryEngineContract = {
  schemaVersion: DISCOVERY_ENGINE_SCHEMA_VERSION,
  engines: ["duplicate-page", "unresolved-question", "canon-conflict", "glossary-gap", "orphan-topic"],
  clusterInputs: ["wiki links", "tags", "categories", "semantic relations", "content similarity"],
  modules: ["topic clusters", "related trails", "continue reading", "admin actions", "dashboard widgets"],
  adminActions: ["merge duplicate", "connect orphan", "seed glossary entry", "resolve canon conflict", "answer unresolved question"],
  dashboardWidgets: ["duplicate candidates", "orphan topics", "glossary gaps", "unresolved questions", "continue reading coverage"],
};

export function buildDiscoveryReport(articles: DiscoveryArticle[], glossaryTerms: string[] = []) {
  const opportunities = [
    ...detectDuplicatePages(articles),
    ...detectUnresolvedQuestions(articles),
    ...detectCanonConflicts(articles),
    ...detectGlossaryGaps(articles, glossaryTerms),
    ...detectOrphanTopics(articles),
  ];
  const clusters = buildTopicClusters(articles);

  return {
    schemaVersion: DISCOVERY_ENGINE_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    summary: {
      opportunities: opportunities.length,
      clusters: clusters.length,
      highSeverity: opportunities.filter((item) => item.severity === "high").length,
    },
    opportunities,
    clusters,
    widgets: discoveryEngineContract.dashboardWidgets.map((widget) => ({
      id: widget.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      label: widget,
      count: opportunities.filter((item) => item.title.toLowerCase().includes(widget.split(" ")[0])).length,
    })),
  };
}

export function detectDuplicatePages(articles: DiscoveryArticle[]): DiscoveryOpportunity[] {
  const opportunities: DiscoveryOpportunity[] = [];
  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      const similarity = jaccard(words(articles[i].content), words(articles[j].content));
      if (similarity >= 0.55) {
        opportunities.push({
          id: `duplicate-${articles[i].id}-${articles[j].id}`,
          title: "Duplicate page candidate",
          description: `${articles[i].title} and ${articles[j].title} are ${Math.round(similarity * 100)}% similar.`,
          href: `/admin/duplicate-content`,
          severity: similarity >= 0.75 ? "high" : "warning",
          type: "duplicate-page",
        });
      }
    }
  }
  return opportunities;
}

export function detectUnresolvedQuestions(articles: DiscoveryArticle[]): DiscoveryOpportunity[] {
  return articles.flatMap((article) => {
    const questions = stripHtml(article.content).match(/(?:TODO|FIXME|TBD|open question|unresolved|\?)/gi) ?? [];
    if (questions.length === 0) return [];
    return [{
      id: `question-${article.id}`,
      title: "Unresolved question",
      description: `${article.title} contains ${questions.length} unresolved marker${questions.length === 1 ? "" : "s"}.`,
      href: `/articles/${article.slug}`,
      severity: questions.length > 2 ? "high" : "warning",
      type: "unresolved-question" as const,
    }];
  });
}

export function detectCanonConflicts(articles: DiscoveryArticle[]): DiscoveryOpportunity[] {
  return articles
    .filter((article) => /canon conflict|contradiction|conflicts with/i.test(article.content))
    .map((article) => ({
      id: `canon-conflict-${article.id}`,
      title: "Canon conflict",
      description: `${article.title} contains conflict language that needs editorial resolution.`,
      href: `/articles/${article.slug}`,
      severity: "high" as const,
      type: "canon-conflict" as const,
    }));
}

export function detectGlossaryGaps(articles: DiscoveryArticle[], glossaryTerms: string[]): DiscoveryOpportunity[] {
  const known = new Set(glossaryTerms.map((term) => term.toLowerCase()));
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const term of stripHtml(article.content).match(/\b[A-Z][A-Za-z0-9-]{3,}(?:\s+[A-Z][A-Za-z0-9-]{3,})?\b/g) ?? []) {
      if (!known.has(term.toLowerCase())) counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .slice(0, 20)
    .map(([term, count]) => ({
      id: `glossary-gap-${slugify(term)}`,
      title: "Glossary gap",
      description: `${term} appears ${count} times but is not in the glossary.`,
      href: `/admin/glossary`,
      severity: count >= 4 ? "high" as const : "warning" as const,
      type: "glossary-gap" as const,
    }));
}

export function detectOrphanTopics(articles: DiscoveryArticle[]): DiscoveryOpportunity[] {
  const targets = new Set(articles.flatMap((article) => extractWikiLinks(article.content).map(normalize)));
  return articles
    .filter((article) => !targets.has(normalize(article.title)) && !targets.has(normalize(article.slug)))
    .slice(0, 50)
    .map((article) => ({
      id: `orphan-${article.id}`,
      title: "Orphan topic",
      description: `${article.title} has no inbound wiki links.`,
      href: `/articles/${article.slug}`,
      severity: "warning" as const,
      type: "orphan-topic" as const,
    }));
}

export function buildTopicClusters(articles: DiscoveryArticle[]) {
  const groups = new Map<string, DiscoveryArticle[]>();
  for (const article of articles) {
    const keys = [
      article.category?.slug,
      ...(article.tags ?? []).map((tagRef) => tagRef.tag?.slug),
    ].filter((key): key is string => Boolean(key));
    for (const key of keys.length ? keys : ["uncategorized"]) {
      groups.set(key, [...(groups.get(key) ?? []), article]);
    }
  }
  return [...groups.entries()].map(([id, items]) => ({
    id,
    title: id.replace(/-/g, " "),
    articleCount: items.length,
    href: `/search?${new URLSearchParams({ q: id.replace(/-/g, " ") })}`,
    continueReading: items.slice(0, 5).map((article) => ({
      title: article.title,
      href: `/articles/${article.slug}`,
      reason: article.category?.name ? `More from ${article.category.name}` : "Related topic cluster",
    })),
  }));
}

function extractWikiLinks(content: string) {
  const links: string[] = [];
  const htmlRegex = /data-wiki-link="([^"]+)"/g;
  const markdownRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = htmlRegex.exec(content)) !== null) links.push(match[1]);
  while ((match = markdownRegex.exec(content)) !== null) links.push(match[1]);
  return links;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function words(value: string) {
  return new Set(stripHtml(value).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3));
}

function jaccard(a: Set<string>, b: Set<string>) {
  const intersection = [...a].filter((word) => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
