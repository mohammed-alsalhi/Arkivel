# Test Quality Gates

Arkivel v4.96.0 defines the test and quality planning contract for v5 release candidates. It expands the test surface, names stable fixtures, records CI matrix expectations, and defines how known warnings are handled before stable release.

## Contract

- Public metadata endpoint: `GET /api/test-quality`
- Customization manifest key: `testQualityGates`
- Schema version: `arkivel.test-quality-gates.v1`
- Dashboard planning target: `/admin/operations`

## Test Expansion

The v5 quality plan covers unit, integration, API, permission, import/export, customization, marketplace, plugin, editor, and responsive tests. Each surface is required before v5.

## Stable Fixtures

Stable QA fixtures should cover small wiki, team wiki, public docs, worldbuilding atlas, research notebook, large archive, and plugin-heavy installs. Fixtures should be seedable and reusable in CI.

## CI Matrix

CI planning covers Node 20, 22, and 24; local Postgres, Neon-compatible Postgres, and restore rehearsal database modes; and default, map-enabled, trusted-plugin, and offline/PWA feature-flag profiles.

## Known Warnings

Known warnings need an owner, reason, target release, and accepted-risk rationale. Release candidates must not introduce new warnings unless they have a known-issue entry and release-manager acknowledgement.

## Quality Dashboard

Release-manager dashboard planning should show test suite status, fixture coverage, CI matrix health, known warnings, and release blockers in one support-oriented view.
