# Public API v1 Freeze

Arkivel v4.86.0 freezes the pre-v5 public API contract. Existing response bodies remain compatible, and new metadata makes the contract explicit for SDKs, plugins, dashboards, and self-host automation.

## Stable Contract

Use these endpoints for contract metadata:

- `GET /api/v1/contract`
- `GET /api/v1/openapi.json`
- `publicApiV1` in `GET /api/customization`

The contract covers articles, categories, tags, revisions, search, customization, marketplace, plugins, webhooks, exports, and health surfaces.

## Authentication

API-key protected routes continue to use:

```http
X-API-Key: ak_...
```

Workspace-aware API calls may use `workspaceId` query parameters or `X-Arkivel-Workspace`. Use `includeGlobal=1` only when a caller is allowed to include legacy unscoped content.

## Pagination, Sorting, and Filtering

Current v1 list endpoints keep their existing response bodies:

- `GET /api/v1/articles` uses `page` and `limit`, capped at 100.
- `GET /api/v1/search` uses `q` and `limit`, capped at 100.
- `GET /api/v1/categories` and `GET /api/v1/tags` are unpaginated metadata lists.

The frozen contract documents default sorting and supported filters per endpoint. Cursor pagination is reserved for SDK-ready follow-up work and will not replace current v1 page envelopes without a documented version change.

## Headers

v1 responses include compatibility headers:

- `X-Arkivel-API-Version`
- `X-Arkivel-API-Schema`
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

Rate-limit headers are emitted as contract metadata in v4.86.0. Enforcement can harden later without changing the response shape.

## Errors

The standard error shape is:

```json
{
  "error": "Human-readable error",
  "code": "machine_readable_code"
}
```

Future errors may include `requestId` and `details`, but clients should not require those fields.

## Pre-v5 Migration Notes

- Keep existing `/api/v1/articles`, `/api/v1/categories`, `/api/v1/tags`, and `/api/v1/search` integrations on their current envelopes.
- Fetch `/api/v1/contract` during client startup if you need endpoint/filter metadata.
- Fetch `/api/v1/openapi.json` for generated docs or schema checks.
- Prefer documented v1 surfaces over older experimental `/api/v2/*` routes until the SDK v4.86.1 work publishes typed client examples.
