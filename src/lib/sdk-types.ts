import type { ExportManifest } from "./export-hardening";
import type { ArkivelPluginManifest } from "./plugin-manifest";
import type { MarketplaceItem } from "./marketplace";
import type { publicApiV1Contract } from "./public-api-v1";

export const SDK_TYPES_SCHEMA_VERSION = "2026-05-25.v4.86.1";

export type ArkivelApiKeyScope =
  | "articles:read"
  | "categories:read"
  | "tags:read"
  | "revisions:read"
  | "search:read"
  | "customization:read"
  | "marketplace:read"
  | "plugins:read"
  | "webhooks:read"
  | "webhooks:write"
  | "exports:read"
  | "exports:write"
  | "health:read";

export type ArkivelApiPage = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ArkivelTaxonomyRef = {
  name: string;
  slug: string;
};

export type ArkivelArticlePayload = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  contentRaw: string | null;
  published: boolean;
  status: "draft" | "review" | "published" | string;
  coverImage: string | null;
  infobox: unknown;
  category: ArkivelTaxonomyRef | null;
  tags: ArkivelTaxonomyRef[];
  createdAt: string;
  updatedAt: string;
};

export type ArkivelArticlesResponse = {
  articles: ArkivelArticlePayload[];
  pagination: ArkivelApiPage;
};

export type ArkivelCategoryPayload = ArkivelTaxonomyRef & {
  description: string | null;
  sortOrder: number;
  parent: ArkivelTaxonomyRef | null;
  articleCount: number;
  childCount: number;
};

export type ArkivelCategoriesResponse = {
  categories: ArkivelCategoryPayload[];
};

export type ArkivelTagPayload = ArkivelTaxonomyRef & {
  color: string | null;
  parent: ArkivelTaxonomyRef | null;
  articleCount: number;
  childCount: number;
};

export type ArkivelTagsResponse = {
  tags: ArkivelTagPayload[];
};

export type ArkivelSearchResult = {
  title: string;
  slug: string;
  excerpt: string | null;
  category: ArkivelTaxonomyRef | null;
  updatedAt: string;
};

export type ArkivelSearchResponse = {
  results: ArkivelSearchResult[];
  query: string;
};

export type ArkivelWebhookEventName =
  | "article.created"
  | "article.updated"
  | "article.deleted"
  | "article.published"
  | "review.requested"
  | "review.completed"
  | "claim.reviewed"
  | "export.completed"
  | "import.rehearsed"
  | "plugin.enabled"
  | "customization.updated"
  | "user.invited";

export type ArkivelWebhookEvent<TPayload = Record<string, unknown>> = {
  id: string;
  event: ArkivelWebhookEventName;
  occurredAt: string;
  workspaceId?: string | null;
  actorId?: string | null;
  payload: TPayload;
};

export type ArkivelCustomizationManifest = {
  customization: Record<string, unknown>;
  publicApiV1: typeof publicApiV1Contract;
  marketplace?: {
    items?: MarketplaceItem[];
    registryVersion?: string;
  };
  pluginManifestSchema?: Record<string, unknown>;
};

export type ArkivelMarketplacePack = MarketplaceItem;
export type ArkivelPluginManifestPayload = ArkivelPluginManifest;
export type ArkivelExportBundleManifest = ExportManifest;

export const apiKeyScopes: Record<ArkivelApiKeyScope, {
  description: string;
  surfaces: string[];
  write: boolean;
}> = {
  "articles:read": { description: "Read published and permitted workspace articles.", surfaces: ["/api/v1/articles"], write: false },
  "categories:read": { description: "Read category metadata.", surfaces: ["/api/v1/categories"], write: false },
  "tags:read": { description: "Read tag metadata.", surfaces: ["/api/v1/tags"], write: false },
  "revisions:read": { description: "Read permitted revision export metadata.", surfaces: ["/api/articles/:id/revisions/export"], write: false },
  "search:read": { description: "Run permitted search queries.", surfaces: ["/api/v1/search"], write: false },
  "customization:read": { description: "Read public customization and contract manifests.", surfaces: ["/api/customization"], write: false },
  "marketplace:read": { description: "Read local marketplace registry metadata.", surfaces: ["/api/customization"], write: false },
  "plugins:read": { description: "Read plugin manifest and runtime metadata where authorized.", surfaces: ["/api/plugins"], write: false },
  "webhooks:read": { description: "Read webhook configuration where authorized.", surfaces: ["/api/webhooks"], write: false },
  "webhooks:write": { description: "Create, update, test, or delete webhook configuration where authorized.", surfaces: ["/api/webhooks"], write: true },
  "exports:read": { description: "Read export history and manifests where authorized.", surfaces: ["/api/export/history"], write: false },
  "exports:write": { description: "Create or retry export jobs where authorized.", surfaces: ["/api/export/*"], write: true },
  "health:read": { description: "Read public health metadata.", surfaces: ["/api/health"], write: false },
};

export const generatedClientExamples = {
  node: `import { ArkivelClient } from "./arkivel-client";

const client = new ArkivelClient({ baseUrl: process.env.ARKIVEL_URL!, apiKey: process.env.ARKIVEL_API_KEY! });
const { articles } = await client.articles({ limit: 10 });`,
  browser: `const response = await fetch("/api/v1/search?q=canon", {
  headers: { "X-API-Key": window.ARKIVEL_API_KEY }
});
const data = await response.json();`,
  curl: `curl -H "X-API-Key: $ARKIVEL_API_KEY" "$ARKIVEL_URL/api/v1/articles?limit=10"`,
  webhook: `export function verifyArkivelWebhook(event: ArkivelWebhookEvent) {
  return event.id && event.event && event.occurredAt;
}`,
};

export const sampleSdkScripts = [
  { id: "backup", path: "examples/api/backup.mjs", scopes: ["articles:read", "categories:read", "tags:read", "exports:read"] },
  { id: "import", path: "examples/api/import.mjs", scopes: ["articles:read", "exports:write"] },
  { id: "search", path: "examples/api/search.mjs", scopes: ["search:read"] },
  { id: "content-audit", path: "examples/api/content-audit.mjs", scopes: ["articles:read", "search:read"] },
  { id: "webhook-test", path: "examples/api/webhook-test.mjs", scopes: ["webhooks:read", "webhooks:write"] },
];

export const sdkTypesContract = {
  schemaVersion: SDK_TYPES_SCHEMA_VERSION,
  types: [
    "ArkivelArticlePayload",
    "ArkivelArticlesResponse",
    "ArkivelCategoryPayload",
    "ArkivelTagPayload",
    "ArkivelSearchResponse",
    "ArkivelWebhookEvent",
    "ArkivelCustomizationManifest",
    "ArkivelMarketplacePack",
    "ArkivelPluginManifestPayload",
    "ArkivelExportBundleManifest",
  ],
  apiKeyScopes,
  generatedClientExamples,
  sampleScripts: sampleSdkScripts,
  docs: "docs/sdk-types.md",
};
