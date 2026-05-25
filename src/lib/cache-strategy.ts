import { cacheDel, cacheInvalidate } from "@/lib/cache";

export const CACHE_STRATEGY_SCHEMA_VERSION = "2026-05-25.v4.88.1";

export type CacheSurface =
  | "articles"
  | "categories"
  | "feeds"
  | "sitemap"
  | "customization"
  | "marketplace"
  | "plugin-manifests"
  | "search"
  | "dashboards";

export type CacheInvalidationRule = {
  description: string;
  event: string;
  keys: string[];
  revalidatePaths: string[];
  surfaces: CacheSurface[];
};

export const cacheInvalidationRules: CacheInvalidationRule[] = [
  {
    description: "Article writes refresh article lists, article detail, feeds, sitemap, search, dashboards, and related category/tag pages.",
    event: "article.write",
    keys: ["articles:*", "article:*", "search:*", "feeds:*", "sitemap:*", "dashboards:*", "categories:*", "tags:*"],
    revalidatePaths: ["/", "/articles", "/recent-changes", "/feed.xml", "/feed/atom", "/sitemap.xml"],
    surfaces: ["articles", "feeds", "sitemap", "search", "dashboards", "categories"],
  },
  {
    description: "Category writes refresh category pages, article lists, sitemap, customization inheritance, search, and dashboards.",
    event: "category.write",
    keys: ["categories:*", "articles:*", "sitemap:*", "customization:*", "search:*", "dashboards:*"],
    revalidatePaths: ["/", "/categories", "/articles", "/sitemap.xml"],
    surfaces: ["categories", "articles", "sitemap", "customization", "search", "dashboards"],
  },
  {
    description: "Tag writes refresh tag pages, article lists, search facets, sitemap, and dashboards.",
    event: "tag.write",
    keys: ["tags:*", "articles:*", "search:*", "sitemap:*", "dashboards:*"],
    revalidatePaths: ["/tags", "/articles", "/sitemap.xml"],
    surfaces: ["articles", "search", "sitemap", "dashboards"],
  },
  {
    description: "Customization and marketplace writes refresh manifest, marketplace metadata, plugin manifests, dashboards, and public shells.",
    event: "customization.write",
    keys: ["customization:*", "marketplace:*", "plugins:*", "dashboards:*"],
    revalidatePaths: ["/", "/features", "/help", "/admin/customization", "/admin/marketplace"],
    surfaces: ["customization", "marketplace", "plugin-manifests", "dashboards"],
  },
];

export const cacheRecipes = [
  { id: "cdn", label: "CDN", summary: "Cache static assets aggressively, keep admin and authenticated API routes private/no-store." },
  { id: "vercel", label: "Vercel", summary: "Use route revalidation for public pages and avoid caching admin dashboards at the edge." },
  { id: "docker", label: "Docker", summary: "Use Redis for optional app cache and restart workers after schema-affecting deploys." },
  { id: "reverse-proxy", label: "Reverse proxy", summary: "Set public feed/sitemap TTLs, bypass cookies, and never cache mutating API responses." },
] as const;

export const cacheStrategyContract = {
  schemaVersion: CACHE_STRATEGY_SCHEMA_VERSION,
  adminRoute: "/admin/cache",
  apiRoute: "/api/admin/cache",
  rules: cacheInvalidationRules.map((rule) => rule.event),
  recipes: cacheRecipes.map((recipe) => recipe.id),
  staleWarningSurfaces: ["editors", "admins"],
} as const;

export function getCacheInvalidationPlan(event: string): CacheInvalidationRule | null {
  return cacheInvalidationRules.find((rule) => rule.event === event) ?? null;
}

export async function invalidateCacheForEvent(event: string) {
  const rule = getCacheInvalidationPlan(event);
  if (!rule) return { event, invalidatedKeys: [], revalidatePaths: [], surfaces: [] as CacheSurface[] };

  for (const key of rule.keys) {
    if (key.includes("*")) {
      await cacheInvalidate(key);
    } else {
      await cacheDel(key);
    }
  }

  return {
    event,
    invalidatedKeys: rule.keys,
    revalidatePaths: rule.revalidatePaths,
    surfaces: rule.surfaces,
  };
}

export function staleCacheWarning(surface: "editor" | "admin", lastInvalidatedAt: string | null) {
  return {
    message: lastInvalidatedAt
      ? `${surface} data may be stale if it was loaded before ${lastInvalidatedAt}.`
      : `${surface} data may be stale until the next invalidation event runs.`,
    surface,
  };
}
