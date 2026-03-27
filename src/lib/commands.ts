import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type Command = {
  id: string;
  label: string;
  group: string;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
  adminOnly?: boolean;
};

export function getCommands(
  router: AppRouterInstance,
  toggleTheme: () => void
): Command[] {
  return [
    // ── Navigation ──
    {
      id: "nav-home",
      label: "Home",
      group: "Navigation",
      keywords: ["main", "page", "dashboard", "start"],
      shortcut: "G H",
      action: () => router.push("/"),
    },
    {
      id: "nav-articles",
      label: "All Articles",
      group: "Navigation",
      keywords: ["articles", "list", "browse"],
      shortcut: "G A",
      action: () => router.push("/articles"),
    },
    {
      id: "nav-categories",
      label: "Categories",
      group: "Navigation",
      keywords: ["categories", "topics", "sections"],
      action: () => router.push("/categories"),
    },
    {
      id: "nav-search",
      label: "Search",
      group: "Navigation",
      keywords: ["search", "find", "query"],
      shortcut: "G S",
      action: () => router.push("/search"),
    },
    {
      id: "nav-graph",
      label: "Article Graph",
      group: "Navigation",
      keywords: ["graph", "network", "visualization", "map", "connections"],
      shortcut: "G G",
      action: () => router.push("/graph"),
    },
    {
      id: "nav-recent",
      label: "Recent Changes",
      group: "Navigation",
      keywords: ["recent", "changes", "history", "activity", "log"],
      shortcut: "G R",
      action: () => router.push("/recent-changes"),
    },
    {
      id: "nav-tags",
      label: "Tags",
      group: "Navigation",
      keywords: ["tags", "labels"],
      action: () => router.push("/tags"),
    },
    {
      id: "nav-history",
      label: "Reading History",
      group: "Navigation",
      keywords: ["history", "recently read", "viewed", "visited", "reading", "log"],
      action: () => router.push("/history"),
    },
    {
      id: "nav-help",
      label: "Help",
      group: "Navigation",
      keywords: ["help", "documentation", "guide", "faq"],
      action: () => router.push("/help"),
    },

    // ── Actions ──
    {
      id: "action-new-article",
      label: "New Article",
      group: "Actions",
      keywords: ["create", "new", "article", "write", "draft"],
      shortcut: "G N",
      action: () => router.push("/articles/new"),
    },
    {
      id: "action-export",
      label: "Export",
      group: "Actions",
      keywords: ["export", "download", "backup"],
      action: () => router.push("/export"),
    },
    {
      id: "action-toggle-theme",
      label: "Toggle Theme",
      group: "Actions",
      keywords: ["theme", "dark", "light", "mode", "appearance"],
      action: toggleTheme,
    },
    {
      id: "action-random",
      label: "Random Article",
      group: "Actions",
      keywords: ["random", "surprise", "lucky"],
      action: () => router.push("/random"),
    },
    {
      id: "action-settings",
      label: "Settings",
      group: "Actions",
      keywords: ["settings", "preferences", "options", "config"],
      action: () => router.push("/settings"),
    },

    // ── Admin ──
    {
      id: "admin-metrics",
      label: "Metrics",
      group: "Admin",
      keywords: ["metrics", "analytics", "performance", "monitoring"],
      adminOnly: true,
      action: () => router.push("/admin/metrics"),
    },
    {
      id: "admin-plugins",
      label: "Plugins",
      group: "Admin",
      keywords: ["plugins", "extensions", "modules"],
      adminOnly: true,
      action: () => router.push("/admin/plugins"),
    },
    {
      id: "admin-webhooks",
      label: "Webhooks",
      group: "Admin",
      keywords: ["webhooks", "hooks", "integrations", "notifications"],
      adminOnly: true,
      action: () => router.push("/admin/webhooks"),
    },
    {
      id: "admin-users",
      label: "Users",
      group: "Admin",
      keywords: ["users", "accounts", "members", "roles"],
      adminOnly: true,
      action: () => router.push("/admin/users"),
    },
    {
      id: "admin-lint",
      label: "Lint Articles",
      group: "Admin",
      keywords: ["lint", "check", "validate", "quality"],
      adminOnly: true,
      action: () => router.push("/admin/lint"),
    },
  ];
}
