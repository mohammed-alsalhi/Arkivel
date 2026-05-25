# Release Candidate One

Arkivel v4.98.1 captures the first release-candidate evidence plan. RC1 should only be tagged after the required gates have current output and the deployment, starter, pack, import/export, backup/restore, and review checklists have evidence attached.

## Contract

- API: `/api/release-candidate-one`
- Customization manifest key: `releaseCandidateOne`
- Schema: `arkivel.release-candidate-one.v1`
- Feedback template: `docs/rc-feedback-template.md`
- Test coverage: `src/lib/__tests__/release-candidate-one.test.ts`

## Required Gates

- `lint`
- `typecheck`
- `tests`
- `build`
- `migration-dry-run`
- `smoke-suite`
- `docs-sync`

## Deployment Paths

- `vercel`
- `docker`
- `local-node`
- `managed-postgres`

Use `docs/setup-paths.md` as the deployment-path reference and attach the exact command output or hosted validation notes for each path.

## Validation Areas

- `starter-spaces`
- `marketplace-packs`
- `plugin-examples`
- `exports`
- `imports`
- `backups`
- `restores`

Each area should include a status, evidence link, owner, and known-issue decision before RC1 is promoted.

## Review Checklists

- `accessibility`
- `performance`
- `security`
- `privacy`

Checklist output should link to the relevant docs and mention whether any finding is release-blocking.
