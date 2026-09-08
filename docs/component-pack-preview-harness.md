# Component Pack Preview Harness

The v4.78.3 developer experience defines a preview harness plan before runtime component loading ships.

## Goals

- Render every stable slot with typed fixture data from `src/lib/component-pack-fixtures.ts`.
- Compare built-in packs against contributed pack manifests without executing third-party code.
- Capture desktop and mobile screenshots for article, category, dashboard, marketplace, and editor surfaces.
- Report missing slots, unsupported slot ids, accessibility notes, responsive issues, and compatibility warnings.

## Planned route shape

- `/admin/marketplace/preview/component-pack` for local admin preview.
- Query parameter `?pack=example-component-pack` selects a parsed manifest.
- Tabs: Article, Category, Dashboard, Marketplace, Editor.
- Panels: fixture data, slot contract, component metadata, screenshot checklist, validation output.

## Fixture coverage

Fixture data lives in `src/lib/component-pack-fixtures.ts` and currently covers:

- Article card
- Metadata panel
- Dashboard widget
- Homepage section
- Category/space navigation
- Marketplace/admin summary
- Editor panel

Future batches should extend this with search results, article headers, and infobox fixtures as those runtime surfaces become pack-loadable.
