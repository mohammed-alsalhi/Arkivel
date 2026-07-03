import { cacheDel, cacheInvalidate } from "@/lib/cache";

type CacheSurface =
  | "articles"
  | "categories"
  | "feeds"
  | "sitemap"
  | "customization"
  | "marketplace"
  | "plugin-manifests"
  | "search"
  | "dashboards";

type CacheInvalidationRule = {
  description: string;
  event: string;
  keys: string[];
  revalidatePaths: string[];
  surfaces: CacheSurface[];
};

const cacheInvalidationRules: CacheInvalidationRule[] = [
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
