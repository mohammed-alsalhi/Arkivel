# Audit Trail

Arkivel's audit trail records sensitive operational changes in append-only `AuditLog` rows. The v4.83.1 contract is published as `auditTrail` from `/api/customization` so self-host dashboards and future plugins can discover supported filters, redaction modes, alert hooks, and retention defaults.

## Covered Events

Audit events are reserved for actions where an admin or operator may need later proof of who changed what:

- Sensitive admin operations and failed admin operations.
- Permission grants, revokes, and updates.
- Space customization and governance changes.
- Plugin install, enable, disable, settings, route, job, and hook-failure events.
- Import preview and execution events.
- Export creation and download events.
- Marketplace preview and install events.
- Workspace invitation create, resend, and revoke events.

Rows include actor identity when available, actor type, target type/id/label, optional workspace id, severity, success/failure state, IP address, user agent, metadata, and creation time.

## Filtering

`GET /api/admin/audit-log` supports operational filters for:

- `actor`: user id, username, or actor type.
- `action`: exact audit action id.
- `target`: target type, id, or label.
- `workspaceId` or `workspace`: workspace boundary.
- `severity`: `info`, `warning`, `high`, or `critical`.
- `success`: `true` or `false`.
- `dateFrom` and `dateTo`: ISO date strings.

The admin UI at `/admin/audit-log` exposes the same primary filters and keeps pagination at 50 rows per page.

## Export And Redaction

Admins can download a JSON report with `GET /api/admin/audit-log?download=1`. The same filters apply. Add `redaction=summary`, `redaction=standard`, `redaction=strict`, or `redaction=full` to control privacy:

- `summary` removes actor identifiers, network fields, and metadata detail.
- `standard` redacts sensitive metadata keys and network addresses.
- `strict` redacts actor identifiers, network fields, and all metadata values.
- `full` is intended only for trusted local incident response and leaves entries intact.

Exports include `schemaVersion`, `exportedAt`, `redaction`, `count`, and `logs`.

## Alert Hooks

`src/lib/audit.ts` declares alert hook metadata for critical admin actions, failed admin operations, suspicious activity, and plugin hook failures. The helper `shouldAlertOnAuditEvent()` centralizes the trigger decision until outbound notification routing is wired into a later roadmap item.

## Retention

The default retention contract keeps standard audit rows for 365 days and critical rows for 2555 days. The contract is documentation-first in v4.83.1; automated pruning is deferred until the broader data-retention settings work lands.
