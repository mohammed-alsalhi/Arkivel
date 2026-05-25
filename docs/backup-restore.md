# Backup And Restore

Arkivel v4.95.1 defines the backup and restore UI contract for self-host operators. The initial flow is metadata-first and rehearsal-safe: it describes what the admin wizard must collect and how restore manifests are verified before any future write-capable restore flow can run.

## Contract

- Public metadata endpoint: `GET /api/backup-restore`
- Customization manifest key: `backupRestore`
- Admin surface: `/admin/maintenance`
- Schema version: `arkivel.backup-restore.v1`

## Backup Wizard

The admin backup wizard must collect evidence for:

- Database dumps, schema hashes, row-count summaries, and redacted database URLs
- Asset archives, checksum manifests, and missing-file scans
- Redacted environment variable exports and required variable checklists
- Marketplace pack ids, versions, checksums, and local source paths
- Plugin manifest ids, permissions, routes, and trusted source paths
- Customization settings including style, color theme, layout, and space overrides

## Restore Rehearsal

Restore rehearsal mode verifies a manifest without writing data. It reports missing sections, checksum mismatches, unsupported schemas, newer target versions, duplicate slugs, and unsafe plugin permissions. A restore is not ready until the rehearsal has no conflicts.

## Scheduled Backups

Recommended cadence options are daily, weekly, before-upgrade, and manual-only. Operators should keep at least one pre-upgrade backup, keep one offsite copy, and verify restore before deleting older backups. Supported planning targets are local disk, S3-compatible storage, and offsite drives.

## Disaster-Recovery Drill

Run the drill before v5 release candidates:

1. Export database, assets, env vars, marketplace packs, plugin manifests, and customization settings.
2. Restore to a scratch database and asset directory.
3. Verify admin login, sample article render, marketplace registry, plugin list, and customization preview.
4. Record recovery time, conflicts, owner, and follow-up tasks.
