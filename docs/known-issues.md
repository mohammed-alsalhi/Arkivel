# Known Issues

Known issues track accepted release-candidate risks and blockers.

## Labels

- `release-blocker`
- `security-blocker`
- `migration-blocker`
- `docs-blocker`
- `smoke-blocker`
- `smoke-failure`

## Current Baseline

- Lint baseline: 114 warnings, 0 errors. These warnings are tracked as pre-v5 cleanup work and must not increase without a release-blocker or accepted-risk entry.

- Label: `migration-blocker`
- Owner: Maintainers
- Affected version: 5.3.0 and earlier
- Evidence: The current schema contains 95 models, while the checked-in migration history starts with five tables and later migrations alter tables that history never creates.
- Decision: Keep schema mutation out of builds. Until a complete baseline is checked in and tested, production operators must back up PostgreSQL and review `npx prisma db push` as a separate release step.
- Follow-up: Create and rehearse a complete baseline against both a fresh database and an upgraded production snapshot before adopting `prisma migrate deploy`.

## Entry Template

- Label:
- Owner:
- Affected version:
- Evidence:
- Decision:
- Follow-up:
