# Feature Freeze

Arkivel v4.98.0 enters feature freeze for the v5 release-candidate line. New product capabilities should stop unless they are required to clear a release blocker, close a documentation gap, fix a migration path, resolve a security issue, or repair a broken test.

## Contract

- API: `/api/release-freeze`
- Customization manifest key: `featureFreeze`
- Schema: `arkivel.feature-freeze.v1`
- Known issues: `docs/known-issues.md`
- Test coverage: `src/lib/__tests__/feature-freeze.test.ts`

## Allowed Change Classes

- `release-blocker`
- `documentation-gap`
- `migration-fix`
- `security-issue`
- `broken-test`

Everything else should wait until after v5.0.0 or be explicitly deferred in the roadmap.

## Rehearsal Matrix

Release candidates need evidence for:

- `install`
- `upgrade`
- `import-export`
- `marketplace`
- `plugin`
- `customization`
- `auth`
- `api`
- `webhook`
- `backup`
- `restore`
- `smoke`

Each area should attach output, screenshots, dry-run reports, or issue links before an RC tag is promoted.

## Gate Ownership

Every v5 gate has a maintainer-owned status row:

- `auth`
- `data`
- `customization`
- `marketplace`
- `plugins`
- `api`
- `operations`
- `docs`
- `upgrade`

Each owner row should include test output, docs links, and known-issue status.

## Known Issues Report

Use `docs/known-issues.md` as the active blocker list. The release-freeze report expects these blocker labels to stay visible:

- `release-blocker`
- `security-blocker`
- `migration-blocker`
- `docs-blocker`
- `smoke-blocker`

## Release Notes Draft

Prepare the v5 release notes around these sections:

- `stable-scope`
- `upgrade-notes`
- `breaking-or-risky-changes`
- `self-host-checklist`
- `known-issues`
- `verification-evidence`

Keep release notes in draft until v4.99.99 passes the final gate suite.
