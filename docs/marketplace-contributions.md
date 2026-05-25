# Marketplace Contributions

Arkivel's marketplace is local-first and preview-safe during the v4 beta. Contributions should be reviewable metadata, examples, screenshots, and documentation. They must not require remote code execution, install scripts, network fetches, or hidden build steps.

## Supported pack types

- **Style packs:** visual skin metadata that maps to CSS variables and `html[data-style="..."]` hooks.
- **Color themes:** palette metadata that maps to CSS variables and `html[data-color-theme="..."]` hooks.
- **Layout packs:** shell and page-composition metadata that maps to `html[data-layout="..."]` hooks.
- **Component packs:** reusable component-slot metadata for future slot registration.
- **Plugin manifests:** declarative plugin metadata for trusted local plugins; no executable payloads in marketplace previews.
- **Template packs:** shareable space products with category tree previews, article template previews, included schema, compatibility notes, diff/merge guidance, and export metadata.

## Required files

Each submission should include:

- `README.md` with purpose, audience, screenshots, compatibility notes, configuration, accessibility notes, and testing notes.
- `manifest.json` with stable `id`, `kind`, semantic `version`, `compatibility`, `author`, `license`, `status`, `source`, `screenshots`, `checksums`, and tags.
- `screenshots/` with local preview assets or placeholder notes until final assets exist.
- `tests/README.md` describing validation, accessibility, contrast, responsive, and import-preview checks.

Use the examples in `examples/marketplace/` as starting points.

The authoring contract at `/api/marketplace/authoring` publishes local validation, metadata preview, screenshot checks, license checks, docs completeness, README generation, compatibility matrix output, and submission template references for pack authors.

## Naming and versions

- Use lowercase kebab-case ids, for example `docs-portal-style` or `research-notebook-layout`.
- Prefix broad families consistently, such as `docs-*`, `team-*`, `atlas-*`, or `research-*`.
- Use semantic versions. Patch versions are for metadata, docs, screenshots, or copy fixes. Minor versions add compatible tokens, slots, routes, or settings. Major versions are for breaking changes to tokens, slots, permissions, or required files.
- Keep the `compatibility` field explicit, such as `>=4.77.3` or `future`.

## Review checklist

- **Security:** no executable payloads, remote code references, path traversal, unsafe permissions, or install scripts.
- **Accessibility:** screenshots and docs cover keyboard use, focus states, contrast, reduced motion, and screen-reader-visible labels.
- **Performance:** no large uncompressed assets, blocking scripts, or runtime fetch requirements.
- **Compatibility:** manifest declares Arkivel compatibility, supported kind, status, source, checksums, and required env vars.
- **Documentation:** README, screenshots, changelog notes, configuration examples, and migration notes are complete.
- **Validation:** import preview accepts the manifest or reports expected warnings, and tests document every intentional limitation.

## Submission flow

1. Start from a folder under `examples/marketplace/`.
2. Draft docs from `examples/marketplace/pack-readme-template.md`.
3. Validate the manifest through `/admin/marketplace` import preview or `/api/marketplace/authoring`.
4. Open a marketplace submission issue from `examples/marketplace/submission-template.md` and attach the manifest, screenshots, and review checklist.
5. Keep the contribution preview-only until a trusted local install flow exists.
