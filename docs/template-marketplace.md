# Template Marketplace

Arkivel v4.91.1 promotes `template-pack` to a first-class local marketplace kind. Template packs remain preview-safe: they describe reusable space products, but they do not write categories, tags, schemas, navigation, dashboards, or starter articles until a future apply flow exists.

## Template Pack Listings

Template-pack marketplace records include:

- Screenshots and local checksums through the shared marketplace registry.
- Included schema fields such as category trees, article templates, metadata schema, infobox fields, navigation, and dashboards.
- Category tree previews and article template previews.
- Compatibility notes for Arkivel versions and space-template schema requirements.

## Diff Before Apply

`/api/marketplace/templates` publishes a diff shape for comparing two space templates before a future merge:

- Categories: added, removed, and shared slugs.
- Tags: added, removed, and shared tags.
- Metadata fields: added, removed, and shared schema ids.
- Navigation: whether the navigation mode changes.

## Merge Options

The template marketplace contract defines preview-only merge options:

- `append-only`: add missing categories, tags, schemas, and navigation entries.
- `replace-empty`: replace only empty starter placeholders.
- `skip-conflicts`: skip matching slugs or schema ids.
- `metadata-only`: import tags, schemas, infobox fields, navigation, and dashboard metadata without starter articles.

## Export From Space

`exportTemplateFromSpace()` creates a `space-template` JSON shape from an existing space-like input. The v4.91.1 implementation is a local contract and fixture generator; future releases can connect it to persisted workspace/category/article data.

## API

- `GET /api/marketplace/templates` returns the template marketplace report.
- `templateMarketplace` in `/api/customization` exposes the contract for self-host dashboards and plugins.
