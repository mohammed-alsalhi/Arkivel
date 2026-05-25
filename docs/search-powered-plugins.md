# Search-Powered Plugins

Arkivel exposes a stable search API contract for plugins, widgets, dashboards, external tools, and future mobile clients.

## Contract

Use `GET /api/search/contract` or `GET /api/customization` and read `searchApi`.

The contract version is `arkivel.search-api.v1`. Result kinds are:

- `article`
- `category`
- `tag`
- `discussion`
- `revision`
- `marketplace-item`

Each result kind shares `id`, `kind`, `title`, `url`, optional `excerpt`, optional `score`, and optional `highlights`, then adds kind-specific fields such as `slug`, `status`, `articleSlug`, `visibility`, `createdAt`, `itemKind`, and `version`.

## Privacy And Retention

Search analytics retention defaults to 90 days. The contract declares IP anonymization, raw-query storage, future opt-out planning, and public-client redaction fields for email, IP address, user id, private notes, and draft content.

## Webhooks

Planned search-powered webhook events are:

- `saved_search.hit`
- `content.important_change`

Payload planning fields are `event`, `query`, `resultKind`, `resultId`, `workspaceId`, and `createdAt`.

## Plugin Guidance

- Prefer `/api/search/contract` at startup and cache by `schemaVersion`.
- Treat `score`, `highlights`, and explain metadata as additive.
- Redact non-public discussion excerpts before showing results outside trusted admin surfaces.
- Use `/api/search?explain=1` only for admin/debug tools.
