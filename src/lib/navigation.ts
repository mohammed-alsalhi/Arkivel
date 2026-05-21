export type CommandDestination = {
  id: string;
  label: string;
  href: string;
  group: string;
  keywords: string[];
  shortcut?: string;
  adminOnly?: boolean;
};

const FOCUSED_EXACT_PATHS = new Set(["/ask", "/graph", "/split", "/map"]);
const FOCUSED_PREFIXES = ["/map/", "/present"];

export function isFocusedWorkspacePath(pathname: string): boolean {
  return (
    FOCUSED_EXACT_PATHS.has(pathname) ||
    FOCUSED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export const COMMAND_DESTINATIONS: CommandDestination[] = [
  {
    id: "nav-home",
    label: "Home",
    href: "/",
    group: "Navigation",
    keywords: ["main", "page", "dashboard", "start"],
    shortcut: "G H",
  },
  {
    id: "nav-articles",
    label: "All Articles",
    href: "/articles",
    group: "Navigation",
    keywords: ["articles", "list", "browse"],
    shortcut: "G A",
  },
  {
    id: "nav-search",
    label: "Search",
    href: "/search",
    group: "Navigation",
    keywords: ["search", "find", "query"],
    shortcut: "G S",
  },
  {
    id: "nav-recent",
    label: "Recent Changes",
    href: "/recent-changes",
    group: "Navigation",
    keywords: ["recent", "changes", "history", "activity", "log"],
    shortcut: "G R",
  },
  {
    id: "nav-categories",
    label: "Categories",
    href: "/categories",
    group: "Navigation",
    keywords: ["categories", "topics", "sections"],
  },
  {
    id: "nav-tags",
    label: "Tags",
    href: "/tags",
    group: "Navigation",
    keywords: ["tags", "labels", "taxonomy"],
  },
  {
    id: "nav-graph",
    label: "Article Graph",
    href: "/graph",
    group: "Discovery",
    keywords: ["graph", "network", "visualization", "map", "connections"],
    shortcut: "G G",
  },
  {
    id: "nav-intelligence",
    label: "Knowledge Command Center",
    href: "/intelligence",
    group: "Discovery",
    keywords: ["intelligence", "command", "ops", "signals", "quality", "canon", "cockpit", "radar", "constellation", "simulator", "usp"],
  },
  {
    id: "nav-ask",
    label: "Ask My Wiki",
    href: "/ask",
    group: "Discovery",
    keywords: ["ask", "ai", "oracle", "assistant", "question"],
  },
  {
    id: "nav-health",
    label: "Wiki Health",
    href: "/health",
    group: "Discovery",
    keywords: ["health", "quality", "audit", "stubs", "broken links"],
  },
  {
    id: "nav-coverage",
    label: "Coverage Map",
    href: "/coverage",
    group: "Discovery",
    keywords: ["coverage", "gaps", "categories", "quality"],
  },
  {
    id: "nav-glossary",
    label: "Glossary",
    href: "/glossary",
    group: "Discovery",
    keywords: ["glossary", "terms", "definitions"],
  },
  {
    id: "nav-timeline",
    label: "Timeline",
    href: "/timeline",
    group: "Discovery",
    keywords: ["timeline", "chronology", "dates"],
  },
  {
    id: "nav-random",
    label: "Random Article",
    href: "/random",
    group: "Discovery",
    keywords: ["random", "surprise", "lucky"],
  },
  {
    id: "nav-dashboard",
    label: "My Dashboard",
    href: "/dashboard",
    group: "Personal",
    keywords: ["dashboard", "widgets", "personal"],
  },
  {
    id: "nav-bookmarks",
    label: "Bookmarks",
    href: "/bookmarks",
    group: "Personal",
    keywords: ["bookmarks", "saved", "personal"],
  },
  {
    id: "nav-watchlist",
    label: "Watchlist",
    href: "/watchlist",
    group: "Personal",
    keywords: ["watchlist", "watch", "notifications"],
  },
  {
    id: "nav-reading-lists",
    label: "Reading Lists",
    href: "/reading-lists",
    group: "Personal",
    keywords: ["reading", "lists", "collections"],
  },
  {
    id: "nav-help",
    label: "Help",
    href: "/help",
    group: "Reference",
    keywords: ["help", "documentation", "guide", "faq"],
  },
  {
    id: "nav-features",
    label: "Features",
    href: "/features",
    group: "Reference",
    keywords: ["features", "reference", "capabilities"],
  },
  {
    id: "nav-api-docs",
    label: "API Docs",
    href: "/api-docs",
    group: "Reference",
    keywords: ["api", "docs", "rest", "integration"],
  },
  {
    id: "admin-users",
    label: "Users",
    href: "/admin/users",
    group: "Admin",
    keywords: ["users", "accounts", "members", "roles"],
    adminOnly: true,
  },
  {
    id: "admin-metrics",
    label: "Metrics",
    href: "/admin/metrics",
    group: "Admin",
    keywords: ["metrics", "analytics", "performance", "monitoring"],
    adminOnly: true,
  },
  {
    id: "admin-search-analytics",
    label: "Search Analytics",
    href: "/admin/search-analytics",
    group: "Admin",
    keywords: ["search", "analytics", "queries", "zero results"],
    adminOnly: true,
  },
  {
    id: "admin-lint",
    label: "Lint Articles",
    href: "/admin/lint",
    group: "Admin",
    keywords: ["lint", "check", "validate", "quality"],
    adminOnly: true,
  },
  {
    id: "admin-plugins",
    label: "Plugins",
    href: "/admin/plugins",
    group: "Admin",
    keywords: ["plugins", "extensions", "modules"],
    adminOnly: true,
  },
  {
    id: "admin-webhooks",
    label: "Webhooks",
    href: "/admin/webhooks",
    group: "Admin",
    keywords: ["webhooks", "hooks", "integrations", "notifications"],
    adminOnly: true,
  },
];
