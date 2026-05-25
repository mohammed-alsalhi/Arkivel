# In-app Onboarding

Arkivel v4.97.1 defines the in-app onboarding contract for self-host admins and new maintainers. The implementation is intentionally metadata-first so the first-run UI, admin panels, and setup docs can share one checklist without duplicating release guidance.

## Contract

- API: `/api/in-app-onboarding`
- Customization manifest key: `inAppOnboarding`
- Schema: `arkivel.in-app-onboarding.v1`
- Test coverage: `src/lib/__tests__/in-app-onboarding.test.ts`

## First-run Checklist

The first-run checklist covers:

- `database` - confirm the database URL, adapter, and migration posture.
- `admin-account` - create or verify the first administrator.
- `branding` - set product name, tagline, logos, and footer copy.
- `style` - choose the built-in style preset.
- `theme` - choose the color theme and dark-mode behavior.
- `layout` - choose the layout preset for the instance shape.
- `first-space` - create the first space or category tree.
- `first-article` - create the first useful article.
- `backup` - configure backup cadence and restore rehearsal ownership.
- `security` - review secrets, public/private visibility, plugin safety, and API keys.

`database`, `admin-account`, `backup`, and `security` are marked as stable-release-required because a self-host install should not reach v5 without those basics in place.

## Guided Admin Setup

Admin onboarding guides should exist for:

- `customization` - connect branding, style, theme, layout, and `.env` output.
- `marketplace` - explain local-first packs, preview-only imports, compatibility, and safety.
- `templates` - help admins choose starter spaces and domain workflows.
- `plugins` - describe trusted local plugin manifests, permissions, and audit events.
- `imports` - link import rehearsals, portable bundles, restore points, and dry-run conflicts.
- `users` - explain roles, invitations, API keys, and admin recovery.

## Contextual Help

Contextual help panels should stay collapsed by default and live near the workflow they explain. The v4.97.1 plan covers `/admin`, `/admin/customization`, `/admin/marketplace`, `/space-templates`, `/admin/plugins`, `/admin/maintenance`, and `/admin/users` without adding persistent instructional copy to the primary workflow.

## Sample Content Pack

The demo content pack is `demo-starter-knowledge-base` at `examples/onboarding/demo-content-pack.json`. It includes starter categories and four small articles for demo installs:

- Welcome to Arkivel
- First Space Checklist
- Backup And Restore Notes
- Marketplace Preview Notes

The pack is a fixture for setup flows and screenshots, not an automatic import. Import-capable flows should still run a dry-run preview before writing content.

## Screenshot Checkpoints

Capture these checkpoints for release notes and onboarding docs:

- `first-run-checklist`
- `admin-guided-setup`
- `contextual-help-panel`
- `demo-content-pack-preview`

Store screenshots beside release evidence or docs artifacts for the candidate being verified. Keep them current when labels, routes, or first-run steps change.
