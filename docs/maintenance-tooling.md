# Maintenance Tooling

Arkivel v4.87.1 expands maintenance and read-only mode into an operator readiness workflow.

## Admin Surface

- `/admin/maintenance` shows maintenance mode, background task pause state, safe-upgrade checks, cleanup queues, and runbook links.
- `/admin/read-only` keeps the read-only toggle focused on write protection for non-admin users.
- `/api/admin/maintenance/report` returns the maintenance report.
- `maintenanceTooling` in `/api/customization` publishes mode keys, report routes, cleanup task ids, and safe-upgrade check ids.

## Safe Upgrade Checks

The report checks database health, backup readiness, failed export/webhook migration blockers, write-traffic constraints, and background task pause state. Operators should run a completed export before upgrades and enable maintenance or read-only mode during risky migrations.

## Cleanup Tasks

`POST /api/admin/maintenance/report` accepts a `task` id and defaults to dry-run mode. Pass `dryRun: false` only after reviewing the count.

Supported tasks:

- `stale-sessions`
- `orphaned-assets`
- `failed-jobs`
- `webhook-retry-history`
- `background-tasks-paused` with an `enabled` boolean

Orphaned asset cleanup removes asset library database rows that are not referenced by article content, article cover images, or category cover images.

## Runbook Links

Maintenance and operations pages link directly to maintenance mode, read-only mode, export history, webhook retries, operations dashboard, and the production runbook.
