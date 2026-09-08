# Portable Bundles

Arkivel portable bundles are the pre-v5 full-site portability contract. The v4.81.0 contract is schema-versioned and dry-run-first so export and import work can harden without hiding compatibility promises in individual endpoints.

## Manifest

Portable bundle manifests use `arkivel.portable-bundle.v1` and include:

- `schemaVersion`
- `appVersion`
- `source` instance metadata
- `createdAt`
- `exportScope`
- `checksums`

The full-site scope covers articles, revisions, categories, tags, users, settings, plugin state, maps, comments, discussions, assets, and customizations.

Sessions, API keys, and analytics are excluded sections by default. Privacy filters must explicitly identify private spaces, draft content, users, analytics, and API keys.

## Dry-Run Imports

Imports must produce a dry-run report before writing. Reports group duplicate slugs, missing assets, unsupported schemas, permission gaps, category conflicts, tag conflicts, user conflicts, blocked changes, and recommended actions.

## Compatibility Promise

Before v5, portable bundles are preview artifacts with explicit schema versions. Arkivel must keep sessions, API keys, and analytics excluded by default; import must dry-run before writes; privacy filters must be visible in the manifest; and schema changes must include migration notes before stable v5 compatibility claims.

## Export Reports

v4.81.1 export hardening adds per-export manifest metadata for Markdown, HTML, JSON, and ZIP downloads. Reports include file counts, byte counts, SHA-256 checksums, warnings, omitted private data, format, status, scope, and privacy filters.

Admins can inspect recent export reports at `/api/export/history` or download them with `/api/export/history?download=1`.
