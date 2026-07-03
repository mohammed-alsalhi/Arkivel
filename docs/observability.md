# Observability

Arkivel v4.87.2 adds observability plumbing on top of the existing `MetricLog` table.

## Surfaces

- `/admin/observability` shows the operational event feed and privacy controls.
- `/api/admin/observability` returns controls and recent structured events.

## Structured Logs

Structured events use these categories: config, auth, Prisma, migrations, assets, search, customization, marketplace, plugins, and webhooks. Metadata is redacted for sensitive keys such as tokens, cookies, passwords, secrets, authorization headers, and API keys.

## Metrics

Supported metric types are page latency, API latency, editor autosave, search response time, export duration, import duration, and webhook delivery. Search and webhook delivery metrics are recorded by first-party routes.

## Privacy Controls

Admins can enable or disable analytics ingestion, event feed visibility, IP anonymization, search query logging, and retention days. Controls are stored in `PluginState` under `observability_privacy_controls`.

## External Tools

External collectors can poll `/api/admin/observability` with admin credentials. Keep payloads aggregate and avoid raw article content, secrets, session identifiers, or full request headers.
