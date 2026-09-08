export const PERFORMANCE_BUDGETS_SCHEMA_VERSION = "2026-05-25.v4.88.0";

export type PerformanceSurface =
  | "article-pages"
  | "graph"
  | "studio"
  | "atlas"
  | "trails"
  | "search"
  | "editor-startup"
  | "admin-dashboards"
  | "marketplace";

export type PerformanceBudget = {
  bundleKb: number;
  id: PerformanceSurface;
  interactionMs: number;
  p95Ms: number;
  route: string;
  title: string;
};

export type LargeWikiFixture = {
  articles: number;
  categories: number;
  id: string;
  links: number;
  revisions: number;
  tags: number;
  title: string;
};

export type SlowQueryDiagnostic = {
  category: string;
  id: string;
  queryPattern: string;
  review: string;
  thresholdMs: number;
};

export type PerformanceBudgetResult = PerformanceBudget & {
  observedP95Ms: number | null;
  status: "pass" | "warning" | "fail" | "unknown";
};

export const performanceBudgets: PerformanceBudget[] = [
  { bundleKb: 260, id: "article-pages", interactionMs: 100, p95Ms: 700, route: "/articles/[slug]", title: "Article pages" },
  { bundleKb: 420, id: "graph", interactionMs: 160, p95Ms: 1200, route: "/graph", title: "Graph surfaces" },
  { bundleKb: 360, id: "studio", interactionMs: 150, p95Ms: 1100, route: "/studio", title: "Studio" },
  { bundleKb: 380, id: "atlas", interactionMs: 160, p95Ms: 1200, route: "/atlas", title: "Atlas" },
  { bundleKb: 280, id: "trails", interactionMs: 120, p95Ms: 850, route: "/trails", title: "Trails" },
  { bundleKb: 220, id: "search", interactionMs: 100, p95Ms: 600, route: "/search", title: "Search" },
  { bundleKb: 620, id: "editor-startup", interactionMs: 180, p95Ms: 1500, route: "/articles/[slug]/edit", title: "Editor startup" },
  { bundleKb: 300, id: "admin-dashboards", interactionMs: 140, p95Ms: 900, route: "/admin", title: "Admin dashboards" },
  { bundleKb: 260, id: "marketplace", interactionMs: 120, p95Ms: 800, route: "/admin/marketplace", title: "Marketplace" },
];

export const largeWikiFixtures: LargeWikiFixture[] = [
  { articles: 250, categories: 25, id: "small-team", links: 1200, revisions: 1500, tags: 80, title: "Small team knowledge base" },
  { articles: 2500, categories: 120, id: "large-archive", links: 18000, revisions: 22000, tags: 450, title: "Large archive" },
  { articles: 10000, categories: 400, id: "public-docs", links: 90000, revisions: 140000, tags: 1200, title: "Public docs stress set" },
];

export const slowQueryDiagnostics: SlowQueryDiagnostic[] = [
  {
    category: "articles",
    id: "article-list-filters",
    queryPattern: "Article.findMany with category, tag, workspace, status, and search filters",
    review: "Confirm compound indexes and pagination are used before increasing list limits.",
    thresholdMs: 250,
  },
  {
    category: "search",
    id: "fallback-like-search",
    queryPattern: "LIKE-based fallback search across title/content/excerpt",
    review: "Prefer tsvector results and inspect fallback frequency from search_response_time metrics.",
    thresholdMs: 400,
  },
  {
    category: "graph",
    id: "graph-neighborhood",
    queryPattern: "Wiki links, semantic links, backlinks, and workspace scoping",
    review: "Cap depth and node counts for large wikis; profile center/depth combinations.",
    thresholdMs: 650,
  },
  {
    category: "admin",
    id: "operations-aggregate",
    queryPattern: "MetricLog, WebhookDelivery, ExportHistory, PluginState aggregate reads",
    review: "Keep dashboard aggregates bounded to recent windows and indexed fields.",
    thresholdMs: 500,
  },
];

export const performanceBudgetsContract = {
  schemaVersion: PERFORMANCE_BUDGETS_SCHEMA_VERSION,
  adminRoute: "/admin/performance",
  apiRoute: "/api/admin/performance",
  budgetTypes: ["route-p95", "bundle-kb", "interaction-ms"],
  profileSurfaces: performanceBudgets.map((budget) => budget.id),
  fixtures: largeWikiFixtures.map((fixture) => fixture.id),
  slowQueryDiagnostics: slowQueryDiagnostics.map((diagnostic) => diagnostic.id),
} as const;

export function evaluatePerformanceBudget(
  budget: PerformanceBudget,
  observedP95Ms: number | null | undefined,
): PerformanceBudgetResult {
  if (observedP95Ms == null) {
    return { ...budget, observedP95Ms: null, status: "unknown" };
  }
  if (observedP95Ms > budget.p95Ms * 1.25) {
    return { ...budget, observedP95Ms, status: "fail" };
  }
  if (observedP95Ms > budget.p95Ms) {
    return { ...budget, observedP95Ms, status: "warning" };
  }
  return { ...budget, observedP95Ms, status: "pass" };
}

export function matchBudgetForPath(path: string): PerformanceBudget | null {
  if (path.startsWith("/articles/") && path.endsWith("/edit")) {
    return performanceBudgets.find((budget) => budget.id === "editor-startup") ?? null;
  }
  if (path.startsWith("/articles/")) {
    return performanceBudgets.find((budget) => budget.id === "article-pages") ?? null;
  }
  if (path.startsWith("/admin/marketplace")) {
    return performanceBudgets.find((budget) => budget.id === "marketplace") ?? null;
  }
  if (path.startsWith("/admin")) {
    return performanceBudgets.find((budget) => budget.id === "admin-dashboards") ?? null;
  }
  return performanceBudgets.find((budget) => path.startsWith(budget.route.replace("/[slug]", ""))) ?? null;
}
