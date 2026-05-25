# Space Templates

Space templates are preview-safe JSON manifests for starting a category tree with article templates, sample metadata, tags, infobox fields, navigation, dashboards, layout intent, and recommended component packs.

## Contract

- `schemaVersion`: `arkivel.space-template.v1`
- `kind`: `space-template`
- `id`: stable lowercase local id
- `version`: semantic template version
- `compatibility`: minimum Arkivel version, for example `>=4.79.2`
- `categoryTree`: root categories with optional nested children
- `articleTemplates`: starter article titles, slugs, excerpts, and draft/review/published status
- `metadataSchema`: typed fields for the space
- `defaultTags`: tags suggested for starter content
- `infoboxFields`: fields for article fact panels
- `sampleMetadata`: sample owner, status, and review-cadence values
- `navigation`: navigation mode plus primary and secondary links
- `dashboard`: recommended dashboard widgets for the starter space
- `layoutId`: built-in layout id or env value
- `componentPackId`: primary component pack id
- `recommendedPacks`: compatible component packs for the space
- `previewRoute`: in-app preview page for the starter space

## Built-Ins

Arkivel ships preview-safe templates for personal wiki, product docs, team handbook, worldbuilding bible, research notebook, reading archive, project knowledge base, and public documentation spaces.

## Preview And Import

- `GET /api/space-templates` returns the built-in registry and contract.
- `POST /api/space-templates` accepts `{ "template": ... }` or `{ "templateJson": "..." }` and returns a preview summary plus validation issues.
- `POST /api/space-templates` with `{ "templateId": "product-docs" }` returns a one-click local import preview with export JSON for the selected built-in template.
- `/space-templates/:id` previews the category tree, article template count, recommended packs, and local import preview route.
- Imports are preview-only in v4.91.0. The API validates schema version, ids, known layouts, known component packs, category trees, metadata fields, navigation, dashboards, unsafe remote references, and path traversal before any future apply flow can reuse the manifest.

## Authoring Notes

Keep templates local-first and portable. Avoid executable fields, remote code URLs, install scripts, or instance-specific secrets. Prefer stable ids, semantic versions, clear compatibility notes, and screenshots or docs beside the JSON when sharing a template pack.
