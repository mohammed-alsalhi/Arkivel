# Troubleshooting

This page groups common maintainer problems by surface.

## database

Check `DATABASE_URL`, network access, Prisma adapter configuration, pending migrations, and whether the database accepts connections from the app host.

## build

Run `npx prisma generate`, remove stale `.next/` after schema changes, then rerun `npm run build`. Confirm required environment variables exist at build time.

## auth

Confirm `ADMIN_SECRET`, user records, session cookies, role assignments, and API key scopes. Legacy local mode treats a missing `ADMIN_SECRET` as admin access.

## env-vars

Compare `.env`, `.env.local`, deployment variables, and `/api/customization`. `NEXT_PUBLIC_*` values are build-time config and need rebuilds after changes.

## uploads

Check storage provider settings, asset paths, permissions, file size limits, and export manifests. Restore rehearsals should verify asset checksums.

## plugins

Confirm `ARKIVEL_ENABLE_TRUSTED_PLUGINS`, `ARKIVEL_TRUSTED_PLUGIN_DIR`, manifest schema version, permissions, routes, hooks, and compatibility warnings.

## marketplace-packs

Use import preview validation before install intent. Reject remote code, executable payloads, unsupported schema versions, path traversal, and unsafe permissions.

## migrations

Run migration readiness checks, backup prompts, schema compatibility reports, data-integrity checks, and restore validation before applying schema changes.
