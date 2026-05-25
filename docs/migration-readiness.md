# Migration Readiness

Arkivel v4.95.0 defines the pre-v5 migration readiness contract. The goal is to make every upgrade rehearseable before schema changes, marketplace installs, plugin state changes, or workspace/template migrations can become release blockers.

## Contract

- Public metadata endpoint: `GET /api/migration-readiness`
- Customization manifest key: `migrationReadiness`
- Schema version: `arkivel.migration-readiness.v1`
- Admin operations report: schema compatibility, data integrity, restore validation, and failure recovery evidence

## Dry-Run Phases

Every migration dry run is blocking until all phases have evidence:

1. Backup prompt: database dump, asset archive, env redaction check, and restore target.
2. Schema compatibility: source/target Prisma schema hashes, pending migrations, and v5 decision notes.
3. Data integrity: article and revision counts, category tree checks, workspace scopes, and orphan scans.
4. Restore validation: scratch database restore, asset checksum verification, admin login check, and sample article render.
5. Failure recovery: rollback owner, maintenance window, read-only plan, and support bundle path.

## Representative Upgrade Paths

Release candidates should rehearse upgrades from:

- v4.80.x personal wiki installs
- v4.82.x team workspace installs
- v4.86.x public documentation installs
- v4.90.x marketplace-heavy installs
- v4.92.x plugin-enabled installs

Each rehearsal should produce a migration dry-run report, restore validation report, and schema compatibility report.

## Prisma Freeze Decisions

Before v5 freeze, destructive schema changes require explicit release notes, restore evidence, and an operator recovery path. Current decisions keep `Wiki` as the durable workspace boundary, keep plugin state manifest-backed, and keep marketplace imports preview-only until restore and rollback flows are proven.

## Migration Test Matrix

Migration tests must cover customization, marketplace packs, trusted plugins, spaces, and templates. Each surface needs dry-run coverage and restore validation coverage before the stable release gate can pass.

## Failure Recovery

If any phase fails, keep the site read-only and choose one recovery path: restore from the verified backup, forward-fix with a documented migration patch, or perform a manual repair with a support bundle attached to the release notes.
