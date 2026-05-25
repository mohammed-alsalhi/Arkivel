# End-To-End Smoke Suite

Arkivel v4.96.1 defines the pre-v5 smoke suite for release candidates. The suite checks that the app can boot, key product workflows render, responsive pages stay inside the viewport, and failure artifacts are collected for debugging.

## Contract

- Public metadata endpoint: `GET /api/e2e-smoke-suite`
- Customization manifest key: `e2eSmokeSuite`
- Playwright spec: `e2e/smoke-suite.spec.ts`
- Fixture seed script: `scripts/seed-smoke-fixtures.mjs`
- Schema version: `arkivel.e2e-smoke-suite.v1`

## Product Smoke Flows

The smoke suite covers install, login, create article, edit article, wiki links, search, customization, marketplace, export, import dry run, plugin manifest, and admin health surfaces.

## Responsive Smoke Routes

Responsive smoke coverage checks homepage, article, editor, dashboard, marketplace, customization, and help pages across phone, tablet, and desktop viewports. Each route should render body content and avoid horizontal overflow.

## Fixtures

Run `npm run qa:seed-smoke` before local smoke testing when a database is available. The seed is idempotent and creates:

- `smoke-admin`
- `smoke-fixtures`
- `smoke-home`
- `smoke-linked-target`

Set `SMOKE_ADMIN_PASSWORD` to override the default local smoke admin password.

## Running Locally

1. Start with a configured `DATABASE_URL`.
2. Run `npm run qa:seed-smoke`.
3. Run `npm run test:e2e -- e2e/smoke-suite.spec.ts`.

Playwright starts the dev server automatically outside CI. In CI, set `BASE_URL` to the already-running deployment.

## Failure Artifacts

Playwright stores screenshots only on failure and traces on first retry. Attach both artifacts to release candidate failures before declaring the smoke suite blocked.
