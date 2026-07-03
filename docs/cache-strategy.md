# Cache Strategy

Arkivel v4.88.1 defines cache invalidation rules for self-host installs.

## Invalidation Rules

Article writes invalidate article lists, article detail, feeds, sitemap, search, dashboards, categories, and tags. Category writes invalidate category pages, article lists, sitemap, customization inheritance, search, and dashboards. Tag writes invalidate tags, article lists, search facets, sitemap, and dashboards.

Customization writes invalidate customization, marketplace metadata, plugin manifests, dashboards, and public shells.

## Deployment Recipes

- CDN: cache static assets aggressively; keep admin and authenticated API routes private or no-store.
- Vercel: use route revalidation for public pages and avoid edge caching admin dashboards.
- Docker: use Redis for optional app cache and restart workers after schema-affecting deploys.
- Reverse proxy: set public feed/sitemap TTLs, bypass cookies, and never cache mutating API responses.

## Stale Warnings

Editors and admins should treat data loaded before a cache invalidation as potentially stale.
