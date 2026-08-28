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

## v5.2 - Post-stable cleanup

#### v5.2.2 - Dead code and consistency audit

- [x] Remove dead API routes, orphaned contract libraries, stub admin pages, and vaporware docs
- [x] Slim `/api/customization` to the fields its consumers read
- [x] Surface orphaned features (stats, leaderboard, flashcards, learning paths, change requests, reviews, forks, bounties, TIL, collections, mentions, history) in `/tools` and the command palette
- [x] Fix theme, dialog, z-index, and breakpoint consistency violations

## v5.3 - Product site and deployment cleanup

#### v5.3.0 - One public source, independent deployments

- [x] Add a database-free product and documentation mode for `arkivel.com`
- [x] Keep wiki mode as the default for self-hosted instances
- [x] Remove destructive database mutation from the application build
- [x] Document one public repository with separate deployment configuration and data

#### v5.3.1 - Product presentation and API reference

- [x] Tighten product copy and reduce repeated call-to-action chrome
- [x] Use monochrome lowercase styling, GitHub marks, and an adaptive SVG favicon
- [x] Generate `/api-docs` from the shared OpenAPI document

## Pre-5.0 Stable Release Roadmap

Arkivel remains beta through the entire v4 line. The goal is to make the platform reusable, self-hostable, customizable, extension-ready, portable, and operable before tagging v5.0.0 as the first stable release. This ladder uses patch-level planning so each `v4.x.y` release can land a focused, reviewable batch with docs, tests, version metadata, commit, and push.

### v4.76 - Customization Studio v2

#### v4.76.0 - Studio workbench foundation

- [x] Promote `/admin/customization` into a multi-tab workbench for brand, style, color, layout, content copy, feature flags, logos, canonical URL, and deployment notes
- [x] Add preview frames for homepage, article reader, article editor, dashboard, marketplace, and mobile shell
- [x] Add config source badges for defaults, env vars, and unsaved preview changes
- [x] Add copy-ready `.env`, Vercel env, Docker Compose env, and `.env.local` output modes
- [x] Keep fallback coverage for unknown style, color theme, and layout values

#### v4.76.1 - Studio diagnostics

- [x] Add contrast review diagnostics for text, links, buttons, warning states, code blocks, tables, and shell navigation
- [x] Add missing-asset diagnostics for full logo, mark logo, and app icon values
- [x] Add invalid-env diagnostics for base URL, asset paths, and unsupported preset ids
- [x] Add compatibility checks between selected style, color theme, and layout presets
- [x] Add downloadable diagnostics JSON for support requests and GitHub issues

#### v4.76.2 - Customization drafts

- [x] Add browser-local customization drafts so admins can try combinations without changing runtime config
- [x] Add named draft presets for personal wiki, team handbook, docs portal, worldbuilding atlas, research notebook, and archive
- [x] Add visual diff between active config and draft config
- [x] Add reset-to-default and reset-to-active actions with confirmation states
- [x] Document draft workflows for self-host admins and open-source theme authors

#### v4.76.3 - Studio accessibility and polish

- [x] Add keyboard navigation, focus rings, ARIA labels, and screen-reader summaries for all studio controls
- [x] Add responsive layout QA for mobile, tablet, laptop, and wide desktop previews
- [x] Add warning states for one-note palettes, low-contrast dark themes, and oversized brand assets
- [x] Add UI primitive reuse pass so studio controls become reusable admin components
- [x] Update in-app Help and Features pages with the full studio workflow

### v4.77 - Local-First Marketplace Pipeline

#### v4.77.0 - Registry contract

- [x] Convert marketplace metadata into a versioned local registry contract with `id`, `kind`, `version`, `compatibility`, `author`, `license`, `source`, `status`, and `checksums`
- [x] Add registry validation for duplicate ids, unsupported kinds, incompatible versions, missing screenshots, unsafe permissions, and invalid licenses
- [x] Add a registry health panel to `/admin/marketplace`
- [x] Add marketplace API fields for registry version, schema version, validation summary, and catalog source
- [x] Add tests for every marketplace item kind and registry failure mode

#### v4.77.1 - Pack import preview

- [x] Add upload/paste import preview for theme packs, layout packs, component packs, and plugin manifests
- [x] Show parsed metadata, required files, required env vars, permissions, hooks, routes, widgets, and compatibility warnings
- [x] Add diff view between imported pack tokens and built-in defaults
- [x] Reject executable payloads, remote code references, path traversal, and unsupported schema versions
- [x] Keep all imports preview-only until the trusted local install flow ships

#### v4.77.2 - Marketplace detail pages

- [x] Add detail drawer/page for every catalog item with overview, screenshots, config examples, compatibility, permissions, author, license, changelog, and docs links
- [x] Add copy actions for env vars, pack JSON, plugin manifest JSON, and installation notes
- [x] Add status badges for built-in, planned, experimental, local-only, deprecated, and blocked items
- [x] Add filtering by kind, status, slot, permission, compatibility, layout, style, and tag
- [x] Add empty states for self-host builds with custom local registries

#### v4.77.3 - Marketplace contribution docs

- [x] Add contribution guidelines for style packs, color themes, layout packs, component packs, plugin manifests, and template packs
- [x] Add sample pack folders with README, manifest, screenshots, compatibility notes, and tests
- [x] Add marketplace review checklist for security, accessibility, performance, docs, and compatibility
- [x] Add pack naming and semantic versioning guidance
- [x] Add GitHub issue templates for marketplace submissions and pack bug reports

### v4.78 - Runtime Slots And Component Packs

#### v4.78.0 - Slot registry

- [x] Define stable slots for article card, article header, metadata panel, infobox layout, dashboard widget, homepage section, search result, editor panel, space navigation, and admin summary
- [x] Add TypeScript slot contracts with props, data boundaries, loading states, error states, and permission notes
- [x] Expose slot metadata through `/api/customization` and marketplace catalog entries
- [x] Add base fallback components for every slot so unknown packs cannot break the shell
- [x] Add tests for slot registration, fallback rendering, and incompatible pack rejection

#### v4.78.1 - Built-in component packs

- [x] Add default wiki component pack with dense article cards, compact metadata, classic infoboxes, and quick-edit affordances
- [x] Add docs portal component pack with version badges, sidebar section cards, page status, and last-reviewed metadata
- [x] Add team knowledge base component pack with owners, review dates, teams, escalation paths, and handbook widgets
- [x] Add worldbuilding atlas component pack with canon badges, region metadata, timeline cards, relation panels, and lore infoboxes
- [x] Add research notebook component pack with citation panels, evidence confidence, experiment logs, and bibliography widgets

#### v4.78.2 - Layout composition hooks

- [x] Add layout hooks for shell density, homepage module order, article column structure, right-rail behavior, dashboard modules, and category landing pages
- [x] Add preview-only layout composition in Customization Studio
- [x] Add documented CSS variable and data-attribute hooks for each layout preset
- [x] Add layout-specific screenshots to marketplace details
- [x] Add regression tests for layout fallback and active layout metadata

#### v4.78.3 - Pack developer experience

- [x] Add generator script for new component packs with manifest, sample components, tests, screenshots folder, and docs stub
- [x] Add local pack validation command for CI and pack authors
- [x] Add component-pack examples to architecture and design docs
- [x] Add Storybook-style or route-based preview harness planning for pack authors
- [x] Add typed fixture data for article, category, dashboard, marketplace, and editor slots

### v4.79 - Per-Space Customization Persistence

#### v4.79.0 - Space customization schema

- [x] Add persisted category/space customization preferences for style, color theme, layout, component pack, template pack, navigation, and metadata schema
- [x] Add inheritance model from global config to parent space to child space to article overrides
- [x] Add Prisma migration, validation helpers, API types, and admin-only update endpoints
- [x] Add read-only public shape that hides private draft config from unauthorized users
- [x] Add migration and rollback docs for self-host admins

#### v4.79.1 - Space customization UI

- [x] Add space-level customization editor in category admin pages
- [x] Add inherited preview, explicit override markers, reset-to-parent, and reset-to-global controls
- [x] Add space landing previews for article list, metadata schema, navigation, layout, and theme
- [x] Add warnings when overrides conflict with disabled global features
- [x] Add responsive QA for customized category and article pages

#### v4.79.2 - Space templates

- [x] Add reusable space template contract for category tree, article templates, metadata schema, default tags, infobox fields, layout, and recommended packs
- [x] Add built-in templates for personal wiki, team handbook, product docs, worldbuilding bible, research notebook, reading archive, and project knowledge base
- [x] Add template preview before applying to a category
- [x] Add import/export for template JSON with validation and compatibility notes
- [x] Add docs for building shareable space templates

#### v4.79.3 - Space governance hooks

- [x] Add space owner, reviewer, default visibility, review cadence, and content health preferences
- [x] Add inherited governance badges on article pages and admin dashboards
- [x] Add space-specific dashboard widgets for stale pages, unreviewed claims, orphaned content, and broken links
- [x] Add audit events for space customization and governance changes
- [x] Add permission tests for space admins, editors, viewers, and legacy admin-secret mode

### v4.80 - Plugin Runtime Sandbox

#### v4.80.0 - Manifest schema

- [x] Finalize `plugin.json` fields for identity, version, compatibility, permissions, routes, settings, widgets, hooks, jobs, storage, API scopes, and webhooks
- [x] Add schema validation with actionable errors and examples
- [x] Add manifest compatibility matrix for Arkivel versions and plugin API versions
- [x] Add planned plugin examples for web clipper, import adapter, export adapter, dashboard widget, editor command, and notification bridge
- [x] Expose manifest schema through `/api/customization`

#### v4.80.1 - Trusted local plugin loader

- [x] Add disabled-by-default loader for trusted local plugins stored in an explicit plugins directory
- [x] Add admin enable/disable UI with permission review and failure recovery
- [x] Add safe boundaries for route registration, widget registration, settings registration, and hook registration
- [x] Add plugin load error reporting without crashing the base app
- [x] Add tests for disabled, enabled, missing, invalid, and incompatible plugins

#### v4.80.2 - Plugin permissions and audit

- [x] Add permission prompts for article read/write, category read/write, user read, settings write, webhook send, file read, and job execution
- [x] Add audit events for plugin install, enable, disable, settings change, route access, job run, and hook failure
- [x] Add plugin health cards with last load, last error, permissions, routes, widgets, and version
- [x] Add security docs for trusted local plugins and why remote arbitrary code is out of scope for v1
- [x] Add plugin permission tests for admin, editor, viewer, API key, and anonymous access

#### v4.80.3 - Plugin starter kit

- [x] Add starter plugin folder with manifest, route, dashboard widget, setting schema, hook, job, and tests
- [x] Add CLI helper to validate plugin manifests and list registered surfaces
- [x] Add plugin author docs, examples, and compatibility notes
- [x] Add marketplace listing template for plugin authors
- [x] Add plugin smoke tests in CI planning docs

### v4.81 - Data Portability

#### v4.81.0 - Portable bundle contract

- [x] Define full-site bundle manifest for articles, revisions, categories, tags, users, sessions exclusion, settings, plugin state, maps, comments, discussions, assets, and customizations
- [x] Add checksums, schema version, app version, source instance metadata, created-at, and export scope fields
- [x] Add dry-run import report shape for conflicts, missing assets, unsupported schema, duplicate slugs, and permission gaps
- [x] Add export privacy filters for private spaces, draft content, users, analytics, and API keys
- [x] Document bundle compatibility promises before v5

#### v4.81.1 - Export hardening

- [x] Improve Markdown, HTML, JSON, CSV, ZIP, MediaWiki, and database-shaped export workflows
- [x] Add progress reporting, cancellation, retry, and error logs for long exports
- [x] Add export manifests with file counts, byte counts, checksums, warnings, and omitted private data
- [x] Add admin export history with downloadable reports
- [x] Add tests for export manifest correctness and private-data omission

#### v4.81.2 - Import rehearsal

- [x] Add import dry-run UI with conflict categories, recommended actions, and blocked changes
- [x] Add slug conflict handling, category merge options, tag merge options, user mapping, asset mapping, and revision preservation options
- [x] Add import rollback plan generation before any write
- [x] Add fixture imports for small wiki, large archive, docs portal, and worldbuilding atlas
- [x] Add docs for rehearsing imports safely on staging

### v4.82 - Multi-User And Workspaces

#### v4.82.0 - Workspace model

- [x] Harden organization/workspace entities, membership, invitations, default roles, workspace settings, and workspace-scoped navigation
- [x] Add workspace bootstrap flows for personal, team, public docs, private archive, and demo deployments
- [x] Add workspace-aware APIs for articles, categories, tags, search, dashboards, customization, and marketplace selections
- [x] Add data isolation tests for workspace boundaries
- [x] Document migration path from single-workspace installs

#### v4.82.1 - Role templates

- [x] Add role templates for personal admin, team owner, docs maintainer, editor, reviewer, contributor, viewer, and public reader
- [x] Add permission matrix UI and docs for pages, APIs, exports, webhooks, plugins, customization, and marketplace actions
- [x] Add invitation flows with expiration, role selection, resend, revoke, and audit events
- [x] Add account recovery and admin recovery guidance for self-host installs
- [x] Add regression tests for admin/editor/viewer/API-key behavior

#### v4.82.2 - Collaboration controls

- [x] Add co-author management, edit locks, review assignments, comment permissions, mention permissions, and notification routing per workspace
- [x] Add user profile settings for display name, avatar, notification preferences, timezone, and default editor preferences
- [x] Add workspace activity digest and per-user contribution summary
- [x] Add public/private workspace visibility checks across feeds, sitemap, RSS, Atom, and API v1
- [x] Add docs for running Arkivel as a private team knowledge base

### v4.83 - Governance And Auditability

#### v4.83.0 - Editorial governance

- [x] Deepen review requests with due dates, required reviewers, approval thresholds, change-request cycles, and status transitions
- [x] Add claim review queues grouped by disputed, needs source, stale, rejected, and unreviewed claims
- [x] Add verification stamps with reviewer, evidence, expiration, and renewal reminders
- [x] Add ownership and escalation paths for categories, spaces, articles, and templates
- [x] Add governance dashboard cards for release blockers and editorial risk

#### v4.83.1 - Audit trail expansion

- [x] Add immutable audit events for sensitive admin actions, permission updates, customization changes, plugin changes, imports, exports, and marketplace installs
- [x] Add audit filters by actor, action, target, workspace, severity, and date
- [x] Add audit export with privacy-preserving redaction options
- [x] Add alerting hooks for suspicious activity and failed admin operations
- [x] Add audit retention settings and docs

#### v4.83.2 - Moderation and suggestions

- [x] Add moderation tools for discussions, suggestions, comments, public contribution requests, and reported content
- [x] Add suggestion review queue with accept, reject, comment, assign, and convert-to-task actions
- [x] Add anti-spam and rate-limit planning for public contribution surfaces
- [x] Add visibility controls for discussion threads and reviewer-only notes
- [x] Add moderation docs for public docs and community wiki setups

### v4.84 - Search And Discovery

#### v4.84.0 - Search relevance v2

- [x] Add saved filters, facets, synonyms, redirects, aliases, stemming strategy, phrase ranking, and admin-tunable weights
- [x] Add stale-result, draft-visibility, review-status, and verification signals to search ranking
- [x] Add search explain mode for admins
- [x] Add search-quality fixtures and tests for common wiki patterns
- [x] Add migration notes for any changed search API scoring fields

#### v4.84.1 - Discovery engines

- [x] Add duplicate-page detection, unresolved-question detection, canon-conflict detection, glossary-gap detection, and orphan-topic detection
- [x] Add topic cluster pages based on links, tags, categories, semantic relations, and content similarity
- [x] Add related trails and “continue reading” modules for article pages
- [x] Add admin actions to resolve duplicates, connect orphans, and seed missing glossary entries
- [x] Add dashboard widgets for discovery opportunities

#### v4.84.2 - Search APIs and plugins

- [x] Stabilize search APIs for plugins, widgets, dashboards, external tools, and future mobile clients
- [x] Add typed search result shapes for articles, categories, tags, discussions, revisions, and marketplace items
- [x] Add query analytics privacy settings and retention policies
- [x] Add webhook events for saved search hits and important content changes
- [x] Add docs for building search-powered plugins

### v4.85 - Editor And Collaboration

#### v4.85.0 - Editor reliability

- [x] Stabilize collaborative editing, draft recovery, offline warnings, autosave repair, paste cleanup, embed handling, and editor performance
- [x] Add recoverable draft snapshots with restore, compare, and discard flows
- [x] Add editor health diagnostics for extension load failures and schema conflicts
- [x] Add large-document performance tests for tables, code blocks, footnotes, images, and wiki links
- [x] Add docs for editor troubleshooting

#### v4.85.1 - Reusable editor controls

- [x] Convert command palette, insert tray, review tray, outline tray, table controls, selection actions, and inspectors into reusable editor components
- [x] Add extension points for plugin commands, toolbar groups, slash commands, and side panels
- [x] Add reusable block templates for callouts, metadata tables, timelines, infoboxes, decision logs, research notes, and worldbuilding entries
- [x] Add keyboard shortcut registry for built-in and plugin commands
- [x] Add UI catalog entries for editor primitives

#### v4.85.2 - Collaboration UX

- [x] Add presence indicators, cursor names, edit conflict warnings, connection status, reconnect states, and last-saved indicators
- [x] Add comment anchors, suggestion mode planning, inline review notes, and resolved thread history
- [x] Add notification routing for mentions, assignments, review changes, and watched article updates
- [x] Add mobile editor QA for common writing and review flows
- [x] Add accessibility tests for editor controls and dialogs

### v4.86 - API, SDK, And Webhooks

#### v4.86.0 - Public API v1 freeze

- [x] Stabilize public REST API v1 for articles, categories, tags, revisions, search, customization, marketplace, plugins, webhooks, exports, and health
- [x] Standardize pagination, sorting, filtering, error responses, rate-limit headers, and permission failures
- [x] Add OpenAPI spec generation and downloadable schema
- [x] Add API contract tests and fixture responses
- [x] Add migration guide for pre-v5 API changes

#### v4.86.1 - SDK types

- [x] Publish SDK-ready TypeScript types for REST payloads, webhook events, customization, marketplace packs, plugin manifests, and export bundles
- [x] Add generated client examples for Node, browser, curl, and webhook consumers
- [x] Add typed API key scopes and docs
- [x] Add sample scripts for backup, import, search, content audit, and webhook testing
- [x] Add API docs examples for every stable endpoint

#### v4.86.2 - Webhook reliability

- [x] Harden webhook signing, retries, delivery logs, redelivery, event filtering, and failure alerts
- [x] Add webhook test sender and local receiver docs
- [x] Add event schemas for article, category, review, claim, export, import, plugin, customization, and user events
- [x] Add webhook replay protection and timestamp validation
- [x] Add webhook regression tests

### v4.87 - Admin Operations

#### v4.87.0 - Operations dashboard

- [x] Add admin operations dashboard for queues, jobs, metrics, slow pages, failed webhooks, imports, exports, plugin errors, and database health
- [x] Add service health cards for database, Prisma, storage, AI providers, webhooks, search, and background jobs
- [x] Add safe diagnostic bundle generation for support
- [x] Add admin alerts and acknowledgement state
- [x] Add docs for operating Arkivel in production

#### v4.87.1 - Maintenance tooling

- [x] Improve maintenance mode, read-only mode, safe upgrades, background task pausing, and health checks
- [x] Add backup reminder and migration readiness checks before upgrades
- [x] Add stale session cleanup, orphaned asset cleanup, failed job cleanup, and webhook retry cleanup
- [x] Add runbook links directly inside admin operations pages
- [x] Add tests for maintenance/read-only API behavior

#### v4.87.2 - Observability plumbing

- [x] Add structured logs for config, auth, Prisma, migrations, assets, search, customization, marketplace, plugins, and webhooks
- [x] Add metrics for page latency, API latency, editor autosave, search response time, export/import duration, and webhook delivery
- [x] Add privacy-aware analytics controls for self-host admins
- [x] Add operational event feed for admins
- [x] Add docs for connecting logs and metrics to external tools

### v4.88 - Performance, Cache, And Offline

#### v4.88.0 - Performance budgets

- [x] Profile article pages, graph surfaces, Studio, Atlas, Trails, search, editor startup, admin dashboards, and marketplace pages
- [x] Add performance budgets for key routes and bundle chunks
- [x] Add large-wiki fixtures for local performance checks
- [x] Add slow-query diagnostics and Prisma query review
- [x] Add docs for performance tuning self-host installs

#### v4.88.1 - Cache strategy

- [x] Add cache invalidation rules for articles, categories, feeds, sitemap, customization, marketplace metadata, plugin manifests, search, and dashboards
- [x] Add admin cache status and manual invalidation tools
- [x] Add stale-cache warnings for editors and admins
- [x] Add tests for cache invalidation on article/category/tag updates
- [x] Document CDN, Vercel, Docker, and reverse-proxy caching recipes

#### v4.88.2 - Offline and PWA

- [x] Improve PWA install, offline reading, cached article lists, stale indicators, retry queues, and mobile startup behavior
- [x] Add offline-safe draft warnings and reconnect guidance
- [x] Add service worker strategy for static assets, article shells, and admin exclusions
- [x] Add mobile QA for offline reading and install prompts
- [x] Add docs for PWA limitations and privacy

### v4.89 - Security And Privacy

#### v4.89.0 - Security review

- [x] Review auth, sessions, API keys, CSRF-sensitive actions, webhooks, imports, file uploads, plugin manifests, marketplace packs, admin routes, and exports
- [x] Harden headers, cookie flags, session expiry, token storage, secret handling, and permission checks
- [x] Add abuse-case tests for route access, draft visibility, API scopes, and plugin permissions
- [x] Add dependency and supply-chain review checklist
- [x] Publish pre-v5 threat model draft

#### v4.89.1 - Privacy controls

- [x] Add privacy controls for public/private spaces, indexing, feeds, exports, analytics, AI features, webhook payloads, and user profiles
- [x] Add data-retention settings for activity, audit logs, query analytics, notifications, sessions, and webhook deliveries
- [x] Add user data export and deletion planning for self-host admins
- [x] Add privacy warnings for AI and external integrations
- [x] Add privacy docs for personal, team, and public deployments

#### v4.89.2 - Secure marketplace and plugins

- [x] Add marketplace pack security checks for remote URLs, executable fields, path traversal, unsafe hooks, and excessive permissions
- [x] Add plugin permission review, blocked permissions, and dangerous capability warnings
- [x] Add pack provenance metadata and checksum verification planning
- [x] Add security docs for local-only extension installation
- [x] Add tests for unsafe pack rejection

### v4.90 - Marketplace Beta

#### v4.90.0 - Marketplace beta launch

- [x] Launch local-first marketplace beta with styles, color themes, layouts, component packs, theme packs, plugin manifests, examples, screenshots, and compatibility badges
- [x] Add marketplace landing metrics, featured packs, recently updated packs, recommended packs, and pack collections
- [x] Add install intent flows that explain required files, env vars, permissions, data access, and manual verification steps
- [x] Add marketplace search by kind, tag, author, slot, layout, permission, and compatibility
- [x] Publish marketplace beta limitations

#### v4.90.1 - Pack lifecycle

- [x] Add pack states for draft, previewed, installed-local, enabled, disabled, deprecated, incompatible, blocked, and removed
- [x] Add pack changelog, update notes, compatibility warnings, and rollback instructions
- [x] Add local pack inventory and health checks
- [x] Add pack screenshots and preview media validation
- [x] Add tests for lifecycle state transitions

#### v4.90.2 - Marketplace authoring

- [x] Add pack author dashboard for local pack validation, metadata preview, screenshot checks, license checks, and docs completeness
- [x] Add pack README generator and checklist
- [x] Add compatibility matrix generator for Arkivel versions
- [x] Add author docs for design quality, accessibility, performance, and security expectations
- [x] Add marketplace submission templates

### v4.91 - Templates And Space Products

#### v4.91.0 - Starter spaces

- [x] Ship complete starter spaces for personal wiki, product docs, team handbook, worldbuilding bible, research notebook, reading archive, project knowledge base, and public documentation
- [x] Include category trees, article templates, sample metadata, tags, infobox fields, navigation, dashboards, and recommended packs
- [x] Add preview pages for each starter space
- [x] Add one-click local import preview for starter templates
- [x] Add tests for template validation and fixture imports

#### v4.91.1 - Template marketplace

- [x] Add template-pack marketplace kind with screenshots, included schema, category tree preview, article template preview, and compatibility notes
- [x] Add template diff before applying to an existing space
- [x] Add template merge options for categories, tags, schemas, and navigation
- [x] Add template export from an existing space
- [x] Add docs for building and sharing space products

#### v4.91.2 - Domain-specific workflows

- [x] Add docs-portal workflow with versions, changelog pages, owners, reviewed dates, and public/private docs controls
- [x] Add team-handbook workflow with policies, acknowledgements, owners, review cycles, and onboarding paths
- [x] Add worldbuilding workflow with canon status, timelines, maps, factions, locations, characters, and continuity checks
- [x] Add research workflow with citations, evidence, confidence, experiments, literature notes, and bibliography exports
- [x] Add personal wiki workflow with inbox, daily notes, reading list, projects, and evergreen notes

### v4.92 - Optional AI Assistant Packs

#### v4.92.0 - AI pack contract

- [x] Convert AI features into opt-in assistant packs with provider, model, privacy, cost, data-retention, prompt scope, and permission metadata
- [x] Add assistant manifest fields for tools, prompts, context sources, output types, limits, and safety notes
- [x] Add admin UI for enabling, disabling, and configuring assistant packs
- [x] Add graceful degradation when no AI provider is configured
- [x] Add docs for local/offline-friendly and privacy-first deployments

#### v4.92.1 - Built-in assistant packs

- [x] Add drafting assistant, summarization assistant, search assistant, claim extraction assistant, taxonomy assistant, alt-text assistant, import cleanup assistant, and review assistant
- [x] Add per-space assistant availability and data access controls
- [x] Add prompt preview and context preview for admins
- [x] Add assistant usage logs and cost estimates
- [x] Add tests for disabled-provider behavior and permission boundaries

#### v4.92.2 - AI governance

- [x] Add privacy warnings, human-review requirements, citation prompts, and confidence metadata for AI outputs
- [x] Add AI audit events for generated content, rewrites, summaries, and taxonomy changes
- [x] Add opt-out controls for private spaces and sensitive articles
- [x] Add docs for responsible AI use in self-hosted knowledge bases
- [x] Add release gate requiring AI to be optional and non-blocking

### v4.93 - Federation And Sync

#### v4.93.0 - Sync manifests

- [x] Define sync manifest for moving spaces between Arkivel installs with source, target, schema, checksums, conflicts, and visibility rules
- [x] Add dry-run sync report for categories, articles, tags, assets, revisions, comments, and customizations
- [x] Add signed snapshot planning for public read replicas and private mirrors
- [x] Add docs for staging-to-production promotion
- [x] Keep network federation out of stable scope unless proven reliable

#### v4.93.1 - Cross-instance references

- [x] Add external Arkivel reference metadata for articles, spaces, sources, and imported snapshots
- [x] Add UI for “imported from” and “mirrored from” provenance
- [x] Add broken external reference diagnostics
- [x] Add public index planning that avoids centralizing private content
- [x] Add tests for external reference rendering and privacy

#### v4.93.2 - Archive and mirror workflows

- [x] Add read-only archive snapshots with preserved revisions, assets, categories, and metadata
- [x] Add private mirror setup docs for teams and personal wikis
- [x] Add export/import workflows for moving selected spaces between installs
- [x] Add conflict resolution notes for repeated syncs
- [x] Add release decision checkpoint for whether federation graduates before v5

### v4.94 - Desktop, Mobile, And PWA Finish

#### v4.94.0 - Mobile polish

- [x] Polish mobile navigation, touch targets, safe areas, article actions, editor trays, admin panels, marketplace pages, and customization previews
- [x] Add responsive QA for every flagship surface and admin page across phone, tablet, laptop, and wide desktop sizes
- [x] Remove visual overlap, text clipping, horizontal overflow, and modal escape issues
- [x] Add mobile-first help screenshots and docs
- [x] Add mobile regression checklist to release docs

#### v4.94.1 - Desktop app research

- [x] Research desktop packaging for local-first deployments, including data storage, updates, backups, and plugin safety
- [x] Add architectural notes for possible Electron/Tauri packaging without committing v5 scope
- [x] Add local-only deployment recipes for Docker Desktop and single-machine installs
- [x] Add file-system import/export UX planning for desktop use
- [x] Add decision record for desktop scope before v5

#### v4.94.2 - Accessibility finish

- [x] Audit keyboard access, focus management, dialogs, dropdowns, table controls, editor controls, admin forms, marketplace filters, and customization previews
- [x] Add screen-reader labels and summaries for graph, atlas, dashboard, marketplace, and editor widgets
- [x] Add high-contrast and reduced-motion checks
- [x] Add accessibility docs and contribution checklist
- [x] Add release gate for known accessibility blockers

### v4.95 - Migration, Backup, And Restore

#### v4.95.0 - Migration readiness

- [x] Add migration dry runs, backup prompts, restore validation, data-integrity checks, and clear failure recovery guidance
- [x] Test upgrade paths from representative v4 installations to the latest beta
- [x] Stabilize Prisma schema changes and document any v5-breaking migration decisions before freeze
- [x] Add schema compatibility reports in admin operations
- [x] Add migration tests for customization, marketplace, plugins, spaces, and templates

#### v4.95.1 - Backup and restore UI

- [x] Add admin backup wizard for database, assets, env vars, marketplace packs, plugin manifests, and customization settings
- [x] Add restore rehearsal mode with manifest verification and conflict report
- [x] Add scheduled backup planning and external storage notes
- [x] Add disaster-recovery drill docs
- [x] Add tests for restore manifest validation

#### v4.95.2 - Upgrade assistant

- [x] Add upgrade readiness checklist for version, Node, Prisma, database, env vars, plugins, marketplace packs, and migrations
- [x] Add pre-upgrade diagnostics and post-upgrade smoke checks
- [x] Add compatibility warnings for deprecated env vars, APIs, plugin permissions, and pack schema versions
- [x] Add in-app links to release notes and migration docs
- [x] Add v5 upgrade planning guide

### v4.96 - Test And Quality Gates

#### v4.96.0 - Test expansion

- [x] Expand unit, integration, API, permission, import/export, customization, marketplace, plugin, editor, and responsive tests
- [x] Add stable fixtures for small wiki, team wiki, public docs, worldbuilding atlas, research notebook, large archive, and plugin-heavy install
- [x] Add CI matrix planning for Node versions, database modes, and feature flags
- [x] Track known warnings and either resolve them or document why they are acceptable for v5.0.0
- [x] Add quality dashboard planning for release managers

#### v4.96.1 - End-to-end smoke suite

- [x] Add smoke tests for install, login, create article, edit article, wiki links, search, customization, marketplace, export, import dry run, plugin manifest, and admin health
- [x] Add responsive smoke tests for homepage, article, editor, dashboard, marketplace, customization, and help pages
- [x] Add fixture seed scripts for repeatable QA
- [x] Add failure screenshots and traces for UI regressions
- [x] Add docs for running smoke tests locally and in CI

#### v4.96.2 - Release gate automation

- [x] Gate release candidates on lint, typecheck, unit tests, API tests, e2e smoke tests, build, migration dry run, and docs sync checks
- [x] Add script to verify package version, changelog, roadmap, docs, and in-app reference pages are aligned
- [x] Add release checklist generation from roadmap gates
- [x] Add known-issues file and release blocker labels
- [x] Add docs for release managers and agents

### v4.97 - Documentation And Onboarding

#### v4.97.0 - Documentation rewrite

- [x] Rewrite install, upgrade, deployment, customization, marketplace, plugin, API, security, backup, and contribution docs for new maintainers
- [x] Add setup paths for Vercel, Docker, local Node, managed Postgres, private team, public docs, personal wiki, and demo instance
- [x] Add troubleshooting pages for database, build, auth, env vars, uploads, plugins, marketplace packs, and migrations
- [x] Add docs IA review so README, help, features, API docs, architecture, design, and roadmap point to each other cleanly
- [x] Add docs tests for broken internal links where practical

#### v4.97.1 - In-app onboarding

- [x] Add first-run setup checklist for database, admin account, branding, style, theme, layout, first space, first article, backup, and security
- [x] Add guided admin onboarding for customization, marketplace, templates, plugins, imports, and users
- [x] Add contextual help panels in admin pages without cluttering core workflows
- [x] Add sample content packs for demo installs
- [x] Add onboarding docs and screenshots

#### v4.97.2 - Example sites and recipes

- [x] Add example configuration recipes for personal wiki, team handbook, public docs, worldbuilding atlas, research library, read-only archive, and product knowledge base
- [x] Add screenshots and environment snippets for each recipe
- [x] Add marketplace and template recommendations per recipe
- [x] Add migration stories from Notion, Obsidian, MediaWiki, Markdown folders, and docs sites
- [x] Publish v5 readiness checklist for self-host admins

### v4.98 - Release Candidate Hardening

#### v4.98.0 - Feature freeze

- [x] Enter feature freeze except for release blockers, documentation gaps, migration fixes, security issues, and broken tests
- [x] Run full install, upgrade, import/export, marketplace, plugin, customization, auth, API, webhook, backup, restore, and smoke rehearsals
- [x] Generate known-issues report and blocker list
- [x] Confirm all v5 release gates have owner, status, and evidence
- [x] Prepare v5 release notes draft

#### v4.98.1 - Release candidate one

- [x] Tag first release candidate after clean lint, typecheck, tests, build, migration dry run, smoke suite, and docs sync
- [x] Validate Vercel, Docker, local Node, and managed Postgres deployment paths
- [x] Validate starter spaces, marketplace packs, plugin examples, exports, imports, backups, and restores
- [x] Run accessibility, performance, security, and privacy checklists
- [x] Publish RC feedback template

#### v4.98.2 - Release candidate fixes

- [x] Fix release-candidate blockers from install, upgrade, auth, data, customization, marketplace, plugins, APIs, webhooks, and docs
- [x] Update compatibility matrix and known-issues notes
- [x] Re-run full gate suite after each blocker fix
- [x] Freeze translation/copy changes except clarity fixes
- [x] Prepare final v5 migration guide

### v4.99 - Final Beta Freeze

#### v4.99.0 - Final beta entry

- [x] Treat v4.99.0 as final beta entry with no new features unless they are required to satisfy release gates
- [x] Freeze public API v1, plugin manifest schema, marketplace pack schema, theme pack schema, export bundle schema, and stable env vars
- [x] Verify all docs and in-app reference pages describe beta-to-stable upgrade expectations
- [x] Start final security, privacy, accessibility, and migration reviews
- [x] Publish final beta release notes

#### v4.99.1 - Gate evidence pass

- [x] Attach evidence for every stable gate: tests, docs, screenshots, migration reports, security notes, and deployment checks
- [x] Close or explicitly defer non-blocking roadmap items
- [x] Confirm all breaking changes are documented and justified
- [x] Confirm self-host install paths have restore guidance
- [x] Confirm docs/version discipline has no gaps

#### v4.99.2 - Compatibility pass

- [x] Validate compatibility for Node, Next.js, Prisma, PostgreSQL, Vercel, Docker, local Node, plugin manifests, marketplace packs, and export bundles
- [x] Validate upgrade from representative v4 versions
- [x] Validate rollback or recovery paths for failed upgrades
- [x] Validate public/private visibility across all public surfaces
- [x] Validate API and webhook compatibility examples

#### v4.99.90 - Final documentation correction window

- [x] Reserve for final README, roadmap, changelog, API docs, help, features, design, architecture, contributing, and agent instruction corrections
- [x] Update screenshots, examples, recipes, and migration guide where needed
- [x] Remove stale beta-only claims that are no longer true
- [x] Confirm v5.0.0 release notes are ready
- [x] Make no product behavior changes unless release-blocking

#### v4.99.95 - Final security and migration correction window

- [x] Reserve for security, migration, backup, restore, permission, and privacy corrections only
- [x] Re-run security and privacy checklists after changes
- [x] Re-run migration dry runs and restore rehearsals after changes
- [x] Update known issues and upgrade guidance
- [x] Make no marketplace/plugin schema changes unless release-blocking

#### v4.99.99 - Last beta candidate

- [x] Reserve as the last beta release candidate before v5.0.0
- [x] Require clean lint, typecheck, tests, build, migration dry run, smoke suite, docs sync, security review, privacy review, and release notes
- [x] Require maintainers to sign off on auth, data, customization, marketplace, plugins, API, operations, docs, and upgrade gates
- [x] Tag v5.0.0 from the exact codebase unless a release blocker is found
- [x] If a blocker is found, fix it in another v4.99.x patch and repeat the gate

### v5.0.0 - Stable Release Gate

- [x] Auth, roles, sessions, API keys, and permission boundaries are audited and covered by tests
- [x] Database migrations, backup/restore, imports, exports, and upgrades have documented recovery paths
- [x] Customization, marketplace metadata, theme packs, layout presets, component packs, and plugin manifest contracts are stable
- [x] Public API v1, webhooks, feeds, and SDK types have compatibility commitments
- [x] Admin operations, observability, security, and privacy docs are complete enough for self-host operators
- [x] README, DESIGN, ARCHITECTURE, ROADMAP, CHANGELOG, AGENTS, CONTRIBUTING, API docs, help docs, feature docs, and in-app reference pages are synchronized

## v4.77.1

- [x] Pack import preview - `/admin/marketplace` now accepts pasted JSON or uploaded JSON for theme packs, layout packs, component packs, and plugin manifests without installing anything
- [x] Parsed import report - previews show metadata, required files, required env vars, permissions, hooks, routes, widgets, settings, and compatibility warnings
- [x] Theme token diff - imported theme-pack tokens are compared against the built-in sample pack so admins can review added, changed, removed, and unchanged values
- [x] Import security checks - executable fields, remote code references, path traversal, unsafe permissions, malformed JSON, unsupported kinds, and unsupported schema versions are blocked
- [x] API and tests - `/api/customization` exposes the import-preview contract and examples, while unit tests cover valid examples and rejected unsafe payloads

## v4.77.0

- [x] Versioned local registry - marketplace listings now expose stable id, kind, version, compatibility, author, license, source, status, screenshot, and checksum metadata from `src/lib/marketplace.ts`
- [x] Registry validation - duplicate ids, unsupported kinds, incompatible versions, missing screenshots, unsafe plugin permissions, invalid licenses, missing checksums, and remote sources are reported before catalog data is trusted
- [x] Marketplace health panel - `/admin/marketplace` shows registry version, schema version, local source, item totals, validation status, kind counts, and issue details
- [x] Marketplace API metadata - `/api/customization` now returns registry version, schema version, catalog source, supported kinds, supported licenses, registry contract, and validation summary
- [x] Registry tests - marketplace unit tests cover every item kind and the v4.77.0 validation failure modes

## v4.76.3

- [x] Studio accessibility polish - `/admin/customization` now has roving keyboard tabs, ARIA tab/panel wiring, labelled preview regions, live screen-reader summary text, and stronger focus-visible styling
- [x] Responsive QA checklist - Preview now includes mobile, tablet, laptop, and wide-desktop review checkpoints for customization layouts
- [x] Polish diagnostics - diagnostics now warn about one-note palettes, dark-theme contrast review, and custom brand asset size review before deployment
- [x] Reusable UI primitives - the shared UI catalog now documents tab, stat, switch, and screen-reader-only primitives used by the studio
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, design/architecture notes, help docs, feature docs, in-app reference pages, and tests describe the accessibility/polish release

## v4.76.2

- [x] Browser-local customization drafts - `/admin/customization` now includes a Drafts tab backed by localStorage so admins can save and reload preview combinations without runtime overrides
- [x] Named starter presets - personal wiki, team handbook, docs portal, worldbuilding atlas, research notebook, and read-only archive presets quickly reshape brand, layout, theme, and feature draft values
- [x] Active-vs-draft diff - admins can compare active environment-derived values against the current draft before copying deployment output
- [x] Reset confirmations - reset-to-active and reset-to-default actions require a confirm click so draft experiments are not lost accidentally
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, design/architecture notes, help docs, feature docs, in-app reference pages, and tests describe the drafts release

## v4.76.1

- [x] Customization diagnostics - `/admin/customization` now includes a Diagnostics tab with pass, warning, and error checks for deploy-ready customization values
- [x] Asset and env validation - brand logo, logo mark, app icon, base URL, style, color theme, layout, alternate palette, and map-image readiness are checked before copying deployment config
- [x] Support export - admins can download a diagnostics JSON report for support requests, GitHub issues, or release reviews
- [x] Reusable diagnostics helper - `src/lib/customization-diagnostics.ts` centralizes report generation with unit coverage for valid drafts, invalid env values, unknown presets, and planned layouts
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, design/architecture notes, help docs, feature docs, and in-app reference pages describe the diagnostics release

## v4.76.0

- [x] Customization Studio workbench - `/admin/customization` now uses Brand, Appearance, Features, Preview, Output, and Packs tabs for env-first customization planning
- [x] Brand draft controls - admins can preview site name, tagline, description, welcome text, footer text, logo, mark, app icon, base URL, and feature flags without writing runtime overrides
- [x] Deployment output modes - copy-ready `.env`, `.env.local`, Vercel, and Docker Compose formats now share the same draft values and source map
- [x] Preview panels - homepage, article reader, editor, dashboard, marketplace, and mobile shell previews show the selected style, color theme, layout, and brand copy
- [x] Documentation/version discipline - package metadata, changelog, roadmap, README, help docs, feature docs, and in-app reference pages describe the studio foundation release

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
