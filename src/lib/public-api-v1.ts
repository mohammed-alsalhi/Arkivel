export const PUBLIC_API_V1_SCHEMA_VERSION = "2026-05-25.v4.86.0";

export type ApiV1Surface =
  | "articles"
  | "categories"
  | "tags"
  | "revisions"
  | "search"
  | "customization"
  | "marketplace"
  | "plugins"
  | "webhooks"
  | "exports"
  | "health";

export type ApiV1Endpoint = {
  id: string;
  surface: ApiV1Surface;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  auth: "api-key" | "admin-session" | "public" | "mixed";
  stable: boolean;
  pagination?: "page" | "cursor" | "none";
  sorting?: string[];
  filtering?: string[];
  responseEnvelope: string;
};

export const apiV1Endpoints: ApiV1Endpoint[] = [
  {
    id: "v1.articles.list",
    surface: "articles",
    method: "GET",
    path: "/api/v1/articles",
    auth: "api-key",
    stable: true,
    pagination: "page",
    sorting: ["updatedAt:desc"],
    filtering: ["category", "tag", "status", "workspaceId", "includeGlobal"],
    responseEnvelope: "{ articles, pagination }",
  },
  {
    id: "v1.categories.list",
    surface: "categories",
    method: "GET",
    path: "/api/v1/categories",
    auth: "api-key",
    stable: true,
    pagination: "none",
    sorting: ["sortOrder:asc"],
    filtering: [],
    responseEnvelope: "{ categories }",
  },
  {
    id: "v1.tags.list",
    surface: "tags",
    method: "GET",
    path: "/api/v1/tags",
    auth: "api-key",
    stable: true,
    pagination: "none",
    sorting: ["name:asc"],
    filtering: [],
    responseEnvelope: "{ tags }",
  },
  {
    id: "v1.search.query",
    surface: "search",
    method: "GET",
    path: "/api/v1/search",
    auth: "api-key",
    stable: true,
    pagination: "none",
    sorting: ["relevance:desc"],
    filtering: ["q", "limit", "workspaceId", "includeGlobal"],
    responseEnvelope: "{ results, query }",
  },
  {
    id: "v1.customization.read",
    surface: "customization",
    method: "GET",
    path: "/api/customization",
    auth: "public",
    stable: true,
    pagination: "none",
    responseEnvelope: "{ customization, options, ui, marketplace }",
  },
  {
    id: "v1.marketplace.read",
    surface: "marketplace",
    method: "GET",
    path: "/api/customization#marketplace",
    auth: "public",
    stable: true,
    pagination: "none",
    responseEnvelope: "{ marketplace }",
  },
  {
    id: "v1.plugins.list",
    surface: "plugins",
    method: "GET",
    path: "/api/plugins",
    auth: "admin-session",
    stable: true,
    pagination: "none",
    responseEnvelope: "{ plugins, runtime }",
  },
  {
    id: "v1.webhooks.manage",
    surface: "webhooks",
    method: "GET",
    path: "/api/webhooks",
    auth: "admin-session",
    stable: true,
    pagination: "none",
    responseEnvelope: "{ webhooks }",
  },
  {
    id: "v1.exports.history",
    surface: "exports",
    method: "GET",
    path: "/api/export/history",
    auth: "admin-session",
    stable: true,
    pagination: "page",
    sorting: ["createdAt:desc"],
    filtering: ["format", "status", "scope"],
    responseEnvelope: "{ exports, pagination }",
  },
  {
    id: "v1.revisions.export",
    surface: "revisions",
    method: "GET",
    path: "/api/articles/:id/revisions/export",
    auth: "admin-session",
    stable: true,
    pagination: "none",
    responseEnvelope: "{ article, revisions }",
  },
  {
    id: "v1.health.read",
    surface: "health",
    method: "GET",
    path: "/api/health",
    auth: "public",
    stable: true,
    pagination: "none",
    responseEnvelope: "{ status, uptime, dbConnected, version, articleCount, timestamp }",
  },
];

export const apiV1ErrorContract = {
  shape: "{ error: string, code?: string, requestId?: string, details?: unknown }",
  statuses: {
    400: "Invalid query, body, pagination, sorting, or filter parameters.",
    401: "Missing or invalid X-API-Key for API-key protected endpoints.",
    403: "Authenticated actor lacks permission for the requested workspace or admin surface.",
    404: "Resource not found or intentionally hidden by workspace visibility.",
    409: "Write conflict, duplicate active request, or immutable state transition.",
    429: "Rate limit exceeded; retry after the provided header delay.",
    500: "Unexpected server error.",
  },
};

export const apiV1PaginationContract = {
  page: {
    params: ["page", "limit"],
    response: ["page", "limit", "total", "totalPages"],
    maxLimit: 100,
  },
  cursor: {
    params: ["cursor", "limit"],
    response: ["hasMore", "nextCursor"],
    maxLimit: 100,
    note: "Cursor pagination is reserved for SDK-ready follow-up endpoints; v1 frozen routes keep page pagination where already shipped.",
  },
};

export const apiV1RateLimitContract = {
  headers: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  defaults: {
    limit: 600,
    windowSeconds: 3600,
  },
  note: "Headers are emitted as compatibility metadata in v4.86.0; enforcement can harden without changing response shape.",
};

export const apiV1Headers = {
  "X-Arkivel-API-Version": "v1",
  "X-Arkivel-API-Schema": PUBLIC_API_V1_SCHEMA_VERSION,
  "X-RateLimit-Limit": String(apiV1RateLimitContract.defaults.limit),
  "X-RateLimit-Remaining": String(apiV1RateLimitContract.defaults.limit),
  "X-RateLimit-Reset": String(apiV1RateLimitContract.defaults.windowSeconds),
};

export const apiV1FixtureResponses = {
  articles: {
    articles: [
      {
        title: "Example Article",
        slug: "example-article",
        excerpt: "A stable v1 fixture article.",
        content: "<p>A stable v1 fixture article.</p>",
        contentRaw: "A stable v1 fixture article.",
        published: true,
        status: "published",
        coverImage: null,
        infobox: null,
        category: { name: "Examples", slug: "examples" },
        tags: [{ name: "API", slug: "api" }],
        createdAt: "2026-05-25T00:00:00.000Z",
        updatedAt: "2026-05-25T00:00:00.000Z",
      },
    ],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  },
  search: {
    results: [
      {
        title: "Example Article",
        slug: "example-article",
        excerpt: "A stable v1 fixture article.",
        category: { name: "Examples", slug: "examples" },
        updatedAt: "2026-05-25T00:00:00.000Z",
      },
    ],
    query: "example",
  },
};

export const publicApiV1Contract = {
  schemaVersion: PUBLIC_API_V1_SCHEMA_VERSION,
  basePath: "/api/v1",
  auth: {
    header: "X-API-Key",
    permissionFailure: apiV1ErrorContract.statuses[403],
    workspaceScoping: "Use workspaceId or X-Arkivel-Workspace with includeGlobal=1 for legacy unscoped content when allowed.",
  },
  endpoints: apiV1Endpoints,
  errors: apiV1ErrorContract,
  pagination: apiV1PaginationContract,
  rateLimits: apiV1RateLimitContract,
  fixtures: apiV1FixtureResponses,
  openApiPath: "/api/v1/openapi.json",
  migrationGuide: "docs/api-v1-migration.md",
};

export function createApiV1Error(error: string, status: number, code?: string) {
  return {
    body: { error, code: code ?? `api_v1_${status}` },
    status,
    headers: apiV1Headers,
  };
}

export function createPublicApiV1OpenApiSpec(baseUrl = "http://localhost:3000") {
  const paths = Object.fromEntries(
    apiV1Endpoints
      .filter((endpoint) => endpoint.path.startsWith("/api/"))
      .map((endpoint) => [
        endpoint.path.replace(/:([A-Za-z0-9_]+)/g, "{$1}"),
        {
          [endpoint.method.toLowerCase()]: {
            operationId: endpoint.id.replace(/\./g, "_"),
            tags: [endpoint.surface],
            summary: endpoint.responseEnvelope,
            security: endpoint.auth === "api-key" ? [{ ApiKeyAuth: [] }] : [],
            responses: {
              200: { description: endpoint.responseEnvelope },
              400: { description: apiV1ErrorContract.statuses[400] },
              401: { description: apiV1ErrorContract.statuses[401] },
              403: { description: apiV1ErrorContract.statuses[403] },
              429: { description: apiV1ErrorContract.statuses[429] },
            },
          },
        },
      ])
  );

  return {
    openapi: "3.1.0",
    info: {
      title: "Arkivel Public API v1",
      version: PUBLIC_API_V1_SCHEMA_VERSION,
      description: "Frozen pre-v5 Arkivel API contract metadata.",
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
      },
    },
    paths,
  };
}
