# Performance Tuning

Arkivel v4.88.0 adds route budgets and admin performance diagnostics for self-host operators.

## Surfaces

- `/admin/performance` shows route budgets, recent observed p95 latency, large-wiki fixtures, and slow-query review guidance.
- `/api/admin/performance` returns the same admin-only report as JSON.
- `performanceBudgets` in `/api/customization` exposes the schema version, admin/API routes, profiled surfaces, fixture ids, and slow-query diagnostic ids.

## Profiled Surfaces

The budget contract covers article pages, graph surfaces, Studio, Atlas, Trails, search, editor startup, admin dashboards, and marketplace pages. Each surface has p95 latency, interaction latency, and bundle-size targets.

## Large-Wiki Fixtures

Use the fixture profiles as local targets when testing performance:

- `small-team`: 250 articles, 1,200 links, 1,500 revisions
- `large-archive`: 2,500 articles, 18,000 links, 22,000 revisions
- `public-docs`: 10,000 articles, 90,000 links, 140,000 revisions

These are contract profiles, not seed scripts yet. They define the scale each route should be tested against before v5.

## Slow-Query Review

Review article list filters, fallback LIKE search, graph neighborhoods, and admin operations aggregates first. Keep dashboards bounded to recent windows, prefer indexed fields, cap graph depth/node counts, and inspect fallback-search frequency with `search_response_time` metrics.

## External Checks

Pair `/admin/performance` with `/admin/observability` and browser/network tooling. External runners can post route latency samples to `/api/observability/metrics`; those samples feed the performance budget report through `MetricLog`.
