# Marketplace Beta

Arkivel v4.90.0 launches the local-first marketplace beta as a preview and install-intent layer.

## Surfaces

- `/api/marketplace/beta` publishes landing metrics, featured packs, recently updated packs, recommended packs, collections, search facets, compatibility badges, install-intent steps, and beta limitations.
- `marketplaceBeta` in `/api/customization` exposes the schema version, beta API route, search facets, install-intent step ids, limitations, and security contract link.
- `/admin/marketplace` remains the admin browsing and import-preview surface.

## Catalog Coverage

The beta registry covers styles, color themes, layouts, component packs, theme packs, plugin manifests, examples, screenshots, checksums, compatibility metadata, and status badges from the local registry. Compatibility badges are derived from manifest metadata and still require manual testing before a pack is used in production.

## Landing Groups

The beta report includes:

- Metrics for total items, authors, kind counts, registry health, screenshot coverage, and Arkivel version.
- Featured built-in items.
- Recently updated items sorted by pack version.
- Recommended layouts, component packs, plugins, and themes.
- Appearance, component, and plugin collections.

## Search Facets

Marketplace search and filters are defined for kind, tag, author, slot, layout, permission, and compatibility. These facets are derived from local registry metadata so dashboards and admin UI can filter without scraping pack files.

## Install Intent

Install intent is still manual and review-first. It must explain required files, env vars, permissions, data access, compatibility, checksums, and manual verification before an admin copies local files or enables a trusted plugin.

## Limitations

The beta does not fetch remote code, install files automatically, upload screenshots, or prove compatibility beyond manifest metadata. Plugin execution remains trusted-local and admin-enabled only.
