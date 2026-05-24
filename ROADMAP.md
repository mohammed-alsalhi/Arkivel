# Roadmap

Planned features and improvements for Arkivel, starting from v4.19.

Previous completed work:
- [v1.0–v4.11 archive](docs/archive/ROADMAP-v1-v4.md)
- [v4.12 archive](docs/archive/ROADMAP-v4.12.md)
- [v4.13 archive](docs/archive/ROADMAP-v4.13.md)
- [v4.14 archive](docs/archive/ROADMAP-v4.14.md)
- [v4.15 archive](docs/archive/ROADMAP-v4.15.md)
- [v4.16 archive](docs/archive/ROADMAP-v4.16.md)
- [v4.17 archive](docs/archive/ROADMAP-v4.17.md)
- [v4.18 archive](docs/archive/ROADMAP-v4.18.md)

Have an idea? Open a [GitHub Issue](https://github.com/mohammed-alsalhi/arkivel/issues) to discuss it.

---

## Pre-5.0 Stable Release Roadmap

Arkivel remains beta through the entire v4 line. The goal is to make the platform reusable, self-hostable, customizable, and extension-ready before tagging v5.0.0 as the first stable release. Patch releases can still land inside any band when a feature needs cleanup, tests, documentation, or compatibility hardening.

### v4.76.x - Customization Studio v2

- [ ] Promote the env-first studio into a complete admin workbench for branding, styles, color themes, layouts, feature flags, copy, logos, metadata, preview URLs, and deployment notes
- [ ] Add richer preview frames for homepage, article, dashboard, marketplace, editor, and space-level surfaces
- [ ] Add contrast, missing-asset, invalid-env, and incompatible-preset diagnostics before admins copy config into production
- [ ] Keep the v1 safety rule: no arbitrary remote code and no silent runtime overrides

### v4.77.x - Marketplace Import Pipeline

- [ ] Convert the built-in marketplace catalog into a signed, versioned, local-first registry model
- [ ] Add import/export flows for theme packs and plugin manifests with schema validation, compatibility checks, preview diffs, and rollback notes
- [ ] Add marketplace detail pages for install requirements, screenshots, permissions, env vars, and known limitations
- [ ] Keep marketplace v1 self-host safe by requiring explicit local installation for anything executable

### v4.78.x - Component And Layout Pack Runtime Slots

- [ ] Define stable runtime slots for article cards, metadata panels, dashboard widgets, homepage sections, infobox layouts, editor panels, and space navigation
- [ ] Introduce typed component-pack contracts that separate metadata, styling hooks, and executable React components
- [ ] Ship first-class sample packs for default wiki, docs portal, team knowledge base, worldbuilding atlas, and research notebook experiences
- [ ] Add tests that prove unknown packs cannot break the base shell

### v4.79.x - Per-Space Customization Persistence

- [ ] Add persisted category/space customization preferences for style, color theme, layout, templates, navigation, metadata schema, and default article chrome
- [ ] Implement inheritance from global config to spaces to articles, with clear admin previews before saving
- [ ] Add migration-safe APIs for reading and updating space customization without exposing private draft content
- [ ] Document portable space packs for teams, RPG worlds, research libraries, product docs, and personal wikis

### v4.80.x - Plugin Runtime Sandbox

- [ ] Finalize `plugin.json` permissions for routes, widgets, webhooks, settings, storage, API scopes, scheduled jobs, and admin surfaces
- [ ] Add a disabled-by-default plugin loader for trusted local plugins with explicit admin enablement
- [ ] Build permission review UI, audit events, lifecycle hooks, and safe failure states for broken plugins
- [ ] Ship starter examples for web clipper, import adapter, export adapter, dashboard widget, and editor command plugins

### v4.81.x - Data Portability Hardening

- [ ] Normalize full-site export/import around articles, revisions, categories, tags, users, settings, plugin state, maps, comments, and assets
- [ ] Add portable bundle manifests with checksums, schema versions, dry-run import reports, and conflict handling
- [ ] Improve Markdown, HTML, JSON, CSV, MediaWiki, and ZIP workflows so migrations can be rehearsed before production
- [ ] Document self-host backup and restore playbooks for local, Vercel, Docker, and managed Postgres deployments

### v4.82.x - Multi-User And Workspace Maturity

- [ ] Harden organizations/workspaces, invitations, default roles, member management, profile settings, and account recovery
- [ ] Add role templates for personal wiki, private team, public docs, editorial review, and read-only archive setups
- [ ] Make admin, editor, viewer, and API-key permissions consistent across pages, feeds, webhooks, exports, and plugin surfaces
- [ ] Add regression tests for auth boundaries and cross-workspace data isolation

### v4.83.x - Governance And Auditability

- [ ] Deepen review requests, claim review, verification stamps, editorial queues, ownership, due dates, and escalation paths
- [ ] Add immutable audit trails for sensitive admin actions, customization changes, plugin enablement, imports, exports, and permission updates
- [ ] Provide moderation tools for discussions, suggestions, comments, and public contribution flows
- [ ] Add governance dashboards for stale reviews, disputed claims, unverified pages, orphaned ownership, and risk hotspots

### v4.84.x - Search And Discovery Intelligence

- [ ] Upgrade search with saved filters, facets, synonyms, redirects, aliases, semantic links, stale-result signals, and admin-tunable ranking
- [ ] Add discovery surfaces for related trails, duplicate pages, unresolved questions, canon conflicts, glossary gaps, and topic clusters
- [ ] Expose stable search APIs for plugins, marketplace widgets, dashboards, and future mobile clients
- [ ] Add search-quality tests with representative wiki fixtures

### v4.85.x - Editor And Collaboration Hardening

- [ ] Stabilize collaborative editing, draft recovery, offline conflict warnings, autosave repair, rich embed handling, and editor performance
- [ ] Convert complex editor controls into reusable command, tray, and inspector components that plugin packs can extend later
- [ ] Add reusable template blocks for callouts, metadata tables, timelines, infoboxes, decision logs, research notes, and worldbuilding entries
- [ ] Expand editor QA across desktop, tablet, mobile, light theme, dark theme, and custom themes

### v4.86.x - API, SDK, And Webhook Stabilization

- [ ] Version the public REST API as a stable v1 surface with documented pagination, errors, filtering, permissions, and rate-limit behavior
- [ ] Add SDK-ready TypeScript types for articles, categories, tags, revisions, search, customization, marketplace, plugins, webhooks, and exports
- [ ] Harden webhook signing, retries, delivery logs, redelivery, event filtering, and local testing tools
- [ ] Publish migration notes for any pre-v5 API changes

### v4.87.x - Admin Operations And Observability

- [ ] Add operations dashboards for queues, jobs, metrics, slow pages, failed webhooks, import/export runs, plugin errors, and database health
- [ ] Add structured logs and admin-readable diagnostics for config, auth, Prisma, migrations, assets, search, and customization
- [ ] Improve maintenance mode, read-only mode, safe upgrades, background tasks, and health checks
- [ ] Document production runbooks for self-host admins

### v4.88.x - Performance, Cache, And Offline Polish

- [ ] Profile and optimize article pages, graph surfaces, Studio, Atlas, Trails, search, editor startup, and admin dashboards
- [ ] Add cache invalidation rules for articles, categories, feeds, sitemap, customization, marketplace metadata, and plugin manifests
- [ ] Improve PWA install, offline reading, stale-cache warnings, asset caching, and mobile startup behavior
- [ ] Add benchmark fixtures and performance budgets before the release candidate phase

### v4.89.x - Security And Privacy Baseline

- [ ] Complete a security review for auth, sessions, API keys, webhooks, imports, file uploads, plugin manifests, marketplace packs, and admin routes
- [ ] Add privacy controls for public/private spaces, indexing, feeds, exports, analytics, AI features, and webhook payloads
- [ ] Harden headers, CSRF-sensitive actions, upload validation, permission checks, secret handling, and audit logs
- [ ] Produce a pre-v5 threat model and self-host security checklist

### v4.90.x - Marketplace Beta

- [ ] Launch the local-first marketplace beta with styles, color themes, layouts, component packs, theme packs, plugin manifests, examples, screenshots, and compatibility badges
- [ ] Add install intent flows that explain required files, env vars, permissions, data access, and manual verification steps
- [ ] Add author metadata, license metadata, changelog links, source links, and review status for catalog entries
- [ ] Publish marketplace contribution guidelines for open-source pack authors

### v4.91.x - Templates And Space Products

- [ ] Ship complete starter spaces for personal wiki, product docs, team handbook, worldbuilding bible, research notebook, reading archive, and project knowledge base
- [ ] Add template bundles that include category trees, article templates, metadata schemas, infobox fields, navigation, and recommended plugins
- [ ] Support previewing a space template before importing it into a live wiki
- [ ] Document how to build and share reusable space packs

### v4.92.x - Optional AI Assistant Packs

- [ ] Convert AI features into opt-in assistant packs with explicit provider, model, privacy, cost, and data-retention guidance
- [ ] Add reusable assistant contracts for drafting, summarizing, search augmentation, claim extraction, alt text, taxonomy suggestions, and import cleanup
- [ ] Make all AI surfaces degrade gracefully when no provider is configured
- [ ] Document local/offline-friendly and privacy-first deployment modes

### v4.93.x - Federation And Sync Planning

- [ ] Define federation boundaries for public read replicas, private mirrors, archive snapshots, and cross-instance references
- [ ] Add sync manifests and conflict reports for moving spaces between Arkivel installs
- [ ] Explore signed public indexes for optional discovery without centralizing private content
- [ ] Keep federation planning separate from the v5 stable gate unless reliability is proven

### v4.94.x - Desktop, Mobile, And PWA Finish

- [ ] Polish mobile navigation, editor ergonomics, admin surfaces, install prompts, safe areas, touch targets, and offline states
- [ ] Add desktop-app packaging research for self-host admins who want local-first deployments
- [ ] Improve responsive QA for every flagship surface and admin page across phone, tablet, laptop, and wide desktop sizes
- [ ] Remove visual overlap, overflow, and unreadable-state debt before release candidates

### v4.95.x - Migration, Backup, And Restore Guarantees

- [ ] Add migration dry runs, backup prompts, restore validation, data-integrity checks, and clear failure recovery guidance
- [ ] Test upgrade paths from representative v4 installations to the latest beta
- [ ] Stabilize Prisma schema changes and document any v5-breaking migration decisions before freeze
- [ ] Add disaster-recovery drills to docs and release QA

### v4.96.x - Test And Quality Gate Expansion

- [ ] Expand unit, integration, API, permission, import/export, customization, marketplace, plugin, and responsive tests
- [ ] Add stable fixtures for small wiki, team wiki, public docs, worldbuilding atlas, and large archive scenarios
- [ ] Gate release candidates on lint, typecheck, tests, build, migration dry run, and smoke verification
- [ ] Track known warnings and either resolve them or document why they are acceptable for v5.0.0

### v4.97.x - Documentation And Onboarding Complete Pass

- [ ] Rewrite install, upgrade, deployment, customization, marketplace, plugin, API, security, backup, and contribution docs for new maintainers
- [ ] Add guided examples, screenshots, env recipes, troubleshooting pages, and “choose your setup” flows
- [ ] Keep root docs, markdown docs, in-app Help/Features pages, API docs, changelog, roadmap, and agent instructions synchronized
- [ ] Publish a v5 readiness checklist for self-host admins

### v4.98.x - Release Candidate Hardening

- [ ] Enter feature freeze except for release blockers, documentation gaps, migration fixes, security issues, and broken tests
- [ ] Run full install, upgrade, import/export, marketplace, plugin, customization, auth, API, webhook, and restore rehearsals
- [ ] Fix release-blocking bugs and tag release-candidate builds with explicit known-issues notes
- [ ] Prepare final v5 migration guide, changelog, and compatibility matrix

### v4.99.x - Final Beta Freeze

- [ ] Treat v4.99.0 as the first final beta and reserve patch releases for blockers only
- [ ] Use v4.99.90 through v4.99.98 for final documentation, security, migration, and compatibility corrections if needed
- [ ] Reserve v4.99.99 as the last beta release candidate before v5.0.0
- [ ] Require a clean release gate before promoting the exact codebase to stable

### v5.0.0 - Stable Release Gate

- [ ] Auth, roles, sessions, API keys, and permission boundaries are audited and covered by tests
- [ ] Database migrations, backup/restore, imports, exports, and upgrades have documented recovery paths
- [ ] Customization, marketplace metadata, theme packs, layout presets, component packs, and plugin manifest contracts are stable
- [ ] Public API v1, webhooks, feeds, and SDK types have compatibility commitments
- [ ] Admin operations, observability, security, and privacy docs are complete enough for self-host operators
- [ ] README, DESIGN, ARCHITECTURE, ROADMAP, CHANGELOG, AGENTS, CONTRIBUTING, API docs, help docs, feature docs, and in-app reference pages are synchronized

## v4.75.1

- [x] Customization Studio optimization - preview selectors drive copy-ready env output and theme-pack JSON validation before deployment changes
- [x] Marketplace optimization - catalog health, search, item metadata, status tones, and load-error handling make `/admin/marketplace` more useful
- [x] Contract hardening - unique marketplace ids, stricter theme/plugin validators, layout env-value compatibility, and catalog integrity tests improve extension safety
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, features/help docs, and tests describe the optimization pass

## v4.75.0

- [x] Admin Customization Studio - `/admin/customization` previews env-first branding, styles, color themes, layouts, feature flags, theme-pack schema, and copy-ready `.env` output
- [x] Theme Export/Import Packs - theme-pack schema, sample pack metadata, and validation helpers support preview-safe JSON pack workflows
- [x] Component Pack Registry - component packs declare supported slots for article cards, metadata panels, dashboard widgets, homepage sections, and infobox layouts
- [x] Layout Presets - `NEXT_PUBLIC_ARKIVEL_LAYOUT` publishes `classic-wiki`, `docs-portal`, `team-knowledge-base`, `worldbuilding-atlas`, and `research-notebook` layout intent
- [x] Plugin Manifest Contract - plugin examples define permissions, routes, settings, widgets, hooks, compatibility, and version fields
- [x] Marketplace Page - `/admin/marketplace` lists built-in and planned styles, themes, layouts, component packs, plugins, and theme packs with copy-config actions
- [x] Per-Space Customization - `/api/customization` exposes category/space-level inherited customization metadata as a preview-only contract
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, architecture, design, feature docs, help docs, API docs, env template, tests, and agent docs describe the customization roadmap release

## v4.74.9

- [x] Settings primitive reuse - settings, shortcut customization, and snippet management pages now use shared reusable UI primitives
- [x] Editor import cleanup - removed an unused collaboration import while finishing the settings UI consistency batch
- [x] Documentation/version discipline - package metadata, changelog, and roadmap describe the settings cleanup batch

## v4.74.8

- [x] Auth page primitive reuse - login and registration pages now use shared page, header, field, input, and button primitives
- [x] Capture page primitive reuse - bookmarklet and clipper-extension install pages now use shared page, panel, button, textarea, and inline-code primitives
- [x] Documentation/version discipline - package metadata, changelog, and roadmap describe the auth/capture UI consistency batch

## v4.74.7

- [x] Read-only admin controls - `/admin/read-only` uses shared UI primitives with clear loading, saved, warning, and error states
- [x] Read-only API resilience - `/api/admin/read-only` returns explicit unavailable responses when state checks or updates fail
- [x] Documentation/version discipline - package metadata, changelog, and roadmap describe the admin hardening batch

## v4.74.6

- [x] Color theme presets - `NEXT_PUBLIC_ARKIVEL_COLOR_THEME` selects `standard`, `forest`, or `ember` independently from the selected style preset
- [x] Palette marketplace metadata - color themes are published through `/api/customization` and `src/lib/marketplace.ts` as first-class marketplace items
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, architecture, design notes, feature docs, help docs, API docs, environment template, and tests describe the color theme contract

## v4.74.5

- [x] Self-host customization manifest - `/api/customization` exposes grouped brand, feature, limit, map, integration, reusable component, and theme-hook metadata for open-source forks, plugins, and deployment dashboards
- [x] Typed customization contract - `src/lib/customization.ts` centralizes public env var defaults/descriptions and keeps `src/lib/config.ts` backward compatible with existing flat aliases
- [x] Style and marketplace foundation - `NEXT_PUBLIC_ARKIVEL_STYLE` selects `classic-wiki` or `atlas-modern`, while `src/lib/marketplace.ts` establishes stable metadata for future styles, component packs, and plugins
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, architecture, design notes, feature docs, help docs, API docs, environment template, tests, and in-app Help/Features pages describe the new customization surface

## v4.74.4

- [x] Persistent documentation/versioning rule - `AGENTS.md` now requires every agent and contributor to sync relevant docs, in-app reference pages, changelog/roadmap entries, and package metadata with each user-visible or release-note-worthy change
- [x] Commit message standard - release commits now follow the historical `vX.Y.Z: imperative summary` pattern, with documented exceptions for dependency automation, merge commits, and short non-version fixes
- [x] Contributor documentation sync - README, architecture, design, contributing, feature docs, help docs, and in-app Help/Features pages now describe the standing docs-and-version checklist
- [x] Version discipline - package metadata bumped to 4.74.4 for the repository process/policy update

## v4.73.0

- [x] Claim Review Mode - marked article claims now have persistent review states for approved, needs source, disputed, rejected, and unreviewed
- [x] Article-integrated review surface - the existing claims panel shows review status, reviewer attribution, notes, and editor/admin controls beside each marked claim
- [x] Claim review API and data model - `/api/articles/[id]/claim-reviews` stores claim decisions in `ClaimReview`, protects draft visibility, notifies article authors, and logs activity
- [x] Documentation/version discipline - package version, changelog, roadmap, feature docs, help docs, architecture, design notes, README, backlog, and in-app feature/help pages describe the completed workflow

## v4.72.3

- [x] Cleaner editor chrome - the editor header now shows only the title, word/read-time summary, Insert/Review/Outline trays, and Markdown mode
- [x] Quieter toolbar - common formatting remains visible while quote, table, text variants, knowledge tools, AI, claims, color, voice, and shortcuts sit behind More
- [x] Lighter tray model - Insert groups actions by purpose, Review folds grammar and writing coach into disclosures, and Outline keeps the builder tucked away until requested

## v4.72.2

- [x] Simplified editor surface - the editor now opens as a calm writing canvas with a compact toolbar instead of an always-visible cockpit
- [x] Feature trays - Insert, Review, Outline, and Coach keep advanced block, quality, structure, grammar, and writing-assistant tools one click away without crowding the page
- [x] Progressive toolbar - everyday formatting stays visible while advanced text, knowledge, AI, claim, color, voice, and shortcut controls move behind a single More disclosure
- [x] Editor-local styling - the new shell and toolbar use component CSS modules so unrelated global UI work can continue without editor style collisions
- [x] Responsive editor QA - Playwright coverage now opens the editor trays on desktop and phone widths and asserts no horizontal overflow

## v4.72.1

- [x] Review Requests workflow - editors can request review from article pages, optionally assign a reviewer, and jump to the live request workspace
- [x] Review detail workspace - `/reviews/[id]` shows the current draft preview, request note, comment thread, assignment controls, approval, change request, rejection, and resubmission actions
- [x] Governance status transitions - approved requests publish articles, requested changes/rejections return reviewed drafts to draft state, and resubmissions move them back into review
- [x] Review notifications and API hardening - reviewer validation, duplicate active-review prevention, decision permissions, notifications, activity events, and reviewer lookup are wired into the API
- [x] Documentation/version discipline - package version, changelog, roadmap, feature docs, help docs, architecture, design notes, README, and in-app feature/help pages describe the completed workflow

## v4.72.0

- [x] Tiptap editor cockpit - the editor now opens with a ribbon control layer, command deck, readiness score, document signals, outline navigation, and quality pass panel
- [x] Selection lab - active text selections expose inline rewrite, expand, wiki-link, URL-link, and footnote actions without hunting through the full toolbar
- [x] Quick-insert workflow - common blocks such as scaffolds, callouts, tables, data tables, Mermaid diagrams, math, decision trees, timelines, collapsibles, and query blocks are one click away
- [x] Contextual table lab - table row, column, merge, split, header, and delete controls appear only when the cursor is inside a table
- [x] Editor autosave repair - collaborative editor updates now also notify the outer article edit form, restoring draft autosave status for normal non-live editing
- [x] Responsive editor QA - Playwright coverage now loads the scratchpad editor cockpit on desktop and phone widths and asserts no horizontal overflow

## v4.71.2

- [x] Collapsed article tables - editor, article, and shared UI tables now use zero-spaced collapsed borders so adjacent cells read as one merged grid
- [x] Presentation table hardening - `/present/[slug]` keeps article tables in native table layout with fixed columns, wrapped cell content, and no slide-stage overflow
- [x] Table regression coverage - responsive presentation QA now includes a real HTML table and asserts collapsed borders stay inside the viewport

## v4.71.1

- [x] Presentation layout hardening - `/present/[slug]` now reserves separate progress, topbar, slide-stage, and footer regions so content cannot overlap deck controls
- [x] Scrollable slide stage - long titles, tall body content, code, tables, images, and embeds stay contained inside the slide viewport
- [x] Responsive controls - overview, slide count, dots, keyboard hint, and previous/next buttons wrap or stack cleanly on narrow screens
- [x] Presentation regression QA - responsive shell tests now mock a long presentation and assert that slide content does not collide with top or bottom chrome
- [x] CI shell alignment - homepage and command-palette e2e tests now match the compact search trigger, phone Browse drawer, and case-insensitive `Ctrl+K` / `Cmd+K` behavior
- [x] Wiki-link alias regression - unit tests now mock alias lookups so broken-link coverage follows the alias-aware resolver path

## v4.71.0

- [x] Canon Trails - `/trails` turns the wiki into guided reader routes through strongest canon, recent work, deep pages, and repair paths
- [x] Route engine - trail stops are built from live wiki links, backlinks, categories, recency, word depth, revisions, discussions, reads, views, reactions, and bookmarks
- [x] Trails JSON feed - `/api/trails` exposes the same route report for demos, automation, and future clients
- [x] Reader-first positioning - Canon Trails is linked from the sidebar, home page, command palette, sitemap, feature docs, help docs, and API docs
- [x] README documentation polish - the repository front page now reads like an actual documentation entry with logo, badges, button-style links, quickstart, deployment, configuration, core experiences, and API references

## v4.70.0

- [x] Canon Atlas - `/atlas` turns the wiki into a live world map with territories, article signals, story threads, and a flagship dossier
- [x] Continuity pressure - atlas metrics surface stub, category, tag, thread, excerpt, and infobox gaps as direct work queues
- [x] Atlas JSON feed - `/api/atlas` exposes the same territories, signals, threads, dossier, continuity, and next moves for demos or automation
- [x] Sidebar visibility - Canon Atlas and Knowledge cockpit now sit in the primary Browse block instead of being buried lower in the navigation
- [x] Responsive atlas QA - homepage, command palette, sitemap, docs, and responsive shell coverage include the new atlas surface

## v4.69.0

- [x] Knowledge cockpit - `/intelligence` now opens with a live article constellation, readiness radar, and impact simulator before the 20-engine grid
- [x] Graph constellation - top connected articles are plotted from real wiki-link data with direct links and selected-node readouts
- [x] Readiness radar - operational health is broken into readiness, graph, structure, freshness, trust, audience, and momentum axes
- [x] Impact simulator - editors can model gains from resolving stubs, orphans, broken links, stale pages, taxonomy debt, and verification debt
- [x] Product promotion - home actions, feature docs, help docs, architecture notes, and responsive tests now treat the command center as a flagship workspace

## v4.68.0

- [x] Knowledge Command Center - `/intelligence` turns the wiki into an operational cockpit with 20 live quality, graph, canon, audience, and editorial engines
- [x] Mission readiness scoring - stubs, orphans, stale pages, taxonomy gaps, broken links, and featured canon roll into a single readiness percentage
- [x] Next-best-work queue - prioritized actions point editors toward the most valuable fixes instead of leaving them to hunt through separate dashboards
- [x] Intelligence API feed - `/api/intelligence` exposes the same 20-engine report for external dashboards and automation
- [x] Product-surface integration - sidebar, homepage, command palette, sitemap, docs, versioning, and responsive QA now include the command center

## v4.67.1

- [x] Preliminary logo integration - public brand assets now provide the sidebar mark, mobile header mark, app icon, and metadata image
- [x] Header search simplification - the top-bar search is now a compact trigger that expands only when the reader asks for it
- [x] Browse affordance polish - the phone navigation opens the sidebar through a clearer Browse grid control instead of a generic menu icon
- [x] Local shell fallbacks - public announcement, article, category, and tag lists resolve to empty collections when the local database is unavailable
- [x] Branding documentation - README, architecture, design, feature, and help references describe the logo configuration and calmer search pattern

## v4.67.0

- [x] Main page redesign - home now acts as a compact wiki front page with stats, quick actions, featured content, browse directory links, recent updates, and sidebar modules
- [x] Shared page shell standard - page headers, deks, action clusters, compact lists, and category trees have reusable CSS primitives
- [x] Core browse route refresh - Articles, Categories, Search, Dashboard, Help, and Features use the same responsive page header structure
- [x] Home module alignment - New Articles, On This Day, and Trending widgets now use the same portal/list treatment as the rest of the app

## v4.66.2

- [x] Article action rail rethink - primary Navigate, Collect, and Share actions stay visible while Read and Tools move into compact disclosure menus
- [x] Article tabbar reset - article section tabs now use dedicated shell styles instead of sharing the in-content tab block CSS
- [x] Serif reading default - article body text defaults to serif, and the font picker now offers Serif, Sans, and Mono
- [x] Dek wrapping polish - article excerpts can use more of the header width with cleaner wrapping on wide shells

## v4.66.1

- [x] Article action panel polish - the article controls now render as a compact wrapping toolbar instead of a tiled grid with empty rows
- [x] Read controls containment - font, width, theme, and reading-mode controls are constrained so they wrap without clipping the right edge
- [x] Patch release documentation - version, changelog, roadmap, design guidance, feature docs, and help pages document the refined article action standard

## v4.66

- [x] Article page shell refresh - article display now uses a dedicated hero header, grouped action panel, taxonomy footer, and cleaner notice stack
- [x] Article action redesign - Navigate, Collect, Share, Read, and Tools controls are grouped in a responsive action panel instead of stacked toolbar rows
- [x] Reading surface polish - summary, flags, freshness, review notices, backlinks, fork actions, and category/tag context now use shared semantic UI primitives
- [x] Responsive article layout - tabs, infoboxes, table of contents, action groups, link chips, and mobile typography are constrained for phone through wide desktop widths

## v4.65

- [x] Unified search response handling — header instant search, search page, command palette, wiki-link autocomplete, split-view pickers, and article edit fallback now consume the same `/api/search` response contract
- [x] Command and navigation registry — command destinations and focused workspace route detection are centralized so global commands, sidebar toggles, and mobile navigation behavior stay aligned
- [x] Responsive discovery surfaces — search filters, semantic search results, article filters, batch bars, and listing tables wrap or scroll intentionally across phone, tablet, laptop, and wide desktop widths
- [x] Responsive QA guardrails — unit tests cover search/navigation helpers and Playwright checks core shell routes across phone, tablet, laptop, and wide desktop breakpoints

## v4.64

- [x] UI restandardization — shared compact wiki primitives for titles, buttons, icon buttons, inputs, selects, toolbars, panels, dropdowns, chips, tables, empty states, article cards, article tools, auth forms, and admin/listing surfaces
- [x] Responsive app shell — desktop/tablet sidebar remains the dense navigation spine, while phone layouts get a safe-area-aware bottom navigation for Home, Search, Create, Recent, and Menu
- [x] Focused workspace navigation — dense canvas routes such as `/ask`, `/graph`, `/split`, `/map`, and `/present/*` suppress the bottom nav and keep a compact top menu so the primary workspace keeps full height
- [x] Overlay and modal hardening — dropdowns, notifications, AI chat, synthesis, speed reader, quiz mode, article Q&A, data tables, and map controls wrap or clamp instead of overlapping across mobile, tablet, and desktop widths
- [x] Documentation/version discipline — changelog, roadmap, architecture/design docs, feature references, and in-app help/features pages updated alongside the package version bump

## v4.24

- [x] Search query analytics — log queries, surface top searches and zero-result terms in admin
- [x] Image captions — Tiptap image node with optional caption rendered below
- [x] Bulk Markdown export — download entire wiki or a category as a `.zip` of `.md` files
- [x] Notification preferences UI — granular per-user control over in-app/email notifications

## v4.25

- [x] Custom editor snippets — admin-defined reusable text blocks insertable via `/snippet` command
- [x] TOC generator in editor — toolbar button to insert/update a linked table of contents block
- [x] Per-article 30-day view sparkline — daily view trend chart in the article stats panel
- [x] Site-wide announcement banner — admin can pin a global notice to all pages

## v4.26

- [x] Category watchlist — follow a category to be notified when new articles are added
- [x] Inline AI text rewrite — select text in the editor, get AI rewrite suggestions
- [x] Article freshness badge — colour-coded indicator showing how recently an article was edited
- [x] Reading streak tracker — consecutive reading days tracked and shown on the dashboard

## v4.27

- [x] Category merge tool — admin tool to merge two categories, reassigning all articles
- [x] Word-count distribution chart — admin histogram of article lengths across the wiki
- [x] Keyboard shortcut customization — per-user reassignment of shortcuts in settings
- [x] Wiki creation timeline — visual page showing when each article was first created

## v4.28

- [x] Command palette — `Cmd+K` / `Ctrl+K` fuzzy-search articles and actions from anywhere
- [x] Find & replace in editor — inline match highlighting with Replace / Replace All
- [x] Copy as Markdown — one-click copy of article title + raw Markdown to clipboard
- [x] 500-feature backlog — `FEATURES_BACKLOG.md` documents planned features by theme

## v4.29

- [x] Glossary system — admin CRUD for terms + aliases; public A-Z browse at `/glossary`
- [x] Glossary hover cards — term occurrences in articles get dotted underlines with hover definitions
- [x] Reading level badge — Flesch Reading Ease score shown as colour-coded badge in article header
- [x] Pull quote blocks — styled centred blockquote node in editor, via slash command or `Mod+Shift+Q`

## v4.30

- [x] Heading permalink links — ¶ anchor links on all article headings for deep-linking
- [x] Category statistics admin page — sortable table of article count, word totals, last-edit per category
- [x] In Brief summary box — `summaryShort` displayed as highlighted callout at top of article
- [x] On This Day fix — corrected stale Prisma query field

## v4.31

- [x] Smart typography — `--` → em dash, `...` → ellipsis, straight quotes → curly quotes as you type
- [x] Browser-local reading history — last 50 articles visited, accessible at `/history`
- [x] Last-visit badge — "You read this X ago" shown on return visits to an article
- [x] Sticky article header — slim floating bar with title + Edit/Top links after scrolling past heading

## v4.32

- [x] Outline builder — AI-assisted panel in editor generates H2/H3 sections from title; three styles; inserts headings into document
- [x] AI alt-text suggestions — image caption prompt pre-filled from filename via `/api/ai/alt-text`
- [x] Article Q&A widget — collapsible ask-a-question panel on article pages backed by `/api/ai/qa`

## v4.33

- [x] Edit suggestion system — reader-facing form + admin review/accept/reject workflow
- [x] Reader retention analytics — per-article scroll depth funnel at `/admin/retention`
- [x] Referrer tracking — `document.referrer` logged per article per day; admin view at `/admin/referrers`

## v4.34

- [x] Superscript / subscript toolbar buttons
- [x] Text highlighting with 6-color picker
- [x] Accordion / FAQ collapsible blocks via `/accordion` slash command
- [x] Two-column layout block via `/two-column layout` slash command
- [x] YouTube / Vimeo responsive video embeds via `/youtube` slash command
- [x] GitHub Gist embed via `/github gist` slash command

## v4.35

- [x] Satisfaction rating widget — 5-star per-session rating on article pages, avg + count display
- [x] Hot articles widget — "Trending this week" panel on homepage from last-7-day view counts
- [x] Article todo list — per-article editor checklist with check-off, add, delete; admin-only editing
- [x] Tag management admin page — rename, recolor, delete tags with inline edit UI at `/admin/tags`
- [x] Word-count range filter in search — min/max word count filter in advanced search sidebar

## v4.36

- [x] AI grammar check panel — collapsible panel below editor; checks grammar/style via AI (or heuristic fallback); Apply buttons fix inline issues
- [x] Bulk tag operations — "Add tag" and "Remove tag" in the article list batch action bar
- [x] Scroll position memory — article scroll position saved to localStorage; restored on return visits
- [x] Search advanced filter enhancements — word count already wired; grammar API endpoint at `/api/ai/grammar`

## v4.37

- [x] PWA manifest — `manifest.ts` makes the wiki installable as a home-screen app
- [x] External link click tracking — outbound links logged via `sendBeacon`; admin page at `/admin/external-links`
- [x] Prefetch on hover — `PrefetchArticleLinks` prefetches `/articles/*` pages on hover for instant navigation

## v4.38

- [x] Font size preference — S/M/L/XL reading size control on article pages; persisted to localStorage
- [x] Focus paragraph mode — dims non-hovered paragraphs in article content; toggle with persistence
- [x] Saved search alerts — `alertEnabled` toggle on saved searches; daily cron at `/api/cron/search-alerts` sends in-app notifications for new matches
- [x] Saved searches settings page — manage saved searches with alert toggle at `/settings/saved-searches`

## v4.50

- [x] Bulk JSON export — `/api/export/json`; downloads all articles as structured JSON (admin only)
- [x] Per-article analytics tab — `/articles/[slug]/analytics`; 30-day view chart + summary stats
- [x] Series progress tracker — ArticleSeriesNav shows "X of N read" from browser reading history

## v4.49

- [x] Image lightbox — click any article image to view full-size; close with Esc or click outside
- [x] AI expand section — "AI Expand" toolbar button; select text, click to expand into more detail

## v4.48

- [x] Article width preference — narrow/default/full toggle in article toolbar; persisted to localStorage
- [x] Local timezone timestamps — `LocalDate` client component renders dates in the user's browser timezone
- [x] Category growth chart — `/admin/category-growth`; stacked bar chart of new articles per category per month (last 12 months)

## v4.47

- [x] Auto-save indicator — edit form auto-saves draft to localStorage after 2 s of inactivity; shows "Unsaved changes" / "Draft saved" status
- [x] Character count — shown alongside word count in article byline (abbreviated for large articles)
- [x] Did-you-mean suggestions — zero-result searches suggest the closest matching article title
- [x] Tag cloud page — `/tags/cloud` shows tags sized by article count; linked from All Tags

## v4.46

- [x] Featured article badge — admins can mark articles as Featured; gold star badge on article page
- [x] AI title suggestions — "AI suggest" in edit form returns 5 clickable alternative titles; click to apply

## v4.45

- [x] Session management — view/revoke active sessions at `/settings/sessions`; device and IP info
- [x] AI tag suggestions — "AI suggest" button in article edit form auto-adds relevant tags
- [x] AI category suggestions — "AI suggest" button picks best-fit category from content
- [x] Writing velocity — admin weekly bar chart of words added over last 12 weeks

## v4.44

- [x] Scheduled announcements — set future go-live datetime; hidden until that time
- [x] Read-only mode — admin toggle; blue site-wide banner; blocks non-admin edits
- [x] Revision pruning — admin tool; preview then delete oldest revisions beyond threshold
- [x] User activity log — admin page; select user to see full revision history

## v4.43

- [x] Cleanup tags — admin flags (needs-images, needs-expansion, etc.) on articles; orange notice banner on article page
- [x] Article adoption — mark article as abandoned; adoption banner + one-click claim for editors
- [x] Copy as plain text — button in article toolbar strips HTML and copies to clipboard

## v4.42

- [x] Theme customizer — HSL hue slider for accent color; live preview; persisted to localStorage
- [x] Font preference — serif/sans/mono selector for article body; injects override CSS; persisted
- [x] Article quick notes — private per-article notes stored in browser localStorage; save/delete controls
- [x] Maintenance mode — admin toggle at `/admin/maintenance`; yellow site-wide banner when active

## v4.41

- [x] High-contrast accessibility mode — pure black/white/yellow theme toggle in article toolbar; persisted
- [x] Text-only mode — hides images/media in article content; toolbar toggle; persisted
- [x] Content warning tags — CW badges (spoilers, violence, mature, etc.) on articles; dismissible amber banner; editable in article form
- [x] Content gap analysis — admin page showing zero/low-result searches to identify missing wiki topics

## v4.40

- [x] Reading ETA — `~X min left` in article byline, updates dynamically while scrolling
- [x] Night reading mode — warm sepia theme toggled from article toolbar, persisted to localStorage
- [x] Search history — last 20 searches in localStorage; shown as chips when query is empty

## v4.60

- [x] Ask my wiki — streaming AI oracle at /ask; semantic search + SSE streaming; source attribution; multi-turn
- [x] Knowledge synthesis — AI synthesizes all articles in a category into an overview; one-click to article
- [x] Cinematic presentation mode — full rewrite of /present/[slug]; animations, overview grid, fullscreen

## v4.59

- [x] Button / CTA blocks — `/button` slash command, configurable label/URL/style
- [x] Divider with label blocks — `/divider` slash command, optional centered label
- [x] AI revision summary generation — "AI summarize" button auto-fills edit summary
- [x] Article quiz mode — "Quiz me" button generates 5 AI questions, full flashcard UI

## v4.63

- [x] Wiki Health Dashboard — `/health` page with health score, 7 issue dimensions, per-article fix links
- [x] AI Auto-fill from Title — template-based full article generation in new article editor
- [x] Category Overview Generator — AI-written intro prose button on all category pages
- [x] Article Audio Narration — browser TTS player with pause/stop/progress on all articles
- [x] AI Fact-Check — claim-by-claim verification with Verified/Plausible/Uncertain/Questionable verdicts
- [x] Smart Editor Suggestions — live panel: unlinked mentions, related articles, AI-suggested missing sections

## v4.62

- [x] Daily Digest — personalised in-app briefing at `/digest`
- [x] Image → Wiki Article — Claude Vision reads photo/screenshot and generates article
- [x] YouTube → Wiki Article — transcript extraction → structured article
- [x] Historical Timeline — `/timeline/historical` year-extraction timeline with decade scrubber
- [x] Semantic Search Toggle — semantic mode on search page
- [x] AI Tutor Mode — Socratic chat tutor on article pages

## v4.61

- [x] Adaptive Reading Level — Beginner / Technical / ELI5 on-the-fly AI rewrite
- [x] Spaced Repetition Review Queue — SM-2 scheduling with flip-card UI at `/review`
- [x] Import from URL — AI extracts and formats web page content into wiki article
- [x] Knowledge Coverage Map — category health grid at `/coverage`
- [x] Structured Claims — mark text as certain/probable/disputed with tooltip badges
- [x] Real-time Collaborative Editing — Yjs-powered simultaneous editing with cursor presence

## v4.58

- [x] Tabbed content blocks — `/tabs` slash command, interactive tab panels
- [x] Gallery grid blocks — `/gallery` slash command, responsive image grid
- [x] Conversational AI wiki assistant — floating chat panel on article pages
- [x] AI article generation from outline — "AI Generate" toolbar button fills headings with content

## v4.57

- [x] Smart URL paste → auto-link in editor
- [x] Typewriter scrolling mode
- [x] Short-article merger suggestions admin page
- [x] Sidebar position preference (left / right)

## v4.39

- [x] Speed reader (RSVP) — flashes one word at a time with ORP highlighting; 150/250/400/600 WPM; modal in article toolbar
- [x] Article blame view — paragraph-level authorship tab at `/articles/[slug]/blame`; colour-coded by revision
- [x] Article polls — admins attach polls to articles; session-based voting; vote-to-reveal results; admin close/reopen/delete
