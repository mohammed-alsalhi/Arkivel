# Desktop App Research

Arkivel v4.94.1 documents desktop packaging research without committing desktop packaging to v5 scope.

## Packaging Options

- **Electron:** mature updater and filesystem ecosystem, but larger bundles and strict Node-isolation requirements.
- **Tauri:** smaller native shell with a Rust command boundary, but higher contributor setup cost and updater signing work.
- **Browser PWA:** closest to the current app and lowest maintenance, but limited filesystem UX and still needs local services.
- **Docker Desktop:** best match for self-host architecture, explicit Postgres/assets/backup volumes, but less native-feeling.

## Architecture Notes

Keep Next.js, Prisma, Postgres, asset storage, and plugin manifests as the core architecture. Treat Electron or Tauri as launchers around a local web server until v5 scope is explicitly approved.

Local data should live in an app-owned directory with separate database, assets, exports, logs, and plugin-manifest folders. A desktop beta would require signed updates, backup prompts, restore rehearsal, and plugin permission review.

## Local Recipes

- Docker Desktop single-machine install
- Node plus local Postgres install
- PWA on a trusted local network

## Filesystem UX

Exports should choose a folder, write manifests and checksums, show privacy omissions, and open the containing folder when complete. Imports should choose an archive or folder, preview the manifest, run a dry-run conflict report, and require a restore point before apply.

## Decision Record

Decision: do not commit desktop packaging to v5 scope yet. Review again before the v5 release candidate after backup/restore UX, signed updates, plugin safety boundaries, and local database support burden are understood.
