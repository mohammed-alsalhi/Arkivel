<p align="center">
  <img src="public/brand/arkivel-logo.png" alt="Arkivel" width="132" />
</p>

<h1 align="center">Arkivel</h1>

<p align="center">
  <strong>Self-hosted wiki infrastructure for private knowledge, team handbooks, and worldbuilding canon.</strong>
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmohammed-alsalhi%2Farkivel&env=DATABASE_URL,ADMIN_SECRET&envDescription=DATABASE_URL%3A%20PostgreSQL%20connection%20string.%20ADMIN_SECRET%3A%20Password%20for%20admin%20access.&project-name=arkivel">
    <img alt="Deploy with Vercel" src="https://vercel.com/button" />
  </a>
</p>

<p align="center">
  <a href="#run-locally"><img alt="Run locally" src="https://img.shields.io/badge/Run%20locally-Quickstart-14866d?style=for-the-badge" /></a>
  <a href="#core-experiences"><img alt="Core experiences" src="https://img.shields.io/badge/Core%20experiences-Explore-3366cc?style=for-the-badge" /></a>
  <a href="#api-and-integrations"><img alt="API docs" src="https://img.shields.io/badge/API%20and%20integrations-Docs-2f5fa8?style=for-the-badge" /></a>
  <a href="#configuration"><img alt="Configuration" src="https://img.shields.io/badge/Configuration-Environment-6b5b95?style=for-the-badge" /></a>
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=111" />
  <img alt="Prisma 7" src="https://img.shields.io/badge/Prisma-7-2d3748?style=flat-square&logo=prisma" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169e1?style=flat-square&logo=postgresql&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="License MIT" src="https://img.shields.io/badge/License-MIT-0b7285?style=flat-square" />
</p>

## What Arkivel Is

Arkivel is a wiki application for people who need a real knowledge base, not a notes folder. It combines article writing, revision history, wiki links, roles, workspace boundaries, search, maps, feeds, public APIs, and AI-assisted reading/editing in one self-hosted Next.js app.

It is designed to feel like a working encyclopedia: dense, readable, serif-forward, and content-first. The newer flagship surfaces are still grounded in real wiki data, so they help readers move through the canon instead of becoming decorative dashboards.

## Core Experiences

| Experience | Route | What it does |
|---|---:|---|
| Article reader and editor | `/articles/[slug]` | Serif-first reading, wiki links, action rail, revisions, discussions, infoboxes, footnotes, tags, backlinks, and rich editing. |
| Arkivel Studio | `/studio` | Combines a live article canvas, database-style lanes, graph links, review pressure, and JSON Canvas export in one workspace. |
| Canon Trails | `/trails` | Builds guided reading routes from real article links, backlinks, categories, recency, depth, and engagement signals. |
| Canon Atlas | `/atlas` | Projects the wiki into territories, story threads, dossiers, continuity pressure, and next atlas moves. |
| Knowledge Cockpit | `/intelligence` | Runs 20 live quality, graph, canon, editorial, and audience engines with a constellation, radar, and impact simulator. |
| Article graph | `/graph` | D3 force graph of wiki links and semantic relations, with focused subgraphs. |
| Ask My Wiki | `/ask` | Streaming AI oracle grounded in wiki search and article sources. |
| API docs | `/api-docs` | Public REST API, operational feeds, sitemap, RSS, Atom, and integration references. |

## Feature Map

**Writing and editing**

- Tiptap rich text editor with a calm icon-first toolbar, reusable Insert/Review/Outline feature trays, selection actions, contextual table controls, slash commands, shared block templates, keyboard shortcut metadata, Markdown mode, claim marking, syntax highlighting, collapsed-border tables, footnotes, images, captions, pull quotes, two-column blocks, accordions, vertical timelines, and auto-save.
- Wiki link autocomplete with `[[Article Name]]`, broken-link styling, backlinks, semantic relations, redirects, disambiguation pages, templates, custom metadata schemas, infoboxes, and automatic revision snapshots.
- AI assistance for rewriting, title/category/tag suggestions, outline building, grammar and style checks, alt text, section expansion, article generation, category synthesis, and revision summaries.

**Reading and discovery**

- Full-text search with relevance ranking, command palette navigation, random article, recent changes, Arkivel Studio, article graph, Canon Trails, Canon Atlas, Ask My Wiki, explore mode, saved searches, reading history, and sticky article headers.
- Reader tools include serif/sans/mono font preference, size and width controls, reading mode, focus mode, night mode, high contrast, text-only mode, speed reader, article quizzes, tutor mode, audio narration, and presentation mode.

**Governance and collaboration**

- Multi-user auth with viewer/editor/admin roles, workspace memberships and invitations, legacy admin secret support, status workflow, review requests, claim-level review states, review due dates, verification stamps, edit suggestions, discussions, co-authors, locks, live presence, connection/reconnect states, snapshots, restore, watchlists, notifications, and activity logs.

**Knowledge operations**

- Dashboards for wiki stats, operations, service health, diagnostic bundles, health, content gaps, search analytics, category growth, writing velocity, referrers, retention, word counts, stubs, orphans, dead ends, duplicate content, long articles, cleanup tags, and maintenance/read-only mode.

**Publishing and integrations**

- RSS, Atom, public REST API, API keys, webhooks, sitemap, robots, MediaWiki import, Markdown/HTML/ZIP/JSON/CSV exports, Slack/Discord command hooks, embeds, PWA manifest, Vercel Blob uploads, and optional map layers.

## Run Locally

**Prerequisites**

- Node.js 18+
- PostgreSQL database, local or remote
- `DATABASE_URL` and `ADMIN_SECRET`

```bash
git clone https://github.com/mohammed-alsalhi/arkivel.git
cd arkivel
npm install
cp .env.example .env
```

Edit `.env`, then prepare the database and start the app:

```bash
npx prisma db push
node prisma/seed.mjs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If `ADMIN_SECRET` is empty in local development, admin access is granted automatically.

## Deploy

### Vercel

1. Create a PostgreSQL database on [Neon](https://neon.tech), Supabase, or another hosted Postgres provider.
2. Click the Vercel button at the top of this README, or import the repository in Vercel.
3. Add `DATABASE_URL` and `ADMIN_SECRET`.
4. Deploy.

### Docker

```bash
docker compose up -d
```

Or build and run manually:

```bash
docker build -t arkivel .
docker run -p 3000:3000 --env-file .env arkivel
```

### Node.js

```bash
npm run build
npm start
```

Put the app behind Caddy, Nginx, or your platform's reverse proxy for TLS and custom domains.

## Configuration

A full template lives in [.env.example](.env.example). Only two variables are required.

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `ADMIN_SECRET` | Yes | Legacy admin password and local bootstrap secret. |
| `NEXT_PUBLIC_ARKIVEL_NAME` | No | Site name in shell, metadata, and manifest. |
| `NEXT_PUBLIC_ARKIVEL_TAGLINE` | No | Short tagline in the app chrome. |
| `NEXT_PUBLIC_ARKIVEL_DESCRIPTION` | No | SEO/social description. |
| `NEXT_PUBLIC_ARKIVEL_LOGO` | No | Full square logo, default `/brand/arkivel-logo.png`. |
| `NEXT_PUBLIC_ARKIVEL_LOGO_MARK` | No | Compact sidebar/mobile mark, default `/brand/arkivel-logo.svg`. |
| `NEXT_PUBLIC_ARKIVEL_APP_ICON` | No | Manifest/app icon, default `/brand/arkivel-icon-512.png`. |
| `NEXT_PUBLIC_ARKIVEL_STYLE` | No | Built-in style preset, currently `classic-wiki` or `atlas-modern`. |
| `NEXT_PUBLIC_ARKIVEL_COLOR_THEME` | No | Built-in color theme, currently `standard`, `forest`, or `ember`. |
| `NEXT_PUBLIC_ARKIVEL_LAYOUT` | No | Built-in layout preset, currently `classic-wiki`, `docs-portal`, `team-knowledge-base`, `worldbuilding-atlas`, or `research-notebook`. |
| `NEXT_PUBLIC_MAP_ENABLED` | No | Set `true` to enable the interactive map. |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for image uploads. |

`NEXT_PUBLIC_*` values are baked into the build. Rebuild or redeploy after changing them.

Arkivel also exposes a self-host customization manifest at `/api/customization`. It lists supported public env vars, their defaults, grouped runtime config, reusable UI components, component slot contracts, built-in style presets, color themes, layout presets, theme pack schemas, plugin manifests, the v1 plugin manifest schema with examples and compatibility matrix, the trusted local plugin loader env contract, the portable bundle contract, workspace model contract, role template contract, collaboration controls contract, editorial governance contract, operations dashboard contract, maintenance tooling contract, observability contract, migration readiness contract, backup/restore contract, upgrade assistant contract, test quality gates contract, e2e smoke suite contract, release gate automation contract, documentation onboarding contract, in-app onboarding contract, example site recipe contract, feature freeze contract, release candidate one contract, final release gate contract, component packs, persisted space customization contracts, marketplace registry metadata, marketplace beta/lifecycle/authoring metadata, import-preview contracts, registry version/schema/source details, catalog validation, migration guidance, and theme hook locations so forks, plugins, and deployment dashboards can customize the platform without scraping source files. Admins can use `/admin/customization` as an env-first workbench for brand copy, logos, styles, colors, layouts, feature flags, browser-local drafts, named presets, active-vs-draft diffs, keyboard-accessible tabs, screen-reader summaries, responsive QA checkpoints, polish diagnostics, live preview panels, source badges, theme-pack JSON validation, downloadable support reports, and copy-ready `.env`, `.env.local`, Vercel, or Docker Compose output, then browse, filter, inspect detail panels, copy install artifacts, and preview-import local marketplace packs at `/admin/marketplace`.

Plugin authors can start from `examples/plugins/starter-plugin/`, validate manifests with `npm run plugin:validate -- path/to/plugin.json`, list supported surfaces with `npm run plugin:validate -- --list-surfaces`, and follow `docs/plugin-authoring.md` before preparing a local marketplace listing from `examples/plugins/marketplace-listing-template.json`.

Marketplace contributors can use [docs/marketplace-contributions.md](docs/marketplace-contributions.md), [docs/marketplace-authoring.md](docs/marketplace-authoring.md), `/api/marketplace/authoring`, the sample folders in `examples/marketplace/`, and the submission templates in `examples/marketplace/submission-template.md` and `examples/marketplace/pack-readme-template.md` to prepare preview-safe style, theme, layout, component, plugin, and template pack submissions.

Template packs are first-class local marketplace items. `GET /api/marketplace/templates` publishes template-pack previews, included schema, category tree and article template previews, compatibility notes, diff metadata, merge options, and export-from-space fixture output for building shareable space products. See [docs/template-marketplace.md](docs/template-marketplace.md).

Domain workflows are published at `/api/space-workflows` for docs portals, team handbooks, worldbuilding bibles, research notebooks, and personal wikis. Each workflow links to a starter template, expected controls, workflow steps, and release gates; see [docs/domain-workflows.md](docs/domain-workflows.md).

Assistant packs make AI features opt-in and inspectable. `GET /api/assistant-packs` and `/admin/assistants` publish disabled-by-default drafting, summarization, search, claim extraction, taxonomy, alt-text, import cleanup, and review assistant metadata with provider, model, privacy, cost, retention, prompt scope, per-space availability, permissions, prompt/context previews, usage logs, cost estimates, tools, context sources, limits, outputs, safety notes, and graceful fallback metadata for local/offline-friendly deployments; see [docs/assistant-packs.md](docs/assistant-packs.md).

Assistant governance at `/api/assistant-packs/governance` adds privacy warnings, human-review requirements, citation prompts, confidence metadata, AI audit events, private-space and sensitive-article opt-outs, and the v5 release gate that AI must remain optional and non-blocking; see [docs/assistant-governance.md](docs/assistant-governance.md).

The built-in component-pack registry includes default wiki, docs portal, team knowledge base, worldbuilding atlas, and research notebook packs. Each pack declares its supported slots, named component affordances, and recommended layout so future runtime pack loading can reuse the same local-first contract.

Layout composition metadata is also exposed through `/api/customization`. Each built-in layout declares shell density, homepage module order, article column behavior, right-rail behavior, dashboard modules, category landing behavior, and scoped `html[data-layout="..."]` hooks; Customization Studio previews the selected layout composition without persisting overrides.

Component-pack authors can scaffold packs with `npm run marketplace:generate-component-pack -- my-pack`, validate manifests with `npm run marketplace:validate-pack -- path/to/manifest.json`, and use `docs/component-pack-preview-harness.md` plus `src/lib/component-pack-fixtures.ts` for route-based preview planning and fixture data.

Space customization is persisted in v4.79.0. Public reads at `/api/categories/:id/customization` and `/api/articles/:id/customization` resolve global environment defaults, parent category overrides, category overrides, and article overrides while hiding private draft config. Admin-only `PUT` requests to the same endpoints validate style, color theme, layout, component pack, template pack, navigation, and metadata schema fields before saving. Self-host upgrades should run `npx prisma generate`, `npx prisma db push`, delete `.next/`, and restart after updating.

The category admin page at `/admin/categories` includes the first space customization editor. It shows inherited effective values, explicit override markers, reset-to-parent/global controls, conflict warnings, article-list/metadata/navigation/theme previews, and responsive QA checkpoints for customized spaces.

Space templates are preview-safe JSON manifests for reusable category trees, starter article templates, sample metadata, default tags, infobox fields, navigation, dashboards, layout intent, and recommended component packs. `GET /api/space-templates` returns the built-in personal wiki, product docs, team handbook, worldbuilding bible, research notebook, reading archive, project knowledge base, and public documentation templates; `/space-templates/:id` previews each starter space; `POST /api/space-templates` validates imported template JSON or returns a one-click local import preview for a `templateId` before any future apply flow. Authoring guidance lives in [docs/space-templates.md](docs/space-templates.md).

Space governance hooks let categories declare owners, reviewers, default visibility, review cadence, stale-page thresholds, and required health signals. `GET/PUT /api/categories/:id/governance` resolves and persists inherited governance, article pages show inherited governance badges, and the admin dashboard summarizes space health widgets for stale pages, unreviewed drafts, and configured health signals.

Arkivel is still in beta throughout the v4 line. The roadmap now tracks the path from v4.76.0 through v4.99.99 toward a stable v5.0.0 release, with patch-level batches for customization, marketplace safety, plugin contracts, portability, auth hardening, security, operations, testing, documentation, and release-candidate evidence gates.

## API And Integrations

| Surface | Route | Notes |
|---|---:|---|
| Public API | `/api/v1/*`, `/api/v1/contract`, `/api/v1/openapi.json` | API-key protected article, category, search, and tag endpoints with a frozen v1 contract, OpenAPI schema, standard headers, fixture responses, and pre-v5 migration guide. |
| SDK types | `docs/sdk-types.md`, `/api/v1/sdk` | SDK-ready TypeScript payload names, API key scopes, generated client snippets, and sample scripts for backup, import, search, content audit, and webhook testing. |
| Webhook reliability | `docs/webhook-reliability.md`, `/api/webhooks/test` | Timestamped signatures, retries, delivery logs, redelivery, event schemas, replay protection, and local receiver guidance. |
| Operations dashboard | `docs/operations-dashboard.md`, `/admin/operations` | Admin-only service health, queues, failed jobs, slow pages, alerts, acknowledgements, runbooks, and redacted diagnostic bundles. |
| Maintenance tooling | `docs/maintenance-tooling.md`, `/admin/maintenance` | Maintenance/read-only readiness, safe-upgrade checks, backup reminders, background task pausing, and cleanup queues. |
| Observability | `docs/observability.md`, `/admin/observability` | Structured events, metric ingestion, operational event feed, privacy controls, and external collector guidance. |
| Performance budgets | `docs/performance-tuning.md`, `/admin/performance` | Route p95, interaction, and bundle targets for key surfaces, large-wiki fixture profiles, and slow-query review guidance. |
| Cache strategy | `docs/cache-strategy.md`, `/admin/cache` | Invalidation rules, manual admin invalidation, stale warnings, Redis status, and CDN/Vercel/Docker/reverse-proxy recipes. |
| Offline and PWA | `docs/offline-pwa.md`, `/api/offline/contract` | Installable app metadata, service-worker cache rules, offline reading fallbacks, stale indicators, retry queues, mobile QA, and privacy limits. |
| Mobile polish | `docs/mobile-polish.md`, `/api/mobile-polish` | Phone/tablet/laptop/wide responsive QA, touch-target and safe-area checks, overflow/clipping guardrails, and mobile release checklist metadata. |
| Desktop research | `docs/desktop-app-research.md`, `/api/desktop-research` | Electron/Tauri/PWA/Docker Desktop research, local deployment recipes, filesystem import/export UX planning, and pre-v5 desktop scope decision record. |
| Accessibility finish | `docs/accessibility.md`, `/api/accessibility` | Keyboard/focus/dialog/dropdown/control audits, screen-reader summaries, high-contrast/reduced-motion checks, contribution checklist, and v5 blocker gate. |
| Security review | `docs/security-review.md`, `/api/security/review` | Browser security headers, reviewed auth/API/plugin/export surfaces, abuse-case gates, supply-chain checklist, and pre-v5 threat-model draft. |
| Privacy controls | `docs/privacy-controls.md`, `/api/privacy/controls` | Deployment-mode privacy controls, data-retention defaults, user export/deletion planning, and warnings for AI, webhooks, exports, feeds, and indexing. |
| Marketplace security | `docs/secure-marketplace-plugins.md`, `/api/marketplace/security` | Unsafe pack rejection, blocked permissions/hooks, dangerous plugin capability warnings, local-only install guidance, and provenance/checksum planning. |
| Marketplace beta | `docs/marketplace-beta.md`, `/api/marketplace/beta` | Local-first beta metrics, featured/recent/recommended packs, collections, compatibility badges, search facets, install-intent steps, and beta limitations. |
| Marketplace lifecycle | `docs/marketplace-lifecycle.md`, `/api/marketplace/lifecycle` | Pack states, allowed transitions, local inventory, health checks, preview media validation, update metadata, compatibility warnings, and rollback guidance. |
| Marketplace authoring | `docs/marketplace-authoring.md`, `/api/marketplace/authoring` | Pack author dashboard metadata, README generator/checklist, Arkivel compatibility matrix, author quality expectations, and submission templates. |
| Template marketplace | `docs/template-marketplace.md`, `/api/marketplace/templates` | Template-pack listings, included schema, previews, diff/merge contracts, and export-from-space fixture output. |
| Sync manifests | `docs/sync-manifests.md`, `/api/sync-manifests` | Space-to-space manifest contract, section checksums, dry-run conflict reports, signed snapshot planning, and staging-to-production guidance. |
| External references | `docs/external-references.md`, `/api/external-references` | Cross-instance article, space, source, and snapshot metadata with provenance labels, diagnostics, and privacy-safe public index planning. |
| Archive mirrors | `docs/archive-mirror-workflows.md`, `/api/archive-mirrors` | Read-only archive snapshots, private mirror setup, selected-space transfer workflows, repeated-sync conflict notes, and the pre-v5 federation decision checkpoint. |
| API documentation | `/api-docs` | In-app reference for endpoints, auth, and errors. |
| Customization manifest | `/api/customization` | Public brand, style preset, color theme, layout, feature flag, limit, map, reusable component, editor control, operations dashboard, maintenance tooling, observability, performance budgets, cache strategy, offline/PWA, mobile polish, desktop research, accessibility finish, migration readiness, backup/restore, upgrade assistant, test quality gates, e2e smoke suite, release gate automation, documentation onboarding, in-app onboarding, example site recipes, feature freeze, release candidate one, final release gates, security review, privacy controls, marketplace security, marketplace beta, marketplace lifecycle, marketplace authoring, template marketplace, sync manifest, external reference, archive mirror, component slot, persisted space customization, marketplace registry/import-preview, plugin manifest schema/examples/compatibility matrix, plugin, theme-pack, template-pack, and theme-hook manifest for self-hosters and plugins. |
| Search relevance | `docs/search-relevance.md`, `/api/search` | Search relevance v2 weights, facets, synonyms, aliases, redirects, phrase ranking, admin explain mode, and stale/review/verification signals. |
| Search API contract | `docs/search-powered-plugins.md`, `/api/search/contract` | Stable typed search result shapes for plugins, widgets, dashboards, external tools, mobile clients, privacy metadata, retention policy, and webhook planning. |
| Discovery engines | `docs/discovery-engines.md`, `/api/discovery` | Duplicate, unresolved-question, canon-conflict, glossary-gap, orphan-topic, topic-cluster, continue-reading, admin-action, and dashboard-widget discovery reports. |
| Editor reliability | `docs/editor-troubleshooting.md`, `/api/customization` | Collaborative sync, draft recovery, autosave repair, snapshot restore/compare/discard, editor health diagnostics, and large-document fixture metadata. |
| Editor controls | `docs/editor-controls.md`, `/api/customization` | Reusable editor primitives, plugin extension points, block templates, and shortcut scopes for self-hosters and trusted plugins. |
| Collaboration UX | `docs/collaboration-ux.md`, `/api/customization` | Live editing states, presence names, conflict/reconnect copy, inline review planning, notification routing, mobile QA, and accessibility checkpoints. |
| Portable bundles | `docs/portable-bundles.md` | Full-site bundle manifest and import dry-run contract for articles, revisions, categories, tags, users, settings, plugin state, maps, comments, discussions, assets, customizations, checksums, privacy filters, and pre-v5 compatibility promises. |
| Export history | `/api/export/history` | Admin export history and downloadable JSON reports with manifest, checksum, warning, omission, byte-count, file-count, status, and scope metadata. |
| Import rehearsal | `/api/import/rehearsal` | Dry-run import contract with conflict categories, recommended actions, blocked changes, rollback plans, fixture profiles, and no write access in v4.81.2. |
| Workspaces | `docs/workspaces.md` | Workspace bootstrap profiles, invitations, scoped APIs, marketplace selections, and the single-workspace migration path. |
| Migration readiness | `docs/migration-readiness.md`, `/api/migration-readiness` | Blocking upgrade dry runs, backup prompts, schema compatibility reports, restore validation, representative v4 upgrade paths, and failure recovery guidance. |
| Backup and restore | `docs/backup-restore.md`, `/api/backup-restore` | Admin backup wizard metadata, restore rehearsal validation, scheduled backup planning, external storage notes, and disaster-recovery drill guidance. |
| Upgrade assistant | `docs/v5-upgrade-planning.md`, `/api/upgrade-assistant` | v5 readiness checklist, pre-upgrade diagnostics, post-upgrade smoke checks, compatibility warnings, and release-note/migration doc links. |
| Test quality gates | `docs/test-quality-gates.md`, `/api/test-quality` | Expanded test surfaces, stable QA fixtures, CI matrix planning, warning policy, and release-manager quality dashboard planning. |
| E2E smoke suite | `docs/e2e-smoke-suite.md`, `/api/e2e-smoke-suite` | Product smoke tests, responsive smoke routes, repeatable fixture seeding, and Playwright screenshot/trace failure artifacts. |
| Release gates | `docs/release-gate-automation.md`, `/api/release-gates` | Release candidate gates, docs sync verification, checklist metadata, known issues, and blocker labels. |
| Documentation onboarding | `docs/index.md`, `docs/maintainer-guide.md`, `/api/documentation-onboarding` | Maintainer guide, setup paths, troubleshooting, docs IA review, and practical docs link tests. |
| In-app onboarding | `docs/in-app-onboarding.md`, `/api/in-app-onboarding` | First-run checklist, guided admin setup, contextual help panel plan, demo content pack, and screenshot checkpoints. |
| Example site recipes | `docs/example-site-recipes.md`, `/api/example-site-recipes` | Personal wiki, team handbook, public docs, worldbuilding atlas, research library, read-only archive, and product knowledge base recipes with env snippets, screenshot targets, pack recommendations, migration stories, and v5 readiness checks. |
| Feature freeze | `docs/feature-freeze.md`, `/api/release-freeze` | Freeze policy, rehearsal matrix, known-issue blocker list, v5 gate ownership, and release-note draft sections. |
| Release candidate one | `docs/release-candidate-one.md`, `/api/release-candidate-one` | RC1 gates, deployment path validation, starter/pack/import/export validation, checklist metadata, and feedback template. |
| Final release gates | `docs/final-release-gates.md`, `/api/final-release-gates` | RC fixes, final beta freeze contracts, gate evidence, compatibility targets, correction windows, and v5 stable release gates. |
| Role templates | `docs/role-templates.md` | Personal admin, team owner, docs maintainer, editor, reviewer, contributor, viewer, public reader, permission matrix, invitation actions, and recovery guidance. |
| Private teams | `docs/private-team-knowledge-base.md` | Private team workspace setup, collaboration controls, notification routing, and public-surface visibility rules. |
| Editorial governance | `docs/editorial-governance.md` | Review due dates, required reviewers, approval thresholds, claim queues, verification stamps, ownership paths, and risk summary cards. |
| Audit trail | `docs/audit-trail.md`, `/admin/audit-log` | Immutable admin/security events with actor, target, workspace, severity, date, success filters, privacy-preserving JSON export, alert hooks, and retention defaults. |
| Moderation | `docs/moderation.md`, `/admin/suggestions` | Discussion reports, reviewer-only visibility, suggestion accept/reject/comment/assign/convert actions, public contribution spam scoring, and moderation states. |
| Plugin admin | `/admin/plugins` | Admin-only plugin review surface for registered plugins and trusted local `plugin.json` manifests, including loader status, permission prompts, compatibility, health metadata, routes, widgets, hooks, audit-backed enable/disable, and load errors. |
| Space customization | `/api/categories/:id/customization`, `/api/articles/:id/customization` | Public resolved space/article customization reads with admin-only validated override writes. |
| Space templates | `/api/space-templates`, `/space-templates/:id` | Preview-safe starter space registry, preview pages, JSON preview/import validation, and one-click local import previews. |
| Domain workflows | `docs/domain-workflows.md`, `/api/space-workflows` | Starter-space workflow metadata for docs, handbook, worldbuilding, research, and personal wiki products. |
| Assistant packs | `docs/assistant-packs.md`, `/api/assistant-packs`, `/admin/assistants` | Opt-in built-in AI pack contract with per-space availability, prompt/context previews, usage/cost metadata, permissions, safety, and fallback metadata. |
| Assistant governance | `docs/assistant-governance.md`, `/api/assistant-packs/governance` | Responsible AI warnings, review/citation/confidence requirements, AI audit events, opt-outs, and optional/non-blocking release gate. |
| Space governance | `/api/categories/:id/governance`, `/api/admin/space-governance/summary` | Inherited space owner/reviewer/visibility/review cadence and admin health widget summaries. |
| Studio feed | `/api/studio` | Generated command board, base views, graph links, and action queue. |
| Studio canvas export | `/api/studio/canvas` | JSON Canvas export for portable visual knowledge work. |
| Canon Trails feed | `/api/trails` | Guided route report for demos, readers, and automation. |
| Canon Atlas feed | `/api/atlas` | Territory, dossier, thread, continuity, and move report. |
| Knowledge feed | `/api/intelligence` | Cockpit score, engines, radar, graph, pressure model, and action queue. |
| RSS | `/feed.xml` | RSS 2.0 feed. |
| Atom | `/feed/atom` | Atom feed. |
| Webhooks | `/api/webhooks` | Article create/update/delete callbacks. |

## Architecture Snapshot

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Data:** Prisma 7, PostgreSQL, `@prisma/adapter-pg`, Neon-compatible `pg` pool
- **Editor:** Tiptap 3 with wiki links, footnotes, tables, code highlighting, and custom blocks
- **Styling:** Tailwind CSS 4 with CSS variables in `src/app/globals.css`
- **Auth and workspaces:** Local/self-host admin mode plus multi-user sessions with viewer/editor/admin roles; `Wiki` is the workspace boundary for memberships, invitations, bootstrap profiles, settings, navigation, and scoped article/search/category/tag APIs
- **Content model:** HTML article body, optional raw Markdown, revisions, categories, tags, translations, relations, discussions, watchlists, notifications, and operational metrics

See [ARCHITECTURE.md](ARCHITECTURE.md), [DESIGN.md](DESIGN.md), [ROADMAP.md](ROADMAP.md), [docs/features.md](docs/features.md), and [docs/help.md](docs/help.md) for the contributor-level references.

## Documentation And Versioning

Arkivel treats documentation as part of the product. Every commit that changes behavior, UI, configuration, APIs, schema, workflows, or contributor guidance should update the matching docs and version metadata in the same commit.

At minimum, check [AGENTS.md](AGENTS.md), [CHANGELOG.md](CHANGELOG.md), [ROADMAP.md](ROADMAP.md), [DESIGN.md](DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md), [docs/features.md](docs/features.md), [docs/help.md](docs/help.md), the in-app `/features` and `/help` pages, plus `package.json` and `package-lock.json`.

Commit messages follow the project history: release commits use `vX.Y.Z: imperative summary` matching `package.json`, while dependency automation keeps `build(deps): ...`.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # prisma db push + next build
npm run lint         # ESLint
npm run test         # Vitest
npm run test:e2e     # Playwright
npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema changes
node prisma/seed.mjs # Seed default categories
```

## License

MIT
