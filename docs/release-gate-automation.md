# Release Gate Automation

Arkivel v4.96.2 defines release gate automation for v5 release candidates. The contract lists required gates, docs/version synchronization checks, release checklist metadata, and release blocker labels.

## Contract

- Public metadata endpoint: `GET /api/release-gates`
- Customization manifest key: `releaseGateAutomation`
- Docs sync script: `scripts/verify-docs-sync.mjs`
- Known issues file: `docs/known-issues.md`
- Schema version: `arkivel.release-gate-automation.v1`

## Required Gates

Release candidates require clean lint, typecheck, unit tests, API tests, e2e smoke tests, build, migration dry run, and docs sync checks.

## Docs Sync

Run `npm run release:docs-sync` before tagging a release candidate. The script verifies package-lock version alignment, changelog and roadmap version entries, and customization manifest references for the latest release gate contracts.

## Release Checklist

Release checklist metadata is generated from the required gates and includes blocker labels for release, security, migration, documentation, and smoke failures.

## Release Manager Notes

Do not promote a release candidate while a required gate is missing, stale, or failing. Attach smoke screenshots/traces, migration reports, docs sync output, and build logs to release blocker issues.
