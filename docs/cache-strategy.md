# Cache Strategy

Arkivel v4.88.1 defines cache invalidation rules and admin cache tools for self-host installs.

## Surfaces

- `/admin/cache` shows Redis status, invalidation rules, manual invalidation buttons, stale warning metadata, and deployment recipes.
- `/api/admin/cache` returns the same admin-only report and accepts manual invalidation requests.
- `cacheStrategy` in `/api/customization` publishes the schema version, admin/API routes, invalidation rule ids, recipe ids, and stale-warning surfaces.

## Invalidation Rules

Article writes invalidate article lists, article detail, feeds, sitemap, search, dashboards, categories, and tags. Category writes invalidate category pages, article lists, sitemap, customization inheritance, search, and dashboards. Tag writes invalidate tags, article lists, search facets, sitemap, and dashboards.

Customization writes invalidate customization, marketplace metadata, plugin manifests, dashboards, and public shells.

## Deployment Recipes

- CDN: cache static assets aggressively; keep admin and authenticated API routes private or no-store.
- Vercel: use route revalidation for public pages and avoid edge caching admin dashboards.
- Docker: use Redis for optional app cache and restart workers after schema-affecting deploys.
- Reverse proxy: set public feed/sitemap TTLs, bypass cookies, and never cache mutating API responses.

## Stale Warnings

Editors and admins should treat data loaded before a cache invalidation as potentially stale. Admins can use `/admin/cache` to manually invalidate a known rule after imports, migrations, or external writes.
