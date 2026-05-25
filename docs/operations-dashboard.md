# Operations Dashboard

Arkivel v4.87.0 adds an admin operations dashboard for self-host production checks.

## Admin Surface

- `/admin/operations` shows service health, queues, jobs, slow pages, failed webhooks, imports, exports, plugin errors, database health, and admin alerts.
- `/api/admin/operations` returns the same admin-only report as JSON.
- `/api/admin/operations?bundle=1` downloads a redacted diagnostic bundle for support.
- `operationsDashboard` in `/api/customization` publishes the route, schema version, service-card list, queue-card list, support-bundle redactions, and browser-local acknowledgement metadata.
- `/admin/operations` also links to maintenance, read-only, export history, webhook retry, and production runbooks.

## Health Cards

The dashboard summarizes database, Prisma, storage, AI providers, webhooks, search, and background jobs. Cards should stay operational: status, short message, route links, and factual checks.

## Alerts

Alerts are generated from failed webhook deliveries, incomplete exports, plugin load errors, and recent server errors. Acknowledgements are stored in the admin browser under `arkivel:operations-alert-acks`; they do not hide issues for other admins and do not change server state.

## Diagnostic Bundles

Bundles include instance summary, webhook delivery health, import/export activity, plugin health, and performance metrics. They intentionally redact webhook secrets, API keys, session tokens, password hashes, raw environment values, and full article content.

## Production Runbook

1. Open `/admin/operations` after deploys, upgrades, or incident reports.
2. Check open alerts before reviewing lower-severity service cards.
3. Use linked admin pages for source data: `/admin/webhooks`, `/admin/plugins`, `/admin/metrics`, `/admin/import`, `/api/export/history`, and `/admin/health`.
4. Download `/api/admin/operations?bundle=1` when asking for support.
5. Treat `unknown` AI-provider status as informational unless the instance depends on AI-backed workflows.
