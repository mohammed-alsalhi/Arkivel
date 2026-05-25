# Architecture

This document describes the technical architecture of Arkivel for contributors and maintainers.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4 with CSS variable theming |
| Editor | Tiptap 3 (ProseMirror-based) |
| Database | PostgreSQL via Prisma 7 ORM |
| Auth | Dual: legacy admin password + multi-user with roles (admin, editor, viewer) |
| Hosting | Vercel (recommended), Docker, or any Node.js host |
| Image Storage | Vercel Blob |

## Directory Structure

```
src/
  app/                        # Next.js App Router pages and API routes
    api/
      articles/               # CRUD, batch, import, reorder, titles, similar, recent, orphans, dead-links
        [id]/                  # Single article + backlinks, claim reviews, discussions, export, links, rating, related, revisions, status, translations, views, word-count
      auth/                   # Login, logout, register, check
      categories/             # Category CRUD + tree view
        [id]/
      tags/                   # Tag CRUD + popular
        [id]/
      search/                 # Full-text search
      graph/                  # Knowledge graph (BFS subgraph support)
      studio/                 # Arkivel Studio command board report and JSON Canvas export
      atlas/                  # Canon Atlas report
      trails/                 # Canon Trails guided route report
      intelligence/           # Knowledge Command Center cockpit report
      customization/          # Public self-host customization manifest
      offline/                # Offline/PWA contract metadata
      security/               # Security review contract metadata
      privacy/                # Privacy controls contract metadata
      marketplace/security/   # Marketplace and plugin security metadata
      marketplace/beta/       # Marketplace beta launch metadata
      marketplace/lifecycle/  # Marketplace pack lifecycle metadata
      marketplace/authoring/  # Marketplace authoring metadata
      marketplace/templates/  # Template-pack marketplace metadata
      space-workflows/        # Domain workflow metadata
      assistant-packs/        # AI assistant pack metadata
      map-markers/            # Marker CRUD
        [id]/
      maps/                   # Multi-map management
        [mapId]/
      users/                  # User accounts
      v1/                     # Public REST API (articles, categories, search, tags)
      export/                 # Batch HTML/Markdown export
      upload/                 # Image upload to Vercel Blob
      stats/                  # Wiki statistics
      metrics/                # Performance metrics
      health/                 # Health check
      notifications/          # User notifications
      reviewers/              # Editor/admin reviewer lookup
      reviews/                # Review request queue, detail, decisions, and comments
      watchlist/              # Article watch subscriptions
      webhooks/               # Webhook management
      plugins/                # Plugin management
      sitemap/                # Dynamic sitemap data
    articles/
      [slug]/                 # Article display, edit, history, diff, discussion
      new/                    # Create article page
    categories/               # Category listing and individual pages
    tags/                     # Tag-based article listing
    studio/                   # Arkivel Studio live board, base views, and Studio moves
    atlas/                    # Canon Atlas world-map surface
    trails/                   # Canon Trails reader routes
    graph/                    # Interactive D3 knowledge graph
    intelligence/             # Cockpit-style Knowledge Command Center
    map/                      # Interactive map pages
      [mapId]/
    search/                   # Search results page
    reviews/                  # Review dashboard and request detail workspace
    page.tsx                  # Main Page front page with stats, featured article, browse directory, and recent updates
    login/                    # Login page
    register/                 # Registration page
    admin/                    # Admin dashboard
      metrics/                # Performance metrics page
      plugins/                # Plugin management page
      webhooks/               # Webhook management page
    recent-changes/           # Timeline of all edits
    random/                   # Random article redirect
    watchlist/                # User's watched articles
    import/                   # Bulk article import (admin)
    export/                   # Bulk export page
    api-docs/                 # Public API documentation
    help/                     # In-app feature guide
    users/
      [username]/             # User profile page
    feed.xml/                 # RSS 2.0 feed
    feed/atom/                # Atom feed
  components/
    editor/                   # Tiptap editor and extensions
      TiptapEditor.tsx        # Main rich text editor shell, feature tray orchestration, telemetry, and writing tools
      EditorPrimitives.tsx    # Reusable insert/review/outline trays and selected-text action bar
      EditorToolbar.tsx       # Ribbon toolbar and reusable contextual table controls
      WikiLinkExtension.ts    # [[Article Name]] node extension
      WikiLinkSuggester.tsx   # Autocomplete dropdown for wiki links
      useWikiLinkSuggester.ts # Hook for wiki link suggestions
      FootnoteExtension.ts    # Footnote/citation support
      PotentialLinkExtension.ts # Detected link mark extension
      LinkBubble.tsx          # Floating edit/remove tooltip for links
    layout/                   # App shell navigation and header controls
      Sidebar.tsx
      MobileNavigation.tsx
      LayoutShell.tsx
      SearchBar.tsx
    graph/                    # D3 force-directed graph
      ArticleGraph.tsx
      GraphControls.tsx
    map/                      # Leaflet map components (dynamically imported)
      WorldMap.tsx
      MapManager.tsx
      MapSelector.tsx
      LayerControl.tsx
      MapSearch.tsx
    articles/                 # Article display components
      ArticleCard.tsx
    article/
      ArticleActionPanel.tsx   # Slim article action rail with Read/Tools disclosures
      ArticlePageHeader.tsx    # Article hero metadata and badges
      ArticleTaxonomyFooter.tsx # Category/tag chip footer
      ClaimsPanel.tsx          # Claim confidence summary and persistent claim review controls
      ReviewRequestButton.tsx  # Article-level review request modal and active-review link
    intelligence/
      IntelligenceCockpit.tsx  # Client graph constellation, radar, and readiness simulator
    (37 root-level components)  # Badge, Breadcrumb, Toast, Pagination, ThemeToggle,
                                # KeyboardShortcuts, NotificationBell, UserAvatar,
                                # CategoryManager, TagManager, TagPicker, etc.
  lib/
    prisma.ts                 # Prisma client singleton (globalThis caching for dev)
    navigation.ts             # Shared command destinations and focused workspace route detection
    canon-atlas.ts            # Territory, dossier, story-thread, and continuity report
    canon-trails.ts           # Reader-route engine for canon, fresh, deep, repair, and starter trails
    intelligence.ts           # Command-center score, graph, radar, sections, and next-best-work report
    studio.ts                 # Studio board, database-style lanes, action queue, and JSON Canvas export
    search-response.ts        # Client-safe normalizer for internal search API response shapes
    auth.ts                   # Auth helpers: getSession, isAdmin, requireAdmin, requireRole
    api-auth.ts               # API key validation for public REST API
    config.ts                 # Environment-driven branding config
    customization.ts          # Typed self-host customization groups, env metadata, and defaults
    customization-studio.ts   # Customization Studio tabs, keyboard navigation, summaries, and viewport QA metadata
    marketplace.ts            # Versioned local marketplace registry metadata and validation
    marketplace-import.ts     # Preview-only marketplace pack import schema, examples, and safety checks
    claims.ts                 # Claim extraction, hashing, and review status helpers
    wikilinks.ts              # Wiki link resolution and backlink queries
    infobox-schema.ts         # Category-specific infobox field definitions
    templates.ts              # Article starter templates
    category-templates.ts     # Category-specific templates
    relations.ts              # Semantic link relation types
    utils.ts                  # Slug generation, date formatting, text utilities
    import.ts                 # Article import parsing utilities
    metrics.ts                # Performance metric logging
    webhooks.ts               # Event webhook dispatch
    plugins/
      types.ts                # Plugin interface definition
      registry.ts             # Plugin registry
prisma/
  schema.prisma               # Database schema (90 models — includes GlossaryTerm, ArticlePoll, PollVote, ClaimReview; Article +contentWarnings/isAbandoned/cleanupTags)
  seed.mjs                    # Category and subcategory seeder
  migrations/                 # Versioned migration history
scripts/
  import-articles.ts          # CLI for bulk article import
public/
  maps/world.webp             # Default map background image
  uploads/                    # User-uploaded files
docs/
  help.md                     # Feature guide reference
```

## Documentation Surfaces

Documentation is part of the release surface. Changes that affect behavior, UI, configuration, APIs, schema, workflows, product positioning, or contributor guidance must update the matching docs and version metadata in the same commit.

- Agent and contributor rules live in `AGENTS.md` and `CONTRIBUTING.md`.
- Product reference docs live in `README.md`, `docs/help.md`, and `docs/features.md`.
- In-app product docs live in `src/app/help/page.tsx`, `src/app/features/page.tsx`, and route-specific reference pages such as `src/app/api-docs/page.tsx`.
- Release history and planning live in `CHANGELOG.md` and `ROADMAP.md`.
- Version metadata lives in `package.json` and `package-lock.json`.

## Customization Surface

Arkivel's self-host customization contract lives in `src/lib/customization.ts`. It groups public configuration into `brand`, `style`, `features`, `limits`, `map`, and `integrations`, while `src/lib/config.ts` keeps backward-compatible flat aliases such as `config.name` and `config.mapEnabled`.

Reusable extension metadata lives in `src/lib/marketplace.ts`. Built-in style presets such as `classic-wiki` and `atlas-modern`, color themes such as `standard`, `forest`, and `ember`, layout presets, component packs, theme packs, and plugin manifests share the same versioned local registry contract: stable id, kind, version, compatibility, author, license, local source, status, screenshots, and checksums. The v1 plugin manifest contract lives in `src/lib/plugin-manifest.ts`; it declares identity, compatibility, permissions, routes, settings, widgets, hooks, jobs, storage, API scopes, webhooks, examples, validation issues, and Arkivel/plugin API compatibility metadata before any runtime loader is enabled. Preview-only pack import parsing lives in `src/lib/marketplace-import.ts` so future local installs can reuse the same schema and safety checks.

Trusted local plugin discovery lives in `src/lib/plugins/local-loader.ts`. It is disabled unless `ARKIVEL_ENABLE_TRUSTED_PLUGINS=true` and `ARKIVEL_TRUSTED_PLUGIN_DIR` is an absolute directory. The v4.80.1 loader reads one `plugin.json` per plugin subdirectory, validates it with the v1 manifest schema, reports invalid manifests through `/api/plugins`, and never imports or executes plugin code while the runtime sandbox is still being built.

Plugin permission prompts live in `src/lib/plugins/permissions.ts`, and plugin health metadata is assembled by `src/lib/plugins/registry.ts` for `/api/plugins` and `/admin/plugins`. Only admins can grant plugin permissions through enablement decisions; editors, viewers, API keys, and anonymous actors have narrower runtime defaults for future sandbox checks. Plugin enable/disable, route access, job runs, settings changes, install events, and hook failures are modeled as audit actions, with enable/disable and article render hook failures logged today.

Audit trail helpers live in `src/lib/audit.ts`, with append-only `AuditLog` rows storing actor, target, workspace, severity, success, network metadata, and JSON details. `/api/admin/audit-log` supports actor/action/target/workspace/severity/success/date filters plus JSON export with summary, standard, strict, or full redaction. Alert trigger metadata and retention defaults are published through `/api/customization` as `auditTrail` and documented in `docs/audit-trail.md`.

Plugin authoring assets live in `examples/plugins/starter-plugin/`, `examples/plugins/marketplace-listing-template.json`, and `docs/plugin-authoring.md`. The `npm run plugin:validate` CLI validates local `plugin.json` files with the same manifest helper used by the app and can list supported permissions, hooks, webhook events, schema fields, and compatibility surfaces.

Portable bundle contracts live in `src/lib/portable-bundle.ts` and are documented in `docs/portable-bundles.md`. The v1 contract defines full-site manifests for articles, revisions, categories, tags, users, settings, plugin state, maps, comments, discussions, assets, and customizations, while explicitly excluding sessions, API keys, and analytics by default. It also defines SHA-256 checksum fields, source instance metadata, created-at, export scope, privacy filters, and dry-run import reports for conflicts, missing assets, unsupported schemas, duplicate slugs, and permission gaps.

Export hardening helpers live in `src/lib/export-hardening.ts`. Markdown, HTML, JSON, and ZIP export endpoints attach checksum and manifest headers, record `ExportHistory` rows when the database is available, and expose recent/downloadable reports through `/api/export/history`. The shared contract covers Markdown, HTML, JSON, CSV, ZIP, MediaWiki, and database-shaped exports, with progress stages for queued, collecting, rendering, packaging, completed, failed, cancelled, and retrying flows.

Import rehearsal contracts live in `src/lib/import-rehearsal.ts` and `/api/import/rehearsal`. Rehearsals are no-write previews that wrap the portable dry-run report shape, group conflicts for duplicate slugs, categories, tags, users, assets, revisions, unsupported schemas, and permission gaps, and require rollback plans before any future import writes.

Moderation contracts live in `src/lib/moderation.ts` and are exposed through `/api/customization`. Discussion rows carry public/reviewer visibility, report counts/reasons, moderation status, moderator id, and moderation timestamps; public discussion reads only return visible public comments. Edit suggestions support accept, reject, comment, assign, and convert-to-task review actions, with spam score, moderation state, assignee, reviewer comment, task URL, and request IP metadata for public contribution workflows.

Workspace contracts live in `src/lib/workspaces.ts`; the durable database entity is the existing `Wiki` model. v4.82 adds visibility, default role, navigation mode, bootstrap profile, marketplace selections, membership status, and `WorkspaceInvitation` records. Articles already carry `wikiId`; core article, search, category, and tag APIs accept `workspaceId`, `wikiId`, or `X-Arkivel-Workspace`, with `includeGlobal=1` reserved for migration windows while legacy unscoped rows are backfilled.

Role template contracts live in `src/lib/role-templates.ts` and are exposed through `/api/customization`. They define personal admin, team owner, docs maintainer, editor, reviewer, contributor, viewer, and public reader templates, with a permission matrix for pages, APIs, exports, webhooks, plugins, customization, and marketplace actions. API-key actors are allowed to use API surfaces according to their user role but cannot administer plugins, customization, or marketplace settings.

Collaboration controls live in `src/lib/collaboration-controls.ts` and are exposed through `/api/customization`. They define workspace-aware policy for co-authors, edit locks, review assignments, comments, mentions, notifications, workspace activity digests, and contribution summaries. Anonymous RSS, Atom, sitemap, and `/api/sitemap` only include legacy unscoped published articles or public workspace articles; API v1 callers can read unscoped articles plus public, owned, or actively-membered workspace content.

Editorial governance contracts live in `src/lib/editorial-governance.ts` and are exposed through `/api/customization`. Review requests carry due dates, required reviewer ids, approval thresholds, change-request cycle counts, and decision notes. Claim reviews carry evidence and expiration metadata for disputed/needs-source/stale/rejected/unreviewed queues. Verification stamps include reviewer, evidence, and expiration metadata, and `/api/admin/editorial-governance/summary` aggregates release blockers, editorial risk, claim queues, verification renewals, and owner gaps.

Marketplace contribution guidance lives in `docs/marketplace-contributions.md`, with sample folders under `examples/marketplace/` and GitHub issue templates for submissions and pack bugs. These artifacts define the author-facing review path for pack naming, semantic versioning, screenshots, compatibility notes, tests, and security/accessibility/performance checks.

Component slot contracts live in `src/lib/component-slots.ts` and are exposed through `/api/customization`. They define the stable component-pack target surface for article cards, article headers, metadata panels, infobox layouts, dashboard widgets, homepage sections, search results, editor panels, space navigation, and admin summaries. Marketplace component packs are validated against those slot ids before they can be treated as compatible.

The built-in component-pack registry in `src/lib/marketplace.ts` currently publishes default wiki, docs portal, team knowledge base, worldbuilding atlas, and research notebook packs. Each pack maps named component affordances to stable slots and declares a recommended layout, which lets later runtime loading work bind real components without changing the public marketplace contract.

Layout composition hooks live in `src/lib/layout-composition.ts` and are attached to layout presets in the marketplace registry. The customization API exposes shell density, homepage module order, article column structure, right-rail behavior, dashboard modules, category landing behavior, and scoped CSS/data-attribute hooks for each built-in layout, while Customization Studio renders them as preview-only metadata.

Persisted space customization lives in `SpaceCustomization` and `ArticleCustomizationOverride` records, with validation and inheritance helpers in `src/lib/space-customization.ts`. Public reads from `/api/categories/:id/customization` and `/api/articles/:id/customization` resolve global environment defaults, parent categories, the current category, and article overrides into a redacted shape that hides `privateDraftConfig`; admin-only `PUT` requests validate style, color theme, layout, component pack, template pack, navigation, and metadata schema values before saving.

The first admin UI for this contract lives in `/admin/categories`. It edits category-space overrides, shows inherited effective values and source markers, offers reset-to-parent/global controls, warns about obvious global-feature conflicts, and previews article-list, metadata/navigation, theme/layout, and responsive QA outcomes before later dedicated space-governance screens arrive.

Space template contracts live in `src/lib/space-templates.ts` and are exposed through `/api/space-templates`, `/space-templates/:id`, and `/api/customization`. Templates are preview-safe JSON manifests for category trees, starter article templates, sample metadata, default tags, infobox fields, navigation, dashboards, layout ids, component pack ids, and recommended packs. The v4.91.0 registry ships personal wiki, product docs, team handbook, worldbuilding bible, research notebook, reading archive, project knowledge base, and public documentation templates; imports are validated and summarized before any future apply flow can write categories or articles.

Space governance hooks live in `SpaceGovernance` records and `src/lib/space-governance.ts`. Governance resolves from global defaults through parent categories to the current category, covering owner, reviewer, default visibility, review cadence, stale-page threshold, and required health signals. Article pages render inherited governance badges, `/admin` summarizes space health widgets, and `/api/categories/:id/governance` writes are admin-only and audit logged.

Component-pack developer tooling lives in `scripts/generate-component-pack.ts`, `scripts/validate-component-pack.ts`, `examples/marketplace/component-pack`, `docs/component-pack-preview-harness.md`, and `src/lib/component-pack-fixtures.ts`. The tooling scaffolds preview-safe packs, validates import-preview manifests and slot ids, and gives authors typed article, category, dashboard, marketplace, and editor fixture data before runtime pack loading exists.

The public `/api/customization` endpoint exposes:

- Current grouped customization values.
- Supported `NEXT_PUBLIC_*` environment variables with defaults and descriptions.
- Reusable UI component catalog metadata from `src/components/ui/catalog.ts`.
- Built-in style presets, color themes, layout presets, component packs, plugin manifest schema/examples/compatibility matrix, trusted local plugin loader contract, plugin manifests, theme pack schemas, persisted space customization contracts, marketplace registry metadata, import-preview examples, validation summaries, migration guidance, and marketplace items.
- Theme hook locations for CSS-variable and shared-class customization.

Use this contract before adding new self-host flags, public branding controls, style presets, color themes, layouts, plugin-facing metadata, marketplace entries, per-space customization metadata, or theme hooks. `/admin/customization` is env-first for global config and reads the same persisted space customization contract used by the category/article APIs. The admin studio consumes the public manifest, lets admins draft brand/copy/logo/feature/appearance values in the browser, saves preview-only local drafts through `src/lib/customization-drafts.ts`, checks diagnostics with `src/lib/customization-diagnostics.ts`, shares tab metadata, responsive QA checkpoints, and screen-reader summaries through `src/lib/customization-studio.ts`, previews key product surfaces, and exports deployment-ready env formats for the self-host runtime. `/admin/marketplace` consumes the same local registry, reports registry version, schema version, catalog source, item totals, kind coverage, checksums, licenses, validation issues, status badges, facet filters, and item details, and previews pasted/uploaded pack JSON without fetching remote code, executing payloads, installing files, or changing runtime config.

## Database Models

### Core Content
- **Article** — Central content model. Stores HTML from Tiptap, optional raw Markdown, excerpt, cover image, infobox data (JSON), status (draft/review/published), sortOrder, isPinned, isFeatured. Supports redirects and disambiguation pages.
- **ArticleCustomizationOverride** — Optional per-article appearance/navigation/template/metadata override that wins over global and category space customization.
- **ArticleRevision** — Immutable snapshots created automatically on every edit. Stores content, title, and infobox state before changes. Powers history timeline and diff viewer. Tracks userId for attribution.
- **Category** — Hierarchical with self-referencing `parentId`. Six root categories with subcategories. Drives infobox field schemas. Ordered by `sortOrder`.
- **SpaceGovernance** — Optional per-category governance record for owner, reviewer, visibility, review cadence, content health preferences, and health widget signals.
- **SpaceCustomization** — Optional per-category customization record for style, color theme, layout, component pack, template pack, navigation mode, metadata schema, and private draft config.
- **Tag** — Hierarchical with self-referencing `parentId`. Many-to-many with articles via `ArticleTag` join table.
- **ArticleTranslation** — Multi-language article content (locale, title, content).
- **Discussion** — Per-article comment threads with optional user attribution.

### Users & Auth
- **User** — Multi-user accounts (username, email, passwordHash, role: admin/editor/viewer).
- **Session** — Auth sessions with token and expiry, linked to User.

### Relationships & Links
- **ArticleLink** — Semantic wiki links with typed relations (related-to, is-part-of, etc.). Defined in `src/lib/relations.ts`.

### Maps
- **MapMarker** — Coordinates + optional article link, grouped by `mapId`, with zoom levels. Supports polygon areas (JSON).
- **MapConfig** — Multi-map system configuration.
- **MapLayer** — Map layer definitions for toggling.
- **MapDetailLevel** — Zoom-dependent detail levels.

### API & Integration
- **ApiKey** — Public API authentication keys, linked to User.
- **Webhook** — Event webhook endpoints for article create/update/delete.
- **WebhookDelivery** — Webhook delivery logging with status tracking.

### Polls
- **ArticlePoll** — Poll attached to an article with a question and string[] options. Can be closed to prevent further voting.
- **PollVote** — One vote per session per poll (unique on `pollId + sessionId`). Stores `optionIndex`.

### User Features
- **Watchlist** — User-article watch pairs for change notifications.
- **Notification** — Edit/reply/mention notifications per user.
- **ReviewRequest** — Article review workflow record with author, optional reviewer, status (`pending`, `in_review`, `approved`, `changes_requested`, `rejected`), request message, and comments.
- **ReviewComment** — Comment thread on a review request, with optional selector data for future inline review anchors.
- **ClaimReview** — Persistent review decision for an editor-marked claim, keyed by article and claim hash. Stores claim text, status (`unreviewed`, `approved`, `needs_source`, `disputed`, `rejected`), reviewer note, and reviewer attribution.

### System
- **PluginState** — Plugin enable/disable configuration.
- **MetricLog** — Performance metric logging.
- **CollaborationSession** — Real-time collaborative editing (Yjs document storage).

## Key Patterns

### Configuration
All branding is driven by `NEXT_PUBLIC_*` environment variables read through `src/lib/config.ts`. Defaults produce a generic wiki; personal branding is set via environment variables. Brand image paths are configurable through `NEXT_PUBLIC_ARKIVEL_LOGO`, `NEXT_PUBLIC_ARKIVEL_LOGO_MARK`, and `NEXT_PUBLIC_ARKIVEL_APP_ICON`; defaults live in `public/brand/`. The default SVG mark is rendered inline by `BrandMark` so theme variables can recolor it, while custom `NEXT_PUBLIC_ARKIVEL_LOGO_MARK` paths still render as image assets. Metadata resolves relative image paths against `NEXT_PUBLIC_BASE_URL`. The visible app version is read from `package.json` and exposed at build time through `next.config.ts` so sidebar and health-check version text follow release bumps.

### Authentication
Dual auth system. **Legacy:** single admin password via `ADMIN_SECRET` env var with cookie-based `admin_token`. **Multi-user:** bcrypt-hashed passwords in `User` table with session tokens. `getSession()` returns the current user, `isAdmin()` checks both paths, `requireRole(user, role)` for granular permissions. Roles: admin, editor, viewer.

### Review Requests
Editors can request review from the article action rail. The request can be left in the shared queue or assigned to an editor/admin reviewer. Active requests are deduplicated per article, drafts move into `review`, approvals publish the article, and change requests or rejections return reviewed articles to `draft`. `/reviews` lists queues, `/reviews/[id]` hosts the draft preview, comments, assignment, approval, change-request, rejection, and resubmission actions. Review API mutations create notifications for reviewers/authors and activity events for auditability.

### Claim Review Mode
Claims marked in the editor as `certain`, `probable`, or `disputed` are extracted from article HTML by `extractClaims()` in `src/lib/claims.ts`. The shared helper normalizes text and creates a deterministic claim hash so the article claims panel and `/api/articles/[id]/claim-reviews` address the same claim without embedding database IDs in article HTML. Editors and admins can approve, mark as needing a source, dispute, reject, or annotate each claim. Mutations upsert `ClaimReview`, attribute the reviewer, notify the article author, log `claim_reviewed` activity, and revalidate the article page.

### Wiki Links
Articles cross-reference using `[[Article Name]]` syntax. The custom Tiptap `WikiLink` extension renders these as `<a data-wiki-link="Title">` in the editor. At display time, `resolveWikiLinks()` queries the database to verify targets exist and marks broken links with a CSS class. `getBacklinks()` finds articles that reference a given slug.

### Editor Experience
`TiptapEditor` owns the ProseMirror extension stack, Markdown conversion, paste/drop handling, wiki-link suggestions, link bubble, feature tray orchestration, status bar, and live document telemetry. `EditorPrimitives.tsx` holds the reusable Insert, Review, Outline, and selection-action surfaces so first-party editor UI, plugin surfaces, and customization previews can target the same component names. Insert, Review, and Outline trays expose grouped rich blocks, readiness signals, outline navigation, grammar checks, and writing coach analysis only when requested. `EditorToolbar` keeps core formatting visible, moves quote/table and advanced text/knowledge/AI/claim tools behind a More disclosure, and exports contextual table controls for reuse while the selection is inside a table. `src/lib/editor-controls.ts` publishes primitive metadata, plugin command/toolbar/slash/side-panel extension points, shared block templates, and shortcut scopes through `/api/customization`. `CollaborativeEditor` wraps the same editor and forwards every update to the article edit form so local draft autosave and optional Yjs sync stay in step; `src/lib/collaboration-ux.ts` publishes connection states, presence-name requirements, conflict/reconnect copy, inline review planning, notification routing, mobile QA, and accessibility checkpoints for live collaboration surfaces.

`src/lib/editor-reliability.ts` defines the v4.85.0 reliability contract for collaborative sync, draft recovery, offline warnings, autosave repair, paste cleanup, embed handling, editor health diagnostics, and large-document fixtures. `/api/articles/:id/snapshots` supports snapshot read, compare, restore, and discard flows; restore preserves the current article as a new "Before restore" snapshot before applying the selected version.

`src/lib/sync-manifests.ts` defines the v4.93.0 preview-safe sync contract for moving spaces between Arkivel installs. `GET /api/sync-manifests` publishes source/target manifest fields, per-section checksums, visibility rules, dry-run reports for categories, articles, tags, assets, revisions, comments, and customizations, signed snapshot plans for public read replicas and private mirrors, and the release gate that keeps live network federation outside stable scope.

`src/lib/external-references.ts` defines the v4.93.1 cross-instance reference contract for external articles, spaces, sources, and imported snapshots. `GET /api/external-references` publishes provenance labels, broken-reference diagnostics, and public-index planning that allows only explicit public-indexable references while omitting authenticated, private, and sensitive metadata.

`src/lib/archive-mirrors.ts` defines the v4.93.2 archive and mirror workflow contract. `GET /api/archive-mirrors` publishes read-only archive snapshot planning, private mirror setup checklists, selected-space export/import steps, repeated-sync conflict strategies, and the release decision checkpoint for whether federation can graduate before v5.

`src/lib/mobile-polish.ts` defines the v4.94.0 mobile polish contract. `GET /api/mobile-polish` publishes responsive QA checkpoints for phone, tablet, laptop, and wide desktop viewports across mobile navigation, article actions, editor trays, admin panels, marketplace pages, and customization previews. Shared CSS guardrails in `src/app/globals.css` enforce touch-target minimums, overflow wrapping, dialog bounds, and phone-width horizontal overflow protection.

`src/lib/desktop-research.ts` defines the v4.94.1 desktop research contract. `GET /api/desktop-research` compares Electron, Tauri, browser PWA, and Docker Desktop options; records local deployment recipes, filesystem import/export UX, and the decision that desktop packaging remains research-only before v5.

`src/lib/accessibility-finish.ts` defines the v4.94.2 accessibility finish contract. `GET /api/accessibility` publishes release-blocking audits for keyboard access, focus management, dialogs, dropdowns, table controls, editor controls, admin forms, marketplace filters, and customization previews, plus screen-reader summaries for graph, atlas, dashboard, marketplace, and editor widgets.

`src/lib/migration-readiness.ts` defines the v4.95.0 migration readiness contract. `GET /api/migration-readiness` publishes blocking dry-run phases, backup prompts, schema compatibility reports, data-integrity checks, restore validation, representative v4 upgrade paths, Prisma freeze decisions, and migration test coverage for customization, marketplace, plugins, spaces, and templates.

`src/lib/backup-restore.ts` defines the v4.95.1 backup and restore contract. `GET /api/backup-restore` publishes admin backup wizard sections for database, assets, env vars, marketplace packs, plugin manifests, and customization settings; restore rehearsal manifest validation; conflict reports; scheduled backup planning; storage notes; and disaster-recovery drill guidance.

`src/lib/upgrade-assistant.ts` defines the v4.95.2 upgrade assistant contract. `GET /api/upgrade-assistant` publishes the v5 readiness checklist, pre-upgrade diagnostics, post-upgrade smoke checks, compatibility warning types for env vars/APIs/plugin permissions/pack schemas, release-note links, and upgrade planning guidance.

`src/lib/test-quality-gates.ts` defines the v4.96.0 test quality gates contract. `GET /api/test-quality` publishes expanded test surfaces, stable fixture planning, CI matrix dimensions, known-warning policy, and release-manager quality dashboard sections.

`src/lib/e2e-smoke-suite.ts` defines the v4.96.1 end-to-end smoke suite contract. `GET /api/e2e-smoke-suite` publishes required product smoke flows, responsive smoke routes, fixture seed script metadata, and Playwright failure artifact settings. `e2e/smoke-suite.spec.ts` exercises the smoke routes, and `scripts/seed-smoke-fixtures.mjs` seeds repeatable database fixtures.

`src/lib/release-gate-automation.ts` defines the v4.96.2 release gate automation contract. `GET /api/release-gates` publishes release candidate gates, docs sync planning, release checklist metadata, known issue labels, and blocker labels. `scripts/verify-docs-sync.mjs` verifies package, changelog, roadmap, docs, in-app docs, and `/api/customization` alignment.

`src/lib/documentation-onboarding.ts` defines the v4.97.0 documentation onboarding contract. `GET /api/documentation-onboarding` publishes maintainer doc topics, setup paths, troubleshooting topics, docs IA review metadata, and practical docs link-test coverage for new maintainers.

`src/lib/in-app-onboarding.ts` defines the v4.97.1 in-app onboarding contract. `GET /api/in-app-onboarding` publishes the first-run setup checklist, guided admin setup topics, collapsed contextual help panel plan, sample content pack metadata, and screenshot checkpoints for demo installs.

`src/lib/example-site-recipes.ts` defines the v4.97.2 example site recipe contract. `GET /api/example-site-recipes` publishes setup recipes, environment snippets, screenshot targets, marketplace and template recommendations, migration stories, and v5 readiness checks for self-host admins.

`src/lib/feature-freeze.ts` defines the v4.98.0 feature-freeze contract. `GET /api/release-freeze` publishes allowed freeze change classes, full rehearsal areas, known-issue blocker labels, v5 gate ownership, and release-note draft sections for release managers.

`src/lib/release-candidate-one.ts` defines the v4.98.1 release candidate one contract. `GET /api/release-candidate-one` publishes required RC1 gates, deployment-path validation, starter/pack/import/export validation areas, review checklists, and feedback-template metadata.

`src/lib/final-release-gates.ts` defines the v5.0.0 final release gate contract. `GET /api/final-release-gates` publishes RC fix closure, final beta freeze contracts, gate evidence, compatibility targets, correction windows, and stable-release gate status.

### Content Storage
Articles store `content` (HTML from Tiptap) and optionally `contentRaw` (Markdown for export). HTML is the canonical format displayed to users.

### Public API v1 Contract
`src/lib/public-api-v1.ts` is the pre-v5 public API contract source for articles, categories, tags, revisions, search, customization, marketplace, plugins, webhooks, exports, and health. It defines stable endpoint metadata, pagination/filter/sort contracts, error shape, rate-limit headers, fixture responses, and OpenAPI generation. `GET /api/v1/contract`, `GET /api/v1/openapi.json`, and `publicApiV1` in `/api/customization` expose the same contract; update `docs/api-v1-migration.md` and in-app API docs when changing v1 behavior.

`src/lib/sdk-types.ts` layers SDK-ready type names, API-key scopes, generated client snippets, and sample script metadata on top of the frozen v1 contract. `GET /api/v1/sdk` and `sdkTypes` in `/api/customization` expose this metadata for generated clients and docs.

### Webhook Reliability
`src/lib/webhook-reliability.ts` defines the timestamped HMAC signature contract, replay window, retry delays, delivery headers, event schemas, test sender, redelivery endpoint, and failure-alert metadata. `dispatchWebhook()` signs `timestamp.rawBody`, retries transient failures, skips unsupported events, and logs delivery metadata in `WebhookDelivery`. Admins can queue test events with `POST /api/webhooks/test` and redeliver historical attempts with `POST /api/webhooks/deliveries/:id/redeliver`.

### Operations Dashboard
`src/lib/operations-dashboard.ts` defines the v4.87.0 operations dashboard contract, service/queue/metric/alert shapes, diagnostic-bundle redactions, and browser-local acknowledgement metadata. `GET /api/admin/operations` aggregates database, Prisma, storage, AI provider, webhook, search, background-job, import, export, plugin, metric, and slow-page signals for `/admin/operations`; `?bundle=1` returns the same admin-only report as a redacted support bundle.

### Maintenance Tooling
`src/lib/maintenance-tooling.ts` defines maintenance mode keys, read-only mode keys, background task pause state, safe-upgrade checks, cleanup task metadata, and runbook links. `GET /api/admin/maintenance/report` aggregates database health, backup readiness, failed export/webhook blockers, stale sessions, orphaned assets, and cleanup queues for `/admin/maintenance`; `POST /api/admin/maintenance/report` defaults cleanup tasks to dry-run and requires `dryRun: false` for mutation.

### Observability
`src/lib/observability.ts` defines structured log categories, metric types, privacy controls, metadata redaction, and event-feed contracts. `POST /api/observability/metrics` records supported latency/autosave/search/export/import/webhook metrics into `MetricLog`; `GET/POST /api/admin/observability` exposes an admin event feed and privacy controls for `/admin/observability`.

### Performance Budgets
`src/lib/performance-budgets.ts` defines route p95, interaction, and bundle-size budgets for article pages, graph, Studio, Atlas, Trails, search, editor startup, admin dashboards, and marketplace. `GET /api/admin/performance` maps recent `MetricLog` samples to those budgets, publishes large-wiki fixture profiles, and lists slow-query diagnostics for Prisma review; `/admin/performance` renders the report for operators.

### Cache Strategy
`src/lib/cache-strategy.ts` defines invalidation rules for articles, categories, tags, feeds, sitemap, customization, marketplace metadata, plugin manifests, search, and dashboards. Article/category/tag write APIs call `invalidateCacheForEvent()` after successful creates. `GET/POST /api/admin/cache` exposes cache status, manual invalidation, stale warnings, and CDN/Vercel/Docker/reverse-proxy recipes for `/admin/cache`.

`src/lib/offline-pwa.ts` defines the installable-app and offline-reading contract for service-worker cache rules, article/list fallbacks, stale response headers, retry queue eligibility, mobile startup QA, offline-safe draft warnings, and browser-local privacy limits. `/sw.js` registers static, page, and read-only API caches while bypassing admin/auth/export/upload/webhook/observability/plugin routes; `/api/offline/contract` and `/api/customization` expose the public metadata.

`src/lib/security-review.ts` defines the v4.89.0 security review contract for auth, sessions, API keys, CSRF-sensitive writes, webhooks, imports, uploads, plugin manifests, marketplace packs, admin routes, and exports. `middleware.ts` applies conservative browser headers and a report-only CSP; `/api/security/review` publishes the review checklist, abuse-case gates, dependency/supply-chain checklist, and pre-v5 threat-model draft.

`src/lib/privacy-controls.ts` defines the v4.89.1 privacy controls contract for spaces, indexing, feeds, exports, analytics, AI features, webhooks, user profiles, retention settings, user data lifecycle planning, and integration warnings. `/api/privacy/controls` and `/api/customization` publish the contract for personal, team, and public deployment guidance.

`src/lib/marketplace-security.ts` defines the v4.89.2 marketplace/plugin security contract for blocked permissions, blocked hook prefixes, dangerous plugin capability warnings, local-only install guidance, provenance requirements, and checksum verification planning. `src/lib/marketplace-import.ts` reuses this contract to reject unsafe hooks and excessive permission sets in preview before future install flows exist.

`src/lib/marketplace-beta.ts` defines the v4.90.0 marketplace beta launch contract for landing metrics, featured/recent/recommended packs, collections, compatibility badges, search facets, install-intent steps, and beta limitations. `/api/marketplace/beta` publishes this report from the local registry without remote fetches or automatic installs.

`src/lib/marketplace-lifecycle.ts` defines the v4.90.1 pack lifecycle contract for draft, previewed, installed-local, enabled, disabled, deprecated, incompatible, blocked, and removed states. `/api/marketplace/lifecycle` publishes allowed transitions, local inventory, health checks, preview media validation, changelog/update metadata, compatibility warnings, and rollback guidance for preview-safe marketplace operations.

`src/lib/marketplace-authoring.ts` defines the v4.90.2 marketplace authoring contract for local validation, metadata previews, screenshot checks, license checks, docs completeness, README generation, author quality checklists, compatibility matrix rows, and submission templates. `/api/marketplace/authoring` keeps authoring workflows preview-safe and local-first.

`src/lib/template-marketplace.ts` defines the v4.91.1 template marketplace contract for first-class `template-pack` listings, included schema, category tree previews, article template previews, compatibility notes, diff-before-apply metadata, merge options, and export-from-space fixture output. `/api/marketplace/templates` publishes the preview-safe report.

`src/lib/domain-workflows.ts` defines the v4.91.2 domain workflow contract for docs portals, team handbooks, worldbuilding bibles, research notebooks, and personal wikis. `/api/space-workflows` publishes workflow controls, steps, starter template links, and release gates for future dashboard/product flows.

`src/lib/assistant-packs.ts` defines the v4.92 assistant pack contract for provider, model, privacy, cost, retention, prompt scope, permissions, tools, prompts, context sources, output types, limits, safety notes, per-space availability, prompt/context previews, usage logs, cost estimates, and graceful fallback metadata. `/api/assistant-packs`, `/admin/assistants`, and `/api/customization` expose disabled-by-default built-in packs for drafting, summarization, search, claim extraction, taxonomy, alt-text, import cleanup, and review.

`src/lib/assistant-governance.ts` defines the v4.92.2 responsible AI contract for privacy warnings, human-review requirements, citation prompts, confidence metadata, AI audit actions, private-space and sensitive-article opt-outs, and the release gate that AI must remain optional and non-blocking. `/api/assistant-packs/governance` publishes the governance report.
Standard HTML tables remain native table markup from editor through display; global content styles collapse borders, zero spacing, and wrap cell content so article and presentation views preserve a single merged grid.

### Revision System
Every PUT to an article endpoint first snapshots the current state into `ArticleRevision`, then applies the update. Revisions track the editing user for attribution.

### Footnotes
Custom Tiptap `FootnoteRef` node extension. Stored as `<sup data-footnote="text">` in HTML. Auto-numbered via CSS counters. Footnote section appended at display time by `appendFootnoteSection()`.

### Glossary
`GlossaryTerm` model stores terms, definitions, and aliases. `resolveGlossaryTerms()` in `src/lib/glossary.ts` injects `data-glossary-term` / `data-glossary-def` attributes into article HTML server-side. `GlossaryTooltipLayer` client component uses document-level event delegation to show hover cards. Admin CRUD at `/admin/glossary`, public browse at `/glossary`.

### Category-Specific Infoboxes
Each root category defines a field schema in `src/lib/infobox-schema.ts`. Subcategories inherit their parent's schema via a parent chain walk. Fields support types: text, textarea, number, wikilink, and list. Infobox data is stored as JSON on the Article model.

### Theming
CSS variables in `src/app/globals.css` under a `@theme` block. Dark mode applies overrides via `html[data-theme="dark"]`. Uses `@theme` (not `@theme inline`) so CSS variable overrides work correctly with Tailwind.

### Responsive App Shell
`src/app/layout.tsx` composes the global header, `LayoutShell`, `Sidebar`, `DocumentTitle`, and `MobileNavigation`. Desktop and tablet layouts keep a persistent top-left three-line main-menu button that collapses or expands the simplified dockable sidebar, with `LayoutShell` applying the persisted open/closed state, left/right side preference, and matching content borders. The main content shell is full-width by default so operational pages, Studio, and dense grids do not inherit an artificial right-side gutter; individual page components own any narrower reading width they need. Phone layouts use the same top-left button to open the sidebar overlay and a safe-area-aware bottom navigation for Home, Search, Create, and Recent.

Browser titles use the `Arkivel - Page Name` pattern. Root metadata provides the server-side title template, while `DocumentTitle` watches the current page heading on the client and applies the same format to routes that do not export metadata yet.

Focused workspace routes (`/ask`, `/graph`, `/split`, `/map`, and `/present/*`) hide the bottom navigation so full-height canvases and chat/workspace composers are not covered. They keep the same top-left mobile menu button. Closed mobile sidebars are translated, hidden, and pointer-inert so off-canvas links cannot be hit-tested or reported as covered controls.

Responsive shell changes should be verified across phone, tablet, laptop, and wide desktop widths. At minimum, check for document horizontal overflow, clipped labels/controls, and fixed elements covering interactive targets.

### Search
Relevance-ranked full-text search. Multi-word queries use AND logic. `src/lib/search-relevance.ts` defines the v2 ranking contract for exact title, phrase, alias/redirect, word coverage, freshness, review status, and verification signals. `/api/search` returns additive `facets` and optional `score`/`searchExplain` fields when an admin passes `explain=1`.

`/api/search` returns an object response containing `results`, optional `semanticResults`, and optional `suggestions`. Client surfaces must consume it through `src/lib/search-response.ts` so header instant search, the search page, command palette article lookup, wiki-link autocomplete, split view pickers, and edit fallbacks stay aligned if the API shape evolves. Semantic search results are displayed as a distinct group on the search page when enabled.

`src/lib/search-api.ts` publishes the stable v4.84.2 search API contract for plugins, widgets, dashboards, external tools, and mobile clients. `/api/search/contract` returns typed result shapes for articles, categories, tags, discussions, revisions, and marketplace items, plus query analytics privacy/retention metadata and planned webhook events for saved search hits and important content changes.

### Map
Disabled by default (`NEXT_PUBLIC_MAP_ENABLED=true` to enable). Uses Leaflet with `CRS.Simple` for pixel coordinates on a custom image. Dynamically imported to avoid SSR issues. Supports multiple maps, layers, and zoom-dependent detail levels.

### Semantic Links
`ArticleLink` model with typed relations (related-to, is-part-of, see-also, etc.). Defined in `src/lib/relations.ts`. Displayed via `SemanticRelations` component. Visualized in the article graph.

### Graph
D3 force-directed graph at `/graph`. API at `/api/graph` returns nodes/edges from wiki links and `ArticleLink` table. Supports BFS subgraph via `?center=slug&depth=N`.

### Arkivel Studio
`src/lib/studio.ts` builds `/studio`, `/api/studio`, and `/api/studio/canvas` from live article content, wiki links, semantic relations, revision counts, review pressure, taxonomy coverage, engagement signals, and freshness. It emits a fixed-coordinate command board, database-style lanes for review/stubs/orphans/taxonomy/stale work, next Studio moves, and a JSON Canvas export compatible with visual knowledge workflows. Empty or unavailable local databases fall back to a starter board that points users toward creating articles, categories, links, and canvases.

### Discovery Engines
`src/lib/discovery-engines.ts` builds the v4.84.1 discovery contract for duplicate pages, unresolved questions, canon conflicts, glossary gaps, orphan topics, topic clusters, continue-reading entries, admin actions, and dashboard widgets. `/api/discovery` returns the live report, while `/api/customization` publishes the `discoveryEngines` contract for clients and future widgets.

### Canon Atlas
`src/lib/canon-atlas.ts` builds `/atlas` and `/api/atlas` from live article, category, tag, revision, engagement, excerpt, infobox, and wiki-link metadata. It projects categories into atlas territories, scores top articles as map signals, derives story threads from real wiki links, selects a flagship dossier, and exposes continuity pressure around stubs, uncategorized pages, missing tags, missing outgoing links, excerpts, and infoboxes. Empty local databases fall back to starter territories and starter signal routes so the page remains visually complete without pretending published article data exists.

### Canon Trails
`src/lib/canon-trails.ts` builds `/trails` and `/api/trails` as a reader-facing route engine rather than an operations dashboard. It scores published articles from outgoing wiki links, backlinks, categories, word depth, update recency, revision count, discussions, reads, page views, reactions, bookmarks, pinned state, and featured state. The report emits canon, fresh, deep, and repair routes with direct article links, reading estimates, stop reasons, and summary counts. Empty local databases fall back to a starter route that points users toward creating the first article, category, and wiki link.

### Knowledge Command Center
`src/lib/intelligence.ts` builds the `/intelligence` page and `/api/intelligence` feed from live article, category, tag, revision, read, view, discussion, translation, and cleanup metadata. It derives 20 operational engines covering readiness, velocity, editorial pressure, stale content, graph health, broken links, stubs, longform candidates, taxonomy gaps, featured canon, infobox coverage, translation reach, conversation, reader demand, verification debt, and cleanup flags. It also emits a top-article constellation from real wiki-link edges, a readiness radar across graph/structure/freshness/trust/audience/momentum axes, and pressure counts used by the client-side impact simulator. Database failures fall back to an empty report so local shell verification remains usable without a seeded database.

### Feeds & API
RSS at `/feed.xml`, Atom at `/feed/atom`. Public REST API at `/api/v1/` with API key auth (`X-API-Key` header). Webhooks dispatched on article events. API docs at `/api-docs`.

### Plugins
Lightweight plugin system. Interface in `src/lib/plugins/types.ts`, registry in `src/lib/plugins/registry.ts`. Plugin state stored in `PluginState` table. Managed via `/admin/plugins`.

## API Routes

### Articles
| Route | Methods | Description |
|-------|---------|-------------|
| `/api/articles` | GET, POST | List/create articles |
| `/api/articles/[id]` | GET, PUT, DELETE | Single article CRUD |
| `/api/articles/[id]/backlinks` | GET | Articles linking to this one |
| `/api/articles/[id]/discussions` | GET, POST, DELETE | Article comments |
| `/api/articles/[id]/export` | GET | Export article as Markdown/HTML |
| `/api/articles/[id]/links` | GET, POST, DELETE | Semantic article links |
| `/api/articles/[id]/rating` | GET, POST | Article star ratings (avg, count, own) |
| `/api/articles/[id]/todos` | GET, POST | Article todo checklist items |
| `/api/articles/[id]/todos/[todoId]` | PATCH, DELETE | Update/delete a single todo |
| `/api/articles/hot` | GET | Hot articles by page views in last N days |
| `/api/articles/[id]/related` | GET | Related articles by category/tags |
| `/api/articles/[id]/revisions` | GET | Revision history |
| `/api/articles/[id]/status` | PATCH | Update article status |
| `/api/articles/[id]/translations` | GET, POST, PUT | Article translations |
| `/api/articles/[id]/views` | POST | Track article views |
| `/api/articles/[id]/word-count` | GET | Word count and reading time |
| `/api/articles/[id]/share-token` | POST, DELETE | Generate/revoke draft share token |
| `/api/articles/[id]/verify` | POST | Stamp lastVerifiedAt on an article |
| `/api/articles/[id]/snapshots` | GET, POST, DELETE | Named manual article snapshots |
| `/api/articles/[id]/co-authors` | GET, POST, DELETE | Article co-author management |
| `/api/articles/[id]/flags` | GET, PUT | Article flag labels |
| `/api/articles/[id]/revisions/export` | GET | Download revision history as CSV |
| `/api/articles/[id]/revisions/[revId]/restore` | POST | Restore article to a prior revision |
| `/api/articles/[id]/lock` | GET, POST, DELETE | Acquire/refresh/release editor lock |
| `/api/activity/heatmap` | GET | Daily edit counts for past 52 weeks |
| `/api/stats` | GET | Aggregate wiki statistics |
| `/api/tags/[id]/synonyms` | GET, POST, DELETE | Tag alias management |
| `/api/articles/batch` | PUT, DELETE | Bulk operations |
| `/api/articles/dead-links` | GET | Articles with broken wiki links |
| `/api/articles/import` | POST | Import articles from files |
| `/api/articles/orphans` | GET | Articles with no incoming links |
| `/api/articles/recent` | GET | Recently modified articles |
| `/api/articles/reorder` | PUT | Reorder articles within category |
| `/api/articles/similar` | GET | Find similar titles |
| `/api/articles/titles` | GET | Lightweight title list |

### Other Resources
| Route | Methods | Description |
|-------|---------|-------------|
| `/api/studio` | GET | Arkivel Studio summary, board nodes, graph edges, base views, and action queue |
| `/api/studio/canvas` | GET | JSON Canvas export of the generated Studio board |
| `/api/atlas` | GET | Canon Atlas territories, article signals, story threads, dossier, continuity pressure, and next moves |
| `/api/trails` | GET | Canon Trails guided routes, stop reasons, reading estimates, word totals, and link totals |
| `/api/intelligence` | GET | Knowledge Command Center score, graph constellation, radar axes, pressure model, 20 engines, and action queue |
| `/api/auth/*` | POST | Login, logout, register, check |
| `/api/categories` | GET, POST | List/create categories |
| `/api/categories/[id]` | GET, PUT, DELETE | Category CRUD |
| `/api/categories/tree` | GET | Full category tree |
| `/api/tags` | GET, POST | List/create tags |
| `/api/tags/[id]` | GET, PUT, DELETE | Tag CRUD |
| `/api/tags/popular` | GET | Most-used tags |
| `/api/search` | GET | Full-text search |
| `/api/graph` | GET | Knowledge graph nodes/edges |
| `/api/map-markers` | GET, POST | List/create map markers |
| `/api/map-markers/[id]` | PUT, DELETE | Update/delete markers |
| `/api/maps/[mapId]` | GET, PUT, DELETE | Map configuration |
| `/api/users` | GET | User list |
| `/api/articles/[id]/claim-reviews` | GET, PATCH | Claim review status list and editor/admin claim decisions |
| `/api/reviewers` | GET | Editor/admin reviewer candidates |
| `/api/reviews` | GET, POST | List or create review requests |
| `/api/reviews/[id]` | GET, PUT, DELETE | Review detail, assignment, decisions, and deletion |
| `/api/reviews/[id]/comments` | GET, POST | Review request comments |
| `/api/upload` | POST | Upload images to Vercel Blob |
| `/api/export` | GET | Batch wiki export |
| `/api/export/zip` | GET | Bulk ZIP export — all articles as Markdown files in category subfolders |
| `/api/admin/search-analytics` | GET | Search query analytics (top queries, zero-result, daily volume) |
| `/api/admin/announcements` | GET, POST | Site-wide announcement management |
| `/api/admin/announcements/[id]` | PATCH, DELETE | Update/delete announcements |
| `/api/announcements` | GET | Active non-expired announcements (public) |
| `/api/snippets` | GET, POST | User editor snippets |
| `/api/snippets/[id]` | PUT, DELETE | Update/delete snippets |
| `/api/articles/[id]/views/sparkline` | GET | 30-day daily view series |
| `/api/reading-streak` | GET, POST | Reading streak tracker |
| `/api/category-watch` | GET, POST | Category watch toggle |
| `/api/ai/rewrite` | POST | AI text rewrite via OpenAI |
| `/api/admin/categories/merge` | POST | Merge source category into target, reassign articles |
| `/api/admin/word-count` | GET | Word-count distribution across published articles |
| `/api/admin/maintenance` | GET, POST | Get/set maintenance mode flag (stored in PluginState) |
| `/api/admin/read-only` | GET, POST | Get/set read-only mode flag (stored in PluginState) |
| `/api/admin/prune-revisions` | GET, POST | Preview/execute revision pruning (keep latest N per article) |
| `/api/admin/user-activity` | GET | User list with edit counts; `?userId=X` returns revision history |
| `/api/admin/writing-velocity` | GET | Weekly word counts added (from revisions) for last 12 weeks |
| `/api/sessions` | GET | Current user's active sessions |
| `/api/sessions/[id]` | DELETE | Revoke a session (own or admin) |
| `/api/ai/suggest-tags` | POST | Suggest existing tags for an article (AI or keyword fallback) |
| `/api/ai/suggest-category` | POST | Suggest best-fit category for an article (AI) |
| `/api/ai/suggest-title` | POST | Suggest 5 alternative encyclopedic titles for an article (AI) |
| `/tags/cloud` | GET | Tag cloud — all tags sized by article count |
| `/api/admin/category-growth` | GET | New articles grouped by category × month (last 12 months) |
| `/api/ai/expand` | POST | Expand selected text into more detailed prose (AI) |
| `/api/ai/chat` | POST | Conversational wiki assistant — multi-turn Q&A over article + related content |
| `/api/ai/generate-article` | POST | Generate full article HTML body from a title + headings array |
| `/api/ai/revision-summary` | POST | Generate a one-sentence edit summary by comparing old vs. new article content |
| `/api/ask` | POST | Streaming AI oracle — SSE endpoint; semantic search + `streamText`; emits sources then token events |
| `/api/ai/synthesize` | POST | AI synthesises all articles in a category (or an article ID list) into a new overview article |
| `/api/export/json` | GET | Download all articles as JSON (admin only) |
| `/articles/[slug]/analytics` | GET | Per-article analytics: 30-day views, reads, reactions, revisions (admin only) |
| `/api/admin/import` | POST | Bulk import up to 500 articles from a JSON array; auto-creates tags, resolves categories |
| `/admin/dead-ends` | GET | Lists published articles with no outgoing wiki links |
| `/admin/duplicate-content` | GET | Jaccard similarity scan for near-duplicate published articles |
| `/admin/orphans` | GET | Lists published articles with no incoming links from any other article |
| `/admin/long-articles` | GET | Lists published articles exceeding a word threshold (default 5,000), sorted by length |
| `/api/random` | GET | Redirects to a random published article; optional `?category=slug` filter |
| `/api/export/analytics` | GET | Admin-only CSV download of all published articles with read/reaction/revision counts |
| `/api/stats` | GET | Wiki statistics |
| `/api/metrics` | GET, POST | Performance metrics |
| `/api/health` | GET | Health check |
| `/api/notifications` | GET, PATCH | User notifications |
| `/api/watchlist` | GET, POST, DELETE | Article watch subscriptions |
| `/api/webhooks` | GET, POST, PUT, DELETE | Webhook management |
| `/api/plugins` | GET, PUT | Plugin management |
| `/api/v1/*` | GET | Public REST API (articles, categories, search, tags) |
