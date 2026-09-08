# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Next.js 16 + Turbopack)
npm run build        # prisma db push && next build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
node prisma/seed.mjs # Seed default categories
```

After changing `prisma/schema.prisma`, always run `npx prisma generate` and delete `.next/` to avoid stale client errors.

## Documentation and Versioning Discipline

Every commit must keep product docs, in-app docs, and version metadata synchronized with the code change. This is a standing repo rule for all agents and contributors.

Before finishing any change, check whether the change affects behavior, UI, configuration, API shape, data model, workflow, feature availability, or contributor guidance. If it does, update the relevant docs in the same commit:

- Root references: `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `DESIGN.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `AGENTS.md`, and other root docs that describe the touched area.
- Markdown product docs: `docs/help.md`, `docs/features.md`, and any relevant files under `docs/archive/`.
- In-app product pages: `src/app/help/page.tsx`, `src/app/features/page.tsx`, `src/app/api-docs/page.tsx`, and any route-specific documentation or settings copy affected by the change.
- Version metadata: bump `package.json` and `package-lock.json` for every user-visible, docs-visible, or release-note-worthy change. Use a patch bump for documentation/process/UI copy changes, minor for new product capabilities, and major only for breaking changes.

If a doc does not need changes, leave it untouched. Do not make a code-only change for a user-visible feature unless the matching documentation and version updates are included.

The v4 line is beta. Treat `ROADMAP.md` as the source of truth for the pre-v5 patch-level work ladder, with v4.99.99 reserved for the last beta candidate and v5.0.0 reserved for the first stable release after the documented release gates are satisfied.

## Customization and Marketplace Discipline

Arkivel is an open-source, self-hostable knowledge platform. Prefer reusable, configurable surfaces over route-specific one-offs whenever a change could reasonably be customized by another instance.

- Public customization belongs in `src/lib/customization.ts`, with defaults and env metadata exposed through `/api/customization`.
- Style presets, color themes, layout presets, component packs, theme packs, and plugin-like extension listings belong in `src/lib/marketplace.ts` with stable ids, clear `kind`, semantic `version`, `status`, compatibility notes, author, license, local source, screenshots, checksums, and tags.
- Preview-only marketplace import parsing belongs in `src/lib/marketplace-import.ts`; it must reject executable payloads, remote code references, path traversal, unsafe permissions, unsupported kinds, and unsupported schema versions before any future install flow can reuse it.
- Customization Studio tab metadata, responsive QA checkpoints, keyboard-navigation helpers, and assistive summary text belong in `src/lib/customization-studio.ts`.
- Sync manifest planning belongs in `src/lib/sync-manifests.ts` and `/api/sync-manifests`; keep it dry-run and snapshot oriented until network federation is proven reliable.
- External Arkivel reference planning belongs in `src/lib/external-references.ts` and `/api/external-references`; never centralize private or sensitive reference metadata in public index outputs.
- Archive and mirror workflow planning belongs in `src/lib/archive-mirrors.ts` and `/api/archive-mirrors`; keep archive snapshots read-only and repeated-sync conflict handling explicit.
- Mobile polish metadata belongs in `src/lib/mobile-polish.ts` and `/api/mobile-polish`; pair mobile CSS changes with responsive QA and release-checklist docs.
- Desktop packaging research belongs in `src/lib/desktop-research.ts` and `/api/desktop-research`; keep it research-only until v5 scope is explicitly approved.
- Accessibility finish metadata belongs in `src/lib/accessibility-finish.ts` and `/api/accessibility`; treat keyboard traps, unnamed controls, lost focus, broken contrast, and ignored reduced motion as release blockers.
- UI primitives should be built from `src/components/ui` and registered in `src/components/ui/catalog.ts` when they are reusable.
- Theme changes should flow through CSS variables, shared `ui-*` / `wiki-*` classes, and scoped hooks such as `html[data-style="..."]`.
- When adding or changing customization, marketplace, style, color theme, or reusable component contracts, update `DESIGN.md`, `ARCHITECTURE.md`, `README.md`, `docs/help.md`, `docs/features.md`, in-app Help/Features/API docs, changelog, roadmap, tests, and version metadata as relevant.

## Commit Message Standard

Follow the existing repository history when writing commit messages.

- Release/version commits must use `vX.Y.Z: imperative summary`, matching the version in `package.json`. Examples: `v4.74.4: document release discipline`, `v4.71.2: collapse article and presentation tables`.
- The summary after the colon should be short, lower-case unless it contains a proper noun, and written as an imperative verb phrase: `add`, `fix`, `harden`, `simplify`, `document`, `refactor`, `polish`, `bump`.
- Non-version commits may use the same imperative style without a version prefix, e.g. `Fix build: wrap useSearchParams in Suspense` or `Polish theme-aware Arkivel logo`.
- Dependency automation keeps Conventional Commit style from Dependabot, e.g. `build(deps): bump ...` or `build(deps-dev): bump ...`.
- Merge commits may keep GitHub/Git defaults.
- Keep the subject focused on the shipped outcome, not implementation trivia. If a body is needed, use brief bullets for docs updated, tests run, and notable risks.

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Prisma 7 + PostgreSQL (Neon) + Tailwind CSS 4 + Tiptap editor

**Two remotes:** `origin` (private personal wiki) and `public` (public product repo). The public repo has clean history without personal data.

### Key Patterns

**Configuration:** Public self-host customization is centralized in `src/lib/customization.ts` and exposed through `/api/customization`. `src/lib/config.ts` keeps backward-compatible aliases for runtime callers. Defaults produce a generic wiki; branding, style presets, and color themes are selected through `NEXT_PUBLIC_*` env vars such as `NEXT_PUBLIC_ARKIVEL_STYLE` and `NEXT_PUBLIC_ARKIVEL_COLOR_THEME`.

**Marketplace metadata:** Built-in and planned style presets, color themes, layout presets, component packs, theme packs, and plugin listings live in `src/lib/marketplace.ts`. Treat these records as the local-first marketplace registry contract with version, schema, source, license, checksum, compatibility, and validation metadata. Preview-only import parsing and examples live in `src/lib/marketplace-import.ts`.

**Audit trail:** Append-only audit helpers live in `src/lib/audit.ts`; `AuditLog` rows track actor, target, workspace, severity, success, network metadata, and JSON details. Keep `/api/admin/audit-log`, `docs/audit-trail.md`, and the `/api/customization` `auditTrail` contract synchronized when adding sensitive admin, permission, customization, plugin, import, export, or marketplace events.

**Moderation:** Discussion and suggestion moderation contracts live in `src/lib/moderation.ts`. Keep discussion status/visibility, suggestion review actions, public contribution spam scoring, `/admin/suggestions`, `docs/moderation.md`, and the `/api/customization` `moderation` contract synchronized when changing public contribution or community wiki workflows.

**Auth:** Dual auth system. Legacy local/self-host mode treats missing `ADMIN_SECRET` as admin access; multi-user mode uses bcrypt-hashed passwords in `User` table with session tokens. `getSession()` returns current user, `isAdmin()` checks admin access, `requireRole(user, role)` handles granular permissions, and `AdminProvider` is seeded from server auth state in the root layout before its client refresh. Roles: admin, editor, viewer.

**Prisma:** Uses `@prisma/adapter-pg` with raw `pg` pool (required for Neon). Singleton in `src/lib/prisma.ts` with `globalThis` caching for dev hot-reload.

**Wiki Links:** Articles cross-reference via `[[Article Name]]` syntax. Custom Tiptap extension (`src/components/editor/WikiLinkExtension.ts`) renders them as `data-wiki-link` anchors. At display time, `resolveWikiLinks()` in `src/lib/wikilinks.ts` checks the DB and marks broken links with CSS class. `getBacklinks()` finds reverse references.

**Revisions:** Every article PUT auto-snapshots the current state into `ArticleRevision` before applying changes. History page shows timeline; diff page compares two revisions.

**Content Storage:** Articles store `content` (HTML from Tiptap) and `contentRaw` (optional Markdown). The HTML is what gets displayed; Markdown is for export.

**Theming:** CSS variables defined in `src/app/globals.css` under `@theme` block. Dark mode via `html[data-theme="dark"]` overrides; style presets use `html[data-style="..."]` overrides; color themes use `html[data-color-theme="..."]` overrides; layout presets use `html[data-layout="..."]` hooks. Important: use `@theme` not `@theme inline` — the latter inlines hex values into Tailwind utilities, breaking CSS variable overrides.

**Map:** Disabled by default (`NEXT_PUBLIC_MAP_ENABLED`). Uses Leaflet with `CRS.Simple` (pixel coords, not geographic). Dynamically imported (no SSR). Markers stored in `MapMarker` table and optionally linked to articles.

### Data Flow for Articles

1. Create/edit via Tiptap editor → HTML + optional Markdown
2. POST/PUT to `/api/articles/[id]` → Prisma creates/updates + auto-revision
3. Display: server component fetches article → `resolveWikiLinks(content)` → render HTML
4. Backlinks computed via `getBacklinks(slug)` querying other articles' content

### Search

`/api/search` and `/app/search/page.tsx` both implement relevance-ranked search. Multi-word queries use AND logic (every word must appear in title/content/excerpt). Relevance v2 lives in `src/lib/search-relevance.ts` and combines exact title, phrase, alias/redirect, word coverage, stale, draft, review, and verification signals; admin callers can use `explain=1` for scoring details.

`src/lib/search-api.ts` defines stable search result shapes for plugins, widgets, dashboards, external tools, and mobile clients. Keep `/api/search/contract`, `/api/customization`, `docs/search-powered-plugins.md`, and tests aligned when adding search result kinds, privacy metadata, retention policy, or search webhook events.

**Footnotes:** Custom Tiptap `FootnoteRef` node extension. Stored as `<sup data-footnote="text">` in HTML. Auto-numbered via CSS counters. Footnote section appended at display time by `appendFootnoteSection()`.

**Syntax Highlighting:** Code blocks use `@tiptap/extension-code-block-lowlight` with lowlight (highlight.js). Language selection on insert, theme-aware CSS.

**Editor reliability:** `src/lib/editor-reliability.ts` publishes the reliability contract for collaborative sync, draft recovery, offline warnings, autosave repair, paste cleanup, embed handling, snapshot restore/compare/discard, diagnostics, and large-document fixtures. Keep `docs/editor-troubleshooting.md`, `/api/customization`, and snapshot APIs synchronized when changing editor recovery behavior.

**Reusable editor controls:** `src/lib/editor-controls.ts` publishes editor primitive metadata, plugin command/toolbar/slash/side-panel extension points, block templates, and shortcut scopes through `/api/customization`. Reusable editor UI lives in `src/components/editor/EditorPrimitives.tsx` and `EditorToolbar.tsx`; update `docs/editor-controls.md`, `DESIGN.md`, component catalog entries, and in-app docs when changing editor control contracts.

**Collaboration UX:** `src/lib/collaboration-ux.ts` publishes live editing connection states, presence names, conflict/reconnect/offline copy, inline review planning, notification routing, mobile QA, and accessibility checkpoints through `/api/customization`. Keep `CollaborativeEditor.tsx`, `docs/collaboration-ux.md`, `DESIGN.md`, and in-app docs aligned when changing collaboration status, notification, or review-note behavior.

**Public API v1:** `src/lib/public-api-v1.ts` is the source of truth for the pre-v5 API contract, OpenAPI generation, standard headers, error shape, fixtures, and migration metadata. Keep `/api/v1/contract`, `/api/v1/openapi.json`, `/api/customization`, `docs/api-v1-migration.md`, `/api-docs`, README, changelog, roadmap, and tests aligned when changing v1 behavior.

**SDK types:** `src/lib/sdk-types.ts` publishes SDK-ready REST, webhook, customization, marketplace, plugin, export, API-key scope, generated example, and sample script metadata. Keep `/api/v1/sdk`, `/api/customization`, `docs/sdk-types.md`, `examples/api/`, API docs, README, changelog, roadmap, and tests aligned when changing SDK-facing contracts.

**Webhook reliability:** `src/lib/webhook-reliability.ts` defines webhook signing, retry, replay, event schema, redelivery, and test sender contracts. Keep `src/lib/webhooks.ts`, `/api/webhooks/test`, `/api/webhooks/deliveries/:id/redeliver`, `/api/customization`, `docs/webhook-reliability.md`, API docs, README, changelog, roadmap, and tests aligned when changing webhook behavior.

**Operations dashboard:** `src/lib/operations-dashboard.ts` defines service health, queue, metric, slow-page, alert, diagnostic-bundle, and acknowledgement contracts. Keep `/admin/operations`, `/api/admin/operations`, `/api/customization`, `docs/operations-dashboard.md`, API docs, README, changelog, roadmap, and tests aligned when changing operations behavior.

**Maintenance tooling:** `src/lib/maintenance-tooling.ts` defines maintenance/read-only mode keys, background task pausing, safe-upgrade checks, cleanup task metadata, and runbook links. Keep `/admin/maintenance`, `/admin/read-only`, `/api/admin/maintenance`, `/api/admin/maintenance/report`, `/api/customization`, `docs/maintenance-tooling.md`, API docs, README, changelog, roadmap, and tests aligned when changing maintenance behavior.

**Migration readiness:** `src/lib/migration-readiness.ts` defines blocking dry-run phases, backup prompts, schema compatibility reports, restore validation, representative upgrade paths, Prisma freeze decisions, and migration test coverage. Keep `/api/migration-readiness`, `/api/customization`, `docs/migration-readiness.md`, API docs, README, changelog, roadmap, and tests aligned when changing migration readiness behavior.

**Backup and restore:** `src/lib/backup-restore.ts` defines admin backup wizard sections, restore rehearsal manifest validation, conflict reports, scheduled backup planning, external storage notes, and disaster-recovery drill guidance. Keep `/api/backup-restore`, `/api/customization`, `docs/backup-restore.md`, API docs, README, changelog, roadmap, and tests aligned when changing backup or restore behavior.

**Upgrade assistant:** `src/lib/upgrade-assistant.ts` defines v5 readiness checks, pre-upgrade diagnostics, post-upgrade smoke checks, compatibility warnings, release-note/migration links, and upgrade planning guidance. Keep `/api/upgrade-assistant`, `/api/customization`, `docs/v5-upgrade-planning.md`, API docs, README, changelog, roadmap, and tests aligned when changing upgrade behavior.

**Test quality gates:** `src/lib/test-quality-gates.ts` defines expanded test surfaces, stable fixtures, CI matrix dimensions, known-warning policy, and release-manager dashboard planning. Keep `/api/test-quality`, `/api/customization`, `docs/test-quality-gates.md`, API docs, README, changelog, roadmap, and tests aligned when changing quality gates.

**E2E smoke suite:** `src/lib/e2e-smoke-suite.ts` defines product smoke flows, responsive smoke routes, fixture seeding, and Playwright failure artifacts. Keep `/api/e2e-smoke-suite`, `/api/customization`, `e2e/smoke-suite.spec.ts`, `scripts/seed-smoke-fixtures.mjs`, `docs/e2e-smoke-suite.md`, Playwright config, API docs, README, changelog, roadmap, and tests aligned when changing smoke coverage.

**Release gate automation:** `src/lib/release-gate-automation.ts` defines release candidate gates, docs sync checks, checklist metadata, known issues, and blocker labels. Keep `/api/release-gates`, `/api/customization`, `scripts/verify-docs-sync.mjs`, `docs/release-gate-automation.md`, `docs/known-issues.md`, API docs, README, changelog, roadmap, and tests aligned when changing release gates.

**Documentation onboarding:** `src/lib/documentation-onboarding.ts` defines maintainer docs, setup paths, troubleshooting topics, docs IA review, and practical link-test coverage. Keep `/api/documentation-onboarding`, `/api/customization`, `docs/index.md`, `docs/maintainer-guide.md`, `docs/setup-paths.md`, `docs/troubleshooting.md`, API docs, README, changelog, roadmap, and tests aligned when changing onboarding documentation.

**In-app onboarding:** `src/lib/in-app-onboarding.ts` defines the first-run setup checklist, guided admin setup topics, contextual help panel plan, demo content pack metadata, and screenshot checkpoints. Keep `/api/in-app-onboarding`, `/api/customization`, `docs/in-app-onboarding.md`, `examples/onboarding/demo-content-pack.json`, API docs, README, changelog, roadmap, and tests aligned when changing onboarding flows.

**Example site recipes:** `src/lib/example-site-recipes.ts` defines example setup recipes, env snippets, screenshot targets, marketplace/template recommendations, migration stories, and v5 readiness checks. Keep `/api/example-site-recipes`, `/api/customization`, `docs/example-site-recipes.md`, `examples/recipes/site-recipes.json`, API docs, README, changelog, roadmap, and tests aligned when changing recipe guidance.

**Feature freeze:** `src/lib/feature-freeze.ts` defines freeze policy, full rehearsal areas, known-issue blocker labels, v5 gate ownership, and release-note draft sections. Keep `/api/release-freeze`, `/api/customization`, `docs/feature-freeze.md`, `docs/known-issues.md`, API docs, README, changelog, roadmap, and tests aligned when changing release-freeze behavior.

**Release candidate one:** `src/lib/release-candidate-one.ts` defines RC1 required gates, deployment path validation, starter/pack/import/export validation areas, review checklists, and feedback-template metadata. Keep `/api/release-candidate-one`, `/api/customization`, `docs/release-candidate-one.md`, `docs/rc-feedback-template.md`, API docs, README, changelog, roadmap, and tests aligned when changing RC1 evidence.

**Final release gates:** `src/lib/final-release-gates.ts` defines RC fix areas, final beta freeze contracts, gate evidence, compatibility targets, correction windows, and stable v5 release gates. Keep `/api/final-release-gates`, `/api/customization`, `docs/final-release-gates.md`, API docs, README, changelog, roadmap, and tests aligned when changing final release evidence.

**Observability:** `src/lib/observability.ts` defines structured log categories, metric types, privacy controls, metadata redaction, and event-feed contracts. Keep `/admin/observability`, `/api/admin/observability`, `/api/observability/metrics`, `/api/customization`, `docs/observability.md`, API docs, README, changelog, roadmap, and tests aligned when changing observability behavior.

**Performance budgets:** `src/lib/performance-budgets.ts` defines route p95, interaction, bundle-size, large-wiki fixture, and slow-query diagnostic contracts. Keep `/admin/performance`, `/api/admin/performance`, `/api/customization`, `docs/performance-tuning.md`, API docs, README, changelog, roadmap, and tests aligned when changing performance behavior.

**Cache strategy:** `src/lib/cache-strategy.ts` defines invalidation rules, stale warnings, deployment recipes, and manual invalidation metadata. Keep article/category/tag write APIs, `/admin/cache`, `/api/admin/cache`, `/api/customization`, `docs/cache-strategy.md`, API docs, README, changelog, roadmap, and tests aligned when changing cache behavior.

**Offline/PWA:** `src/lib/offline-pwa.ts` defines service-worker cache rules, install metadata, stale headers, retry queue eligibility, mobile QA, draft warnings, and privacy limits. Keep `/sw.js`, `ServiceWorkerManager`, `/api/offline/contract`, `/api/customization`, `docs/offline-pwa.md`, API docs, README, changelog, roadmap, and tests aligned when changing offline or install behavior.

**Security review:** `src/lib/security-review.ts` defines reviewed security surfaces, middleware header metadata, CSRF-sensitive path classification, abuse-case gates, supply-chain checklist, and the pre-v5 threat-model draft. Keep `middleware.ts`, `/api/security/review`, `/api/customization`, `docs/security-review.md`, API docs, README, changelog, roadmap, and tests aligned when changing security posture.

**Privacy controls:** `src/lib/privacy-controls.ts` defines deployment-mode privacy controls, retention keys, user data lifecycle planning, and warnings for AI/external integrations. Keep `/api/privacy/controls`, `/api/customization`, `docs/privacy-controls.md`, API docs, README, changelog, roadmap, and tests aligned when changing privacy behavior or retention policy.

**Marketplace security:** `src/lib/marketplace-security.ts` defines blocked marketplace/plugin permissions, unsafe hook prefixes, dangerous capability warnings, local-only installation guidance, provenance requirements, and checksum verification planning. Keep `src/lib/marketplace-import.ts`, `/api/marketplace/security`, `/api/customization`, `docs/secure-marketplace-plugins.md`, API docs, README, changelog, roadmap, and tests aligned when changing marketplace or plugin security behavior.

**Marketplace beta:** `src/lib/marketplace-beta.ts` defines local-first marketplace beta metrics, featured/recent/recommended pack groups, collections, compatibility badges, search facets, install-intent steps, and limitations. Keep `/api/marketplace/beta`, `/api/customization`, `docs/marketplace-beta.md`, API docs, README, changelog, roadmap, and tests aligned when changing beta marketplace launch behavior.

**Marketplace lifecycle:** `src/lib/marketplace-lifecycle.ts` defines pack states, allowed transitions, local inventory, health checks, preview media validation, update metadata, compatibility warnings, and rollback guidance. Keep `/api/marketplace/lifecycle`, `/api/customization`, `docs/marketplace-lifecycle.md`, API docs, README, changelog, roadmap, and tests aligned when changing lifecycle behavior.

**Marketplace authoring:** `src/lib/marketplace-authoring.ts` defines author dashboard metadata, local validation, metadata previews, screenshot checks, license checks, docs completeness, README generation, quality checklist, compatibility matrix, and submission templates. Keep `/api/marketplace/authoring`, `/api/customization`, `docs/marketplace-authoring.md`, examples, API docs, README, changelog, roadmap, and tests aligned when changing authoring behavior.

**Space templates and starter spaces:** `src/lib/space-templates.ts` defines preview-safe starter space templates, category trees, article templates, sample metadata, tags, infobox fields, navigation, dashboards, recommended packs, preview pages, and one-click local import previews. Keep `/api/space-templates`, `/space-templates/:id`, `/api/customization`, `docs/space-templates.md`, in-app docs, changelog, roadmap, and tests aligned when changing starter space behavior.

**Template marketplace:** `src/lib/template-marketplace.ts` defines `template-pack` marketplace previews, included schema, category and article previews, compatibility notes, diff/merge metadata, and export-from-space fixtures. Keep `/api/marketplace/templates`, `/api/customization`, `docs/template-marketplace.md`, marketplace docs, changelog, roadmap, and tests aligned when changing template marketplace behavior.

**Domain workflows:** `src/lib/domain-workflows.ts` defines docs portal, team handbook, worldbuilding, research, and personal wiki workflow controls, steps, starter template links, and release gates. Keep `/api/space-workflows`, `/api/customization`, `docs/domain-workflows.md`, in-app docs, changelog, roadmap, and tests aligned when changing workflow behavior.

**Assistant packs:** `src/lib/assistant-packs.ts` defines opt-in AI provider, model, privacy, cost, retention, prompt scope, permission, tool, context source, output, limit, safety, per-space availability, prompt/context preview, usage log, cost estimate, admin route, and graceful fallback metadata. Keep `/api/assistant-packs`, `/admin/assistants`, `/api/customization`, `docs/assistant-packs.md`, in-app docs, changelog, roadmap, and tests aligned when changing AI pack behavior.

**Assistant governance:** `src/lib/assistant-governance.ts` defines responsible AI privacy warnings, human-review requirements, citation prompts, confidence metadata, AI audit actions, private/sensitive opt-outs, and optional/non-blocking release gates. Keep `/api/assistant-packs/governance`, `/api/customization`, `docs/assistant-governance.md`, in-app docs, audit metadata, changelog, roadmap, and tests aligned when changing AI governance behavior.

**Article Status:** Articles have `status` field ("draft", "review", "published"). Non-published articles hidden from non-admins. `isPinned` boolean for featuring at top of category pages.

**Semantic Links:** `ArticleLink` model with relation types (related-to, is-part-of, etc.). Defined in `src/lib/relations.ts`. Displayed via `SemanticRelations` component.

**Discovery engines:** `src/lib/discovery-engines.ts` exposes duplicate-page, unresolved-question, canon-conflict, glossary-gap, orphan-topic, topic-cluster, continue-reading, admin-action, and dashboard-widget report contracts. Keep `/api/discovery`, `/api/customization`, docs, and tests aligned when adding discovery signals.

**Graph:** D3 force-directed graph at `/graph`. API at `/api/graph` returns nodes/edges from wiki links and ArticleLink table. Supports BFS subgraph via `?center=slug&depth=N`.

**Feeds & API:** RSS at `/feed.xml`, Atom at `/feed/atom`. Public REST API at `/api/v1/` with API key auth (`X-API-Key` header). Webhooks dispatched on article events.

**Plugins:** Lightweight plugin system. Interface in `src/lib/plugins/types.ts`, registry in `src/lib/plugins/registry.ts`. Plugin state in `PluginState` table.

**Workspaces:** `Wiki` is the durable workspace boundary. Workspace metadata includes visibility, default role, navigation mode, bootstrap profile, settings, marketplace selections, memberships, and invitations. Core article/search/category/tag APIs accept `workspaceId`, `wikiId`, or `X-Arkivel-Workspace`; `includeGlobal=1` is only for legacy single-workspace migration windows.

**Role templates:** `src/lib/role-templates.ts` defines personal admin, team owner, docs maintainer, editor, reviewer, contributor, viewer, and public reader templates. Keep role-template docs and `/api/customization` metadata synchronized when changing permissions, invitation behavior, API-key behavior, or recovery guidance.

**Collaboration controls:** `src/lib/collaboration-controls.ts` defines workspace-aware policy for co-authors, locks, review assignments, comments, mentions, notifications, digests, and contribution summaries. Anonymous feeds/sitemaps must only expose legacy unscoped published articles and public workspace articles; API v1 must respect public, owned, and active-member workspace boundaries.

**Editorial governance:** `src/lib/editorial-governance.ts` defines review governance, claim queues, verification stamps, ownership/escalation paths, and release-blocker summary cards. Keep review fields, claim review metadata, verification stamp docs, `/api/customization`, and `/api/admin/editorial-governance/summary` aligned when changing governance behavior.

## Database Models

- **Article** — main content with slug, HTML content, category, tags, revisions, status, sortOrder, isPinned
- **Category** — hierarchical (self-referential `parentId`), ordered by `sortOrder`
- **Tag** — hierarchical (self-referential `parentId`), many-to-many with articles via `ArticleTag`
- **ArticleRevision** — immutable snapshots created on every edit, with userId attribution
- **ArticleTranslation** — multi-language article content (locale, title, content)
- **User** — multi-user accounts (username, email, passwordHash, role)
- **Session** — auth sessions with token and expiry
- **Wiki** / **WikiMembership** / **WorkspaceInvitation** — workspace boundary, member roles/status, bootstrap profile, settings, marketplace selections, and invitation flow
- **Watchlist** — user-article watch pairs for notifications
- **Notification** — edit/reply/mention notifications per user
- **ApiKey** — public API authentication keys per user
- **Webhook** / **WebhookDelivery** — event webhooks with delivery logging
- **ArticleLink** — semantic wiki links with relation types
- **MapMarker** — coordinates + optional article link, grouped by `mapId`, with zoom levels
- **MapConfig** / **MapLayer** / **MapDetailLevel** — multi-map system with layers
- **PluginState** — plugin enable/disable config
- **MetricLog** — performance metric logging
- **CollaborationSession** — real-time collab Yjs document storage
- **Discussion** — article discussion comments with optional userId
