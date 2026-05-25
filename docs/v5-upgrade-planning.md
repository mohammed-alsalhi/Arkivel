# v5 Upgrade Planning

Arkivel v4.95.2 adds the upgrade assistant contract for self-host admins preparing for v5. It does not apply upgrades. It gathers the checks, diagnostics, warnings, and links that operators need before entering a maintenance window.

## Contract

- Public metadata endpoint: `GET /api/upgrade-assistant`
- Customization manifest key: `upgradeAssistant`
- Schema version: `arkivel.upgrade-assistant.v1`
- Related docs: `CHANGELOG.md`, `ROADMAP.md`, `docs/migration-readiness.md`, and `docs/backup-restore.md`

## Readiness Checklist

Review version, Node, Prisma, database, env vars, plugins, marketplace packs, and migrations before upgrading. Each item should have an owner and evidence before the site enters maintenance mode.

## Diagnostics

Pre-upgrade diagnostics should check package version, Node version, Prisma generate status, database connectivity, pending migrations, recent backup, restore rehearsal, and deprecated env vars.

Post-upgrade smoke checks should verify admin login, article rendering, search, API v1 contract metadata, marketplace registry loading, plugin list loading, customization preview rendering, and the backup/restore report.

## Compatibility Warnings

Treat deprecated env vars and risky plugin permissions as blocking until reviewed. Deprecated APIs and old pack schema versions need explicit release-note coverage, compatibility notes, or migration instructions.

## Upgrade Flow

1. Run migration readiness and backup/restore reports before upgrading.
2. Resolve deprecated env vars, API usage, plugin permissions, and pack schema warnings.
3. Run pre-upgrade diagnostics during a maintenance window.
4. Apply the upgrade, regenerate Prisma, and run migrations.
5. Run post-upgrade smoke checks before reopening write traffic.
