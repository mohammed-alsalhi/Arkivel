# Final Release Gates

Arkivel v5.0.0 closes the beta roadmap by publishing final gate metadata for release-candidate fixes, final beta freeze, gate evidence, compatibility, correction windows, and stable-release signoff.

## Contract

- API: `/api/final-release-gates`
- Customization manifest key: `finalReleaseGates`
- Schema: `arkivel.final-release-gates.v1`
- Test coverage: `src/lib/__tests__/final-release-gates.test.ts`

## RC Fix Areas

- `install`
- `upgrade`
- `auth`
- `data`
- `customization`
- `marketplace`
- `plugins`
- `apis`
- `webhooks`
- `docs`

## Final Beta Freeze Contracts

- `public-api-v1`
- `plugin-manifest`
- `marketplace-pack`
- `theme-pack`
- `export-bundle`
- `stable-env-vars`

## Gate Evidence

- `tests`
- `docs`
- `screenshots`
- `migration-reports`
- `security-notes`
- `deployment-checks`

## Compatibility Targets

- `node`
- `nextjs`
- `prisma`
- `postgresql`
- `vercel`
- `docker`
- `local-node`
- `plugin-manifests`
- `marketplace-packs`
- `export-bundles`

## Correction Windows

- `documentation-corrections`
- `security-corrections`
- `migration-corrections`
- `backup-restore-corrections`
- `permission-corrections`
- `privacy-corrections`

## Stable Release Gates

- `auth-roles-sessions-api-keys`
- `database-migrations-backup-restore-import-export-upgrades`
- `customization-marketplace-theme-layout-component-plugin-contracts`
- `public-api-v1-webhooks-feeds-sdk-types`
- `admin-operations-observability-security-privacy-docs`
- `docs-version-reference-sync`

The final release gate is satisfied only when these rows stay aligned across README, DESIGN, ARCHITECTURE, ROADMAP, CHANGELOG, AGENTS, CONTRIBUTING, API docs, help docs, feature docs, and in-app reference pages.
