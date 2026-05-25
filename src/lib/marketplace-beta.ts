import packageJson from "../../package.json";
import {
  SUPPORTED_MARKETPLACE_KINDS,
  createMarketplaceRegistry,
  marketplaceItems,
  type MarketplaceItem,
  type MarketplaceItemKind,
} from "./marketplace";
import { marketplaceSecurityContract } from "./marketplace-security";

export const MARKETPLACE_BETA_SCHEMA_VERSION = "2026-05-25.v4.90.0";

export type MarketplaceCollection = {
  description: string;
  id: string;
  itemIds: string[];
  title: string;
};

export type MarketplaceInstallIntentStep = {
  id: string;
  label: string;
  summary: string;
};

export const marketplaceInstallIntentSteps: MarketplaceInstallIntentStep[] = [
  {
    id: "files",
    label: "Required files",
    summary: "List the local manifest, tokens, slots, screenshots, README, and plugin files the operator must copy.",
  },
  {
    id: "env",
    label: "Environment variables",
    summary: "Explain required NEXT_PUBLIC or server-only env vars before any runtime setting changes.",
  },
  {
    id: "permissions",
    label: "Permissions and data access",
    summary: "Show plugin permissions, dangerous capability warnings, and affected article/category/user/settings data.",
  },
  {
    id: "compatibility",
    label: "Compatibility",
    summary: "Confirm Arkivel version range, schema version, local source, checksums, and screenshot coverage.",
  },
  {
    id: "manual-verification",
    label: "Manual verification",
    summary: "Require an admin to preview, verify checksums, review docs, and enable locally after copying files.",
  },
] as const;

export const marketplaceBetaLimitations = [
  "Marketplace beta is local-first and preview/install-intent oriented; Arkivel does not fetch remote code.",
  "Runtime component, theme, and plugin installation remains manual until lifecycle inventory ships.",
  "Pack screenshots are metadata references and are checksum-planned, not uploaded through the beta endpoint.",
  "Compatibility badges are derived from manifest metadata and do not replace manual testing.",
  "Plugin execution remains trusted-local and admin-enabled only.",
] as const;

export const marketplaceBetaContract = {
  apiRoute: "/api/marketplace/beta",
  docs: "docs/marketplace-beta.md",
  installIntentSteps: marketplaceInstallIntentSteps.map((step) => step.id),
  limitations: marketplaceBetaLimitations,
  schemaVersion: MARKETPLACE_BETA_SCHEMA_VERSION,
  searchFacets: ["kind", "tag", "author", "slot", "layout", "permission", "compatibility"],
  security: marketplaceSecurityContract.apiRoute,
} as const;

export function createMarketplaceBetaReport(items: MarketplaceItem[] = marketplaceItems) {
  const registry = createMarketplaceRegistry(items);
  const kindCounts = Object.fromEntries(
    SUPPORTED_MARKETPLACE_KINDS.map((kind) => [kind, items.filter((item) => item.kind === kind).length]),
  ) as Record<MarketplaceItemKind, number>;
  const screenshotCoverage = items.length === 0
    ? 0
    : Math.round((items.filter((item) => item.screenshots.length > 0).length / items.length) * 100);

  return {
    collections: createMarketplaceCollections(items),
    compatibilityBadges: createCompatibilityBadges(items),
    contract: marketplaceBetaContract,
    featured: items.filter((item) => item.status === "built-in").slice(0, 6).map((item) => item.id),
    installIntent: marketplaceInstallIntentSteps,
    limitations: marketplaceBetaLimitations,
    metrics: {
      authors: new Set(items.map((item) => item.author)).size,
      kindCounts,
      registryHealth: registry.validation.summary?.status ?? (registry.validation.valid ? "healthy" : "errors"),
      screenshotCoverage,
      totalItems: items.length,
      version: packageJson.version,
    },
    recentlyUpdated: [...items]
      .sort((left, right) => right.version.localeCompare(left.version, undefined, { numeric: true }))
      .slice(0, 6)
      .map((item) => item.id),
    recommended: {
      componentPacks: items.filter((item) => item.kind === "component-pack").slice(0, 4).map((item) => item.id),
      layouts: items.filter((item) => item.kind === "layout").slice(0, 4).map((item) => item.id),
      plugins: items.filter((item) => item.kind === "plugin").slice(0, 4).map((item) => item.id),
      themes: items.filter((item) => item.kind === "theme-pack" || item.kind === "color-theme").slice(0, 4).map((item) => item.id),
    },
    searchFacets: createMarketplaceSearchFacets(items),
  };
}

function createCompatibilityBadges(items: MarketplaceItem[]) {
  return items.map((item) => ({
    id: item.id,
    badge: item.compatibility === "future" ? "Future" : item.compatibility.startsWith(">=") ? "Compatible" : "Pinned",
    compatibility: item.compatibility,
  }));
}

function createMarketplaceCollections(items: MarketplaceItem[]): MarketplaceCollection[] {
  return [
    {
      description: "Built-in styles, color themes, and layouts that change the shell without route forks.",
      id: "appearance",
      itemIds: items.filter((item) => ["style", "color-theme", "layout", "theme-pack"].includes(item.kind)).map((item) => item.id),
      title: "Appearance",
    },
    {
      description: "Component packs and slots for future runtime composition.",
      id: "components",
      itemIds: items.filter((item) => item.kind === "component-pack").map((item) => item.id),
      title: "Components",
    },
    {
      description: "Trusted-local plugin manifests and extension examples.",
      id: "plugins",
      itemIds: items.filter((item) => item.kind === "plugin").map((item) => item.id),
      title: "Plugins",
    },
  ];
}

function createMarketplaceSearchFacets(items: MarketplaceItem[]) {
  const values = {
    author: new Set<string>(),
    compatibility: new Set<string>(),
    kind: new Set<string>(),
    layout: new Set<string>(),
    permission: new Set<string>(),
    slot: new Set<string>(),
    tag: new Set<string>(),
  };

  for (const item of items) {
    values.author.add(item.author);
    values.compatibility.add(item.compatibility);
    values.kind.add(item.kind);
    for (const tag of item.tags) values.tag.add(tag);
    if (item.kind === "component-pack") {
      const componentPack = item as MarketplaceItem & { recommendedLayout?: unknown; slots?: unknown };
      if (typeof componentPack.recommendedLayout === "string") values.layout.add(componentPack.recommendedLayout);
      if (Array.isArray(componentPack.slots)) {
        for (const slot of componentPack.slots) if (typeof slot === "string") values.slot.add(slot);
      }
    }
    if (item.kind === "plugin") {
      const plugin = item as MarketplaceItem & { permissions?: unknown };
      if (Array.isArray(plugin.permissions)) {
        for (const permission of plugin.permissions) if (typeof permission === "string") values.permission.add(permission);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, [...value].sort()]),
  );
}
