import { config } from "@/lib/config";
import {
  CodeBlock,
  DataTable,
  InlineCode,
  Notice,
  Page,
  PageHeader,
  Section,
} from "@/components/ui";

export default function ApiDocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <Page>
      <PageHeader title={`${config.name} API Documentation`} />

      <Notice className="mb-4">
        <strong>Authentication:</strong> All API v1 endpoints require an API key
        passed in the <InlineCode>X-API-Key</InlineCode> header.
        API keys can be managed from your user account settings. The frozen v1 contract is available at
        {" "}<InlineCode>/api/v1/contract</InlineCode> and the OpenAPI schema at{" "}
        <InlineCode>/api/v1/openapi.json</InlineCode>.
      </Notice>

      <div className="text-[13px] space-y-6">
        {/* Base URL */}
        <Section title="Base URL">
          <CodeBlock>{baseUrl}/api/v1</CodeBlock>
          <p className="mt-2 text-muted">
            v1 responses include <InlineCode>X-Arkivel-API-Version</InlineCode>,{" "}
            <InlineCode>X-Arkivel-API-Schema</InlineCode>, and rate-limit compatibility headers.
            See <InlineCode>docs/api-v1-migration.md</InlineCode> for pre-v5 client guidance and{" "}
            <InlineCode>/api/v1/sdk</InlineCode> for SDK-ready type, scope, example, and script metadata.
          </p>
        </Section>

        {/* Articles */}
        <Section title="Articles">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/articles</h3>
          <p className="text-muted mb-2">
            List published articles with pagination and optional filters.
          </p>

          <DataTable className="mb-3 text-[12px]">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">page</td>
                <td>integer</td>
                <td>Page number (default: 1)</td>
              </tr>
              <tr>
                <td className="font-mono">limit</td>
                <td>integer</td>
                <td>Items per page, max 100 (default: 20)</td>
              </tr>
              <tr>
                <td className="font-mono">category</td>
                <td>string</td>
                <td>Filter by category slug</td>
              </tr>
              <tr>
                <td className="font-mono">tag</td>
                <td>string</td>
                <td>Filter by tag slug</td>
              </tr>
            </tbody>
          </DataTable>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/articles?page=1&limit=10&category=people"`}
          </CodeBlock>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <CodeBlock>
{`{
  "articles": [
    {
      "title": "Example Article",
      "slug": "example-article",
      "excerpt": "A brief description...",
      "content": "<p>HTML content...</p>",
      "category": { "name": "People", "slug": "people" },
      "tags": [{ "name": "History", "slug": "history" }],
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}`}
          </CodeBlock>
        </Section>

        {/* Search */}
        <Section title="Search">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/search</h3>
          <p className="text-muted mb-2">
            Search articles by title and content. Multi-word queries use AND logic.
          </p>

          <DataTable className="mb-3 text-[12px]">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">q</td>
                <td>string</td>
                <td>Search query (min 2 characters)</td>
              </tr>
              <tr>
                <td className="font-mono">limit</td>
                <td>integer</td>
                <td>Max results, max 100 (default: 20)</td>
              </tr>
            </tbody>
          </DataTable>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/search?q=kingdom&limit=5"`}
          </CodeBlock>
        </Section>

        {/* Categories */}
        <Section title="Categories">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/categories</h3>
          <p className="text-muted mb-2">
            List all categories with article counts and parent info.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/categories"`}
          </CodeBlock>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <CodeBlock>
{`{
  "categories": [
    {
      "name": "People",
      "slug": "people",
      "description": null,
      "icon": "person",
      "sortOrder": 0,
      "parent": null,
      "articleCount": 15,
      "childCount": 3
    }
  ]
}`}
          </CodeBlock>
        </Section>

        {/* Tags */}
        <Section title="Tags">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/tags</h3>
          <p className="text-muted mb-2">
            List all tags with article counts.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/tags"`}
          </CodeBlock>
        </Section>

        {/* Feeds */}
        <Section title="RSS / Atom Feeds">
          <p className="text-muted mb-2">
            Public feeds are available without authentication:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>RSS 2.0:</strong>{" "}
              <InlineCode>/feed.xml</InlineCode>
            </li>
            <li>
              <strong>Atom:</strong>{" "}
              <InlineCode>/feed/atom</InlineCode>
            </li>
          </ul>
        </Section>

        {/* Stats */}
        <Section title="Statistics">

          <h3 className="font-semibold mt-3 mb-1">GET /api/stats</h3>
          <p className="text-muted mb-2">
            Get wiki-wide statistics. No authentication required.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl "${baseUrl}/api/stats"`}
          </CodeBlock>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <CodeBlock>
{`{
  "articles": 42,
  "categories": 6,
  "tags": 15,
  "users": 3,
  "revisions": 128,
  "discussions": 24,
  "recentEditsThisWeek": 12
}`}
          </CodeBlock>
        </Section>

        {/* Sitemap */}
        <Section title="Sitemap & SEO">
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>
              <strong>Sitemap:</strong>{" "}
              <InlineCode>/sitemap.xml</InlineCode> &mdash; Dynamic sitemap with all articles and categories
            </li>
            <li>
              <strong>Robots:</strong>{" "}
              <InlineCode>/robots.txt</InlineCode> &mdash; Crawler instructions
            </li>
            <li>
              <strong>API Sitemap:</strong>{" "}
              <InlineCode>/api/sitemap</InlineCode> &mdash; XML sitemap via API route
            </li>
          </ul>
        </Section>

        {/* Operational feeds */}
        <Section title="Operational Feeds">
          <p className="text-muted mb-2">
            These app feeds are designed for dashboards, demos, and local automation.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>
              <InlineCode>GET /api/studio</InlineCode> — Arkivel Studio summary, generated board nodes, graph edges, base views, and action queue
            </li>
            <li>
              <InlineCode>GET /api/studio/canvas</InlineCode> — JSON Canvas export of the generated Studio board
            </li>
            <li>
              <InlineCode>GET /api/atlas</InlineCode> — Canon Atlas territories, signals, threads, dossier, continuity pressure, and next moves
            </li>
            <li>
              <InlineCode>GET /api/trails</InlineCode> — Canon Trails guided routes, stop reasons, reading estimates, word totals, and link totals
            </li>
            <li>
              <InlineCode>GET /api/intelligence</InlineCode> — Knowledge cockpit score, radar, constellation, pressure model, engines, and action queue
            </li>
            <li>
              <InlineCode>GET /api/customization</InlineCode> — Public self-host manifest for grouped customization, supported env vars, style presets, color themes, layouts, layout composition hooks, reusable UI components including editor primitives and accessibility primitives, collaboration UX metadata, offline/PWA metadata, mobile polish metadata, desktop research metadata, accessibility finish metadata, migration readiness metadata, backup/restore metadata, upgrade assistant metadata, test quality gates metadata, e2e smoke suite metadata, release gate automation metadata, documentation onboarding metadata, in-app onboarding metadata, example site recipe metadata, feature freeze metadata, release candidate one metadata, final release gate metadata, security review metadata, privacy controls metadata, marketplace security metadata, marketplace beta metadata, marketplace lifecycle metadata, marketplace authoring metadata, template marketplace metadata, sync manifest metadata, external reference metadata, archive mirror metadata, component slot contracts, plugin manifest schema/examples/compatibility matrix, trusted local plugin loader metadata, plugin manifests, theme packs, template packs, marketplace registry/import-preview metadata, status vocabulary, detail/copy metadata, validation summaries, persisted space customization contracts, migration guidance, and theme hooks
            </li>
            <li>
              <InlineCode>GET /api/plugins</InlineCode> / <InlineCode>PUT /api/plugins</InlineCode> — Admin-only plugin review and enablement API with loader status, permission prompts, health metadata, compatibility, routes, widgets, hooks, load errors, and audit-backed enable/disable changes
            </li>
            <li>
              <InlineCode>npm run plugin:validate</InlineCode> — Local plugin author CLI for validating <InlineCode>plugin.json</InlineCode> and listing supported permissions, hooks, webhook events, schema fields, and compatibility metadata
            </li>
            <li>
              <InlineCode>portableBundle</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Pre-v5 full-site bundle contract with manifest fields, checksums, export scope, privacy filters, dry-run import report groups, and compatibility promises
            </li>
            <li>
              <InlineCode>GET /api/export/history</InlineCode> — Admin-only export history report with manifest, checksum, warning, omitted-data, file-count, byte-count, format, status, and scope metadata; add <InlineCode>?download=1</InlineCode> for a downloadable JSON report
            </li>
            <li>
              <InlineCode>GET /api/import/rehearsal</InlineCode> / <InlineCode>POST /api/import/rehearsal</InlineCode> — No-write import rehearsal contract with conflict categories, recommended actions, blocked changes, rollback plans, and fixture profiles
            </li>
            <li>
              <InlineCode>GET /api/articles</InlineCode>, <InlineCode>GET /api/search</InlineCode>, <InlineCode>GET /api/categories</InlineCode>, and <InlineCode>GET /api/tags</InlineCode> — Accept <InlineCode>workspaceId</InlineCode>, <InlineCode>wikiId</InlineCode>, or <InlineCode>X-Arkivel-Workspace</InlineCode> scoping, plus <InlineCode>includeGlobal=1</InlineCode> during single-workspace migration
            </li>
            <li>
              <InlineCode>GET /api/wikis/:id/invitations</InlineCode> / <InlineCode>POST /api/wikis/:id/invitations</InlineCode> — Workspace admin invitation review and creation for viewer/editor/admin roles
            </li>
            <li>
              <InlineCode>PATCH /api/wikis/:id/invitations</InlineCode> — Resend or revoke workspace invitations with 14-day expiration refreshes and audit events
            </li>
            <li>
              <InlineCode>roleTemplates</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Role template contract and permission matrix for pages, APIs, exports, webhooks, plugins, customization, marketplace actions, API-key behavior, and recovery guidance
            </li>
            <li>
              <InlineCode>collaborationControls</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Workspace-aware policy for co-authors, edit locks, review assignments, comments, mentions, notifications, activity digests, contribution summaries, and public visibility checks
            </li>
            <li>
              <InlineCode>editorialGovernance</InlineCode> in <InlineCode>GET /api/customization</InlineCode> and <InlineCode>GET /api/admin/editorial-governance/summary</InlineCode> — Review due dates, required reviewers, approval thresholds, claim queues, verification stamps, ownership paths, release blockers, and editorial risk summaries
            </li>
            <li>
              <InlineCode>GET /api/admin/audit-log</InlineCode> and <InlineCode>auditTrail</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Actor, action, target, workspace, severity, success, and date filters plus downloadable JSON exports with summary, standard, strict, or full redaction
            </li>
            <li>
              <InlineCode>moderation</InlineCode> in <InlineCode>GET /api/customization</InlineCode>, <InlineCode>PATCH /api/articles/:id/discussions</InlineCode>, and <InlineCode>PATCH /api/suggestions/:id</InlineCode> — Discussion reports/reviewer visibility plus suggestion accept, reject, comment, assign, and convert-to-task actions with anti-spam metadata
            </li>
            <li>
              <InlineCode>GET /api/search?explain=1</InlineCode> and <InlineCode>searchRelevance</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Relevance v2 facets, weights, synonyms, aliases, redirects, stemming, stale/review/verification signals, and admin-only score explanations
            </li>
            <li>
              <InlineCode>GET /api/search/contract</InlineCode> and <InlineCode>searchApi</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Stable typed result shapes for articles, categories, tags, discussions, revisions, and marketplace items plus query privacy, retention, and webhook event planning
            </li>
            <li>
              <InlineCode>GET /api/discovery</InlineCode> and <InlineCode>discoveryEngines</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Duplicate-page, unresolved-question, canon-conflict, glossary-gap, orphan-topic, topic-cluster, continue-reading, admin-action, and dashboard-widget discovery reports
            </li>
            <li>
              <InlineCode>GET</InlineCode> / <InlineCode>PUT</InlineCode> / <InlineCode>DELETE /api/articles/:id/snapshots</InlineCode> and <InlineCode>editorReliability</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Snapshot read/compare/restore/discard flows plus draft recovery, editor diagnostics, and large-document fixture metadata
            </li>
            <li>
              <InlineCode>editorControls</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Reusable editor primitive metadata, plugin command/toolbar/slash/side-panel extension points, shared block templates, and shortcut scope registry
            </li>
            <li>
              <InlineCode>collaborationUx</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Live editing connection states, presence-name requirements, conflict/reconnect copy, inline review planning, notification routing, mobile editor QA, and accessibility checkpoints
            </li>
            <li>
              <InlineCode>GET /api/v1/contract</InlineCode>, <InlineCode>GET /api/v1/openapi.json</InlineCode>, and <InlineCode>publicApiV1</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Frozen pre-v5 endpoint metadata, OpenAPI schema, standard headers/errors, fixture responses, and migration guide references
            </li>
            <li>
              <InlineCode>GET /api/v1/sdk</InlineCode> and <InlineCode>sdkTypes</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — SDK-ready TypeScript payload names, API key scopes, generated client snippets, and sample script metadata for every stable v1 surface
            </li>
            <li>
              <InlineCode>POST /api/webhooks/test</InlineCode>, <InlineCode>POST /api/webhooks/deliveries/:id/redeliver</InlineCode>, and <InlineCode>webhookReliability</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Timestamped signatures, retry policy, delivery logs, event schemas, replay protection, and local receiver guidance
            </li>
            <li>
              <InlineCode>GET /api/admin/operations</InlineCode>, <InlineCode>GET /api/admin/operations?bundle=1</InlineCode>, and <InlineCode>operationsDashboard</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Admin service health, queues, slow pages, failed webhooks/imports/exports/plugins, alerts, acknowledgements, and redacted diagnostic bundle metadata
            </li>
            <li>
              <InlineCode>GET /api/admin/maintenance/report</InlineCode>, <InlineCode>POST /api/admin/maintenance/report</InlineCode>, and <InlineCode>maintenanceTooling</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Safe-upgrade checks, backup reminders, background task pause state, cleanup queues, and runbook metadata
            </li>
            <li>
              <InlineCode>GET /api/admin/observability</InlineCode>, <InlineCode>POST /api/admin/observability</InlineCode>, <InlineCode>POST /api/observability/metrics</InlineCode>, and <InlineCode>observability</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Structured event feed, metric ingestion, privacy controls, and external collector metadata
            </li>
            <li>
              <InlineCode>GET /api/admin/performance</InlineCode> and <InlineCode>performanceBudgets</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Route p95, interaction, and bundle budgets, large-wiki fixtures, slow samples, and slow-query review metadata
            </li>
            <li>
              <InlineCode>GET /api/admin/cache</InlineCode>, <InlineCode>POST /api/admin/cache</InlineCode>, and <InlineCode>cacheStrategy</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Cache invalidation rules, manual invalidation, stale warnings, Redis status, and deployment recipes
            </li>
            <li>
              <InlineCode>GET /api/offline/contract</InlineCode> and <InlineCode>offlinePwa</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Install metadata, service-worker cache rules, offline reading fallback, stale headers, retry queue limits, mobile QA checkpoints, draft warnings, and privacy limits
            </li>
            <li>
              <InlineCode>GET /api/mobile-polish</InlineCode> and <InlineCode>mobilePolish</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Phone, tablet, laptop, and wide desktop QA checkpoints, touch targets, safe-area checks, overflow/clipping guardrails, dialog bounds, and mobile screenshot slots
            </li>
            <li>
              <InlineCode>GET /api/desktop-research</InlineCode> and <InlineCode>desktopResearch</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Electron, Tauri, browser PWA, and Docker Desktop research, local deployment recipes, filesystem import/export UX, and research-only desktop scope decision
            </li>
            <li>
              <InlineCode>GET /api/accessibility</InlineCode> and <InlineCode>accessibilityFinish</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Keyboard/focus/dialog/dropdown/control audit matrix, graph/atlas/dashboard/marketplace/editor screen-reader summaries, high-contrast and reduced-motion checks, contribution checklist, and v5 blocker gate
            </li>
            <li>
              <InlineCode>GET /api/migration-readiness</InlineCode> and <InlineCode>migrationReadiness</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Blocking migration dry runs, backup prompts, schema compatibility reports, data-integrity checks, restore validation, representative v4 upgrade paths, and failure recovery guidance
            </li>
            <li>
              <InlineCode>GET /api/backup-restore</InlineCode> and <InlineCode>backupRestore</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Admin backup wizard sections, restore rehearsal manifest verification, conflict reports, scheduled backup planning, external storage notes, and disaster-recovery drill guidance
            </li>
            <li>
              <InlineCode>GET /api/upgrade-assistant</InlineCode> and <InlineCode>upgradeAssistant</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — v5 readiness checklist, pre-upgrade diagnostics, post-upgrade smoke checks, compatibility warnings, and release-note/migration doc links
            </li>
            <li>
              <InlineCode>GET /api/test-quality</InlineCode> and <InlineCode>testQualityGates</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Expanded test surfaces, stable QA fixtures, CI matrix planning, known-warning policy, and release-manager quality dashboard planning
            </li>
            <li>
              <InlineCode>GET /api/e2e-smoke-suite</InlineCode>, <InlineCode>e2e/smoke-suite.spec.ts</InlineCode>, and <InlineCode>e2eSmokeSuite</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Product smoke flows, responsive smoke routes, repeatable fixture seeding, and Playwright screenshot/trace failure artifacts
            </li>
            <li>
              <InlineCode>GET /api/release-gates</InlineCode>, <InlineCode>scripts/verify-docs-sync.mjs</InlineCode>, and <InlineCode>releaseGateAutomation</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Release candidate gates, docs sync verification, checklist metadata, known issues, and blocker labels
            </li>
            <li>
              <InlineCode>GET /api/documentation-onboarding</InlineCode> and <InlineCode>documentationOnboarding</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Maintainer docs, setup paths, troubleshooting topics, docs IA review, and practical internal-link test metadata
            </li>
            <li>
              <InlineCode>GET /api/in-app-onboarding</InlineCode> and <InlineCode>inAppOnboarding</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — First-run checklist, guided admin setup topics, contextual help panel plan, demo content pack, and screenshot checkpoint metadata
            </li>
            <li>
              <InlineCode>GET /api/example-site-recipes</InlineCode> and <InlineCode>exampleSiteRecipes</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Example setup recipes, env snippets, screenshot targets, pack recommendations, migration stories, and v5 readiness checklist metadata
            </li>
            <li>
              <InlineCode>GET /api/release-freeze</InlineCode> and <InlineCode>featureFreeze</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Feature-freeze policy, full rehearsal matrix, blocker labels, v5 gate ownership, and release-note draft metadata
            </li>
            <li>
              <InlineCode>GET /api/release-candidate-one</InlineCode> and <InlineCode>releaseCandidateOne</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — RC1 gate evidence, deployment validation, starter and pack validation areas, review checklists, and feedback-template metadata
            </li>
            <li>
              <InlineCode>GET /api/final-release-gates</InlineCode> and <InlineCode>finalReleaseGates</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — RC fixes, final beta freeze contracts, gate evidence, compatibility targets, correction windows, and stable v5 release gates
            </li>
            <li>
              <InlineCode>GET /api/security/review</InlineCode> and <InlineCode>securityReview</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Browser security headers, reviewed auth/API/plugin/export surfaces, abuse-case gates, supply-chain checklist, and pre-v5 threat-model draft
            </li>
            <li>
              <InlineCode>GET /api/privacy/controls</InlineCode> and <InlineCode>privacyControls</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Deployment-mode privacy controls, retention settings, user data lifecycle planning, and AI/external integration warnings
            </li>
            <li>
              <InlineCode>GET /api/marketplace/security</InlineCode> and <InlineCode>marketplaceSecurity</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Unsafe pack rejection metadata, blocked permissions/hooks, dangerous plugin capability warnings, provenance requirements, and local-only installation guidance
            </li>
            <li>
              <InlineCode>GET /api/marketplace/beta</InlineCode> and <InlineCode>marketplaceBeta</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Local-first beta metrics, featured/recent/recommended packs, collections, compatibility badges, search facets, install-intent steps, and beta limitations
            </li>
            <li>
              <InlineCode>GET /api/marketplace/lifecycle</InlineCode> and <InlineCode>marketplaceLifecycle</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Pack states, allowed transitions, inventory metadata, health checks, preview media validation, update metadata, compatibility warnings, and rollback guidance
            </li>
            <li>
              <InlineCode>GET /api/marketplace/authoring</InlineCode> and <InlineCode>marketplaceAuthoring</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Pack author dashboard sections, local validation, metadata preview, screenshot checks, license checks, docs completeness, README generation, compatibility matrix rows, quality checklist, and submission templates
            </li>
            <li>
              <InlineCode>GET /api/marketplace/templates</InlineCode> and <InlineCode>templateMarketplace</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Template-pack listings, included schema, category and article previews, compatibility notes, diff/merge contracts, and export-from-space fixture output
            </li>
            <li>
              <InlineCode>GET /api/sync-manifests</InlineCode> and <InlineCode>syncManifests</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Source/target sync manifests, section checksums, dry-run reports, visibility rules, signed snapshot planning, staging promotion guidance, and the network-federation release gate
            </li>
            <li>
              <InlineCode>GET /api/external-references</InlineCode> and <InlineCode>externalReferences</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — External Arkivel reference metadata, imported/mirrored provenance labels, diagnostics, and public index planning that excludes private content
            </li>
            <li>
              <InlineCode>GET /api/archive-mirrors</InlineCode> and <InlineCode>archiveMirrors</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Read-only archive snapshots, private mirror setup, selected-space transfer workflows, repeated-sync conflict notes, and the pre-v5 federation decision checkpoint
            </li>
            <li>
              <InlineCode>GET /api/categories/:id/customization</InlineCode> / <InlineCode>GET /api/articles/:id/customization</InlineCode> — Public resolved customization reads for space and article overrides; admin-only <InlineCode>PUT</InlineCode> requests validate and save overrides while public responses hide private draft config
            </li>
            <li>
              <InlineCode>GET /api/space-templates</InlineCode> / <InlineCode>POST /api/space-templates</InlineCode> — Preview-safe starter space registry plus preview pages, JSON preview/import validation, one-click local import preview by template id, category trees, starter articles, sample metadata, tags, infobox fields, navigation, dashboards, layout, and recommended packs
            </li>
            <li>
              <InlineCode>GET /api/space-workflows</InlineCode> and <InlineCode>domainWorkflows</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Docs portal, team handbook, worldbuilding, research, and personal wiki workflow controls, steps, starter template links, and release gates
            </li>
            <li>
              <InlineCode>GET /api/assistant-packs</InlineCode> and <InlineCode>assistantPacks</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Opt-in built-in AI packs for drafting, summarization, search, claim extraction, taxonomy, alt-text, import cleanup, and review with per-space availability, prompt/context previews, usage logs, cost estimates, permissions, safety, admin route, and graceful fallback metadata
            </li>
            <li>
              <InlineCode>GET /api/assistant-packs/governance</InlineCode> and <InlineCode>assistantGovernance</InlineCode> in <InlineCode>GET /api/customization</InlineCode> — Privacy warnings, human-review requirements, citation prompts, confidence metadata, AI audit events, private/sensitive opt-outs, and optional/non-blocking release gate
            </li>
            <li>
              <InlineCode>GET /api/categories/:id/governance</InlineCode> / <InlineCode>PUT /api/categories/:id/governance</InlineCode> — Resolved space governance for owner, reviewer, visibility, review cadence, stale-page threshold, and health signals; writes are admin-only and audit logged
            </li>
            <li>
              <InlineCode>GET /api/admin/space-governance/summary</InlineCode> — Admin-only space governance dashboard summary with inherited badges and health widgets
            </li>
          </ul>
        </Section>

        {/* Errors */}
        <Section title="Error Responses">
          <p className="text-muted mb-2">
            All errors return a JSON object with an <InlineCode>error</InlineCode> field:
          </p>
          <CodeBlock>
{`// 401 Unauthorized
{ "error": "Invalid or missing API key. Include X-API-Key header." }

// 400 Bad Request
{ "error": "Description of what went wrong" }

// 404 Not Found
{ "error": "Resource not found" }`}
          </CodeBlock>

          <DataTable className="mt-3 text-[12px]">
            <thead>
              <tr>
                <th>Status Code</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">200</td>
                <td>Success</td>
              </tr>
              <tr>
                <td className="font-mono">400</td>
                <td>Bad Request (missing or invalid parameters)</td>
              </tr>
              <tr>
                <td className="font-mono">401</td>
                <td>Unauthorized (missing or invalid API key)</td>
              </tr>
              <tr>
                <td className="font-mono">404</td>
                <td>Not Found</td>
              </tr>
              <tr>
                <td className="font-mono">500</td>
                <td>Internal Server Error</td>
              </tr>
            </tbody>
          </DataTable>
        </Section>
      </div>
    </Page>
  );
}
