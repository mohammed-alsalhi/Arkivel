import { describe, expect, it } from "vitest";
import {
  apiV1Endpoints,
  apiV1FixtureResponses,
  apiV1Headers,
  createApiV1Error,
  createPublicApiV1OpenApiSpec,
  publicApiV1Contract,
} from "../public-api-v1";

describe("public api v1 contract", () => {
  it("freezes the required pre-v5 surfaces", () => {
    expect(apiV1Endpoints.map((endpoint) => endpoint.surface)).toEqual(expect.arrayContaining([
      "articles",
      "categories",
      "tags",
      "revisions",
      "search",
      "customization",
      "plugins",
      "webhooks",
      "exports",
      "health",
    ]));
    expect(publicApiV1Contract.openApiPath).toBe("/api/v1/openapi.json");
  });

  it("standardizes headers, errors, and fixtures", () => {
    expect(apiV1Headers["X-Arkivel-API-Version"]).toBe("v1");
    expect(createApiV1Error("Nope", 403).body.code).toBe("api_v1_403");
    expect(apiV1FixtureResponses.articles.pagination.totalPages).toBe(1);
    expect(publicApiV1Contract.errors.shape).toContain("error");
  });

  it("generates an OpenAPI shell for stable endpoints", () => {
    const spec = createPublicApiV1OpenApiSpec("https://example.test");
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.servers[0].url).toBe("https://example.test");
    expect(spec.paths["/api/v1/articles"].get.operationId).toBe("v1_articles_list");
    expect(spec.components.securitySchemes.ApiKeyAuth.name).toBe("X-API-Key");
    expect(spec.components.securitySchemes.AdminSession.name).toBe("session_token");
    expect(spec.paths["/api/plugins"].get.security).toEqual([{ AdminSession: [] }]);
    expect(spec.paths["/api/articles/{id}/revisions/export"].get.parameters).toEqual([
      { name: "id", in: "path", required: true, schema: { type: "string" } },
    ]);
    expect(spec.paths["/api/v1/articles"].get.parameters).toEqual(expect.arrayContaining([
      { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 } },
      { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
      { name: "category", in: "query", required: false, schema: { type: "string" } },
    ]));
    expect(spec.paths["/api/v1/search"].get.parameters.map((parameter) => parameter.name)).toEqual([
      "q",
      "limit",
      "workspaceId",
      "includeGlobal",
    ]);
    expect(Object.keys(spec.paths)).toHaveLength(apiV1Endpoints.length);
    expect(spec.paths["/api/plugins"].get.responses[200].description).toBe("{ errors, loader, plugins }");
    expect(spec.paths["/api/export/history"].get.responses[200].description).toBe("{ contract, history }");
    expect(spec.paths["/api/articles/{id}/revisions/export"].get.responses[200].description).toBe("text/csv revision export");
    expect(Object.keys(spec.paths).every((path) => !path.includes("#"))).toBe(true);
  });
});
