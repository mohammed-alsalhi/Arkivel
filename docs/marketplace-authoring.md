# Marketplace Authoring

Arkivel v4.90.2 adds a preview-safe authoring contract for local marketplace packs. The contract is exposed at `/api/marketplace/authoring` and through `/api/customization` as `marketplaceAuthoring`.

## Author Dashboard Contract

The author dashboard metadata is designed for local pack validation before any future install flow:

- Local validation: registry validation status, item counts, and validation issues.
- Metadata preview: id, name, kind, version, status, author, and compatibility.
- Screenshot checks: local-only screenshot paths, supported image extensions, and checksum coverage.
- License checks: marketplace-supported license validation.
- Docs completeness: expected README, tests README, and required authoring sections.
- Compatibility matrix: Arkivel version targets and future-surface warnings.

## README Generator

`generatePackReadme()` produces a starter README with metadata, screenshot references, configuration notes, and a quality checklist. Pack authors should fill in audience, setup, accessibility, performance, security, testing, migration, and rollback details before submission.

## Compatibility Matrix

`generateMarketplaceCompatibilityMatrix()` summarizes each pack's compatibility field against the running Arkivel version. Packs marked `future` must remain disabled until the matching Arkivel surface exists, even if their preview metadata parses cleanly.

## Submission Templates

Authoring templates live in:

- `examples/marketplace/submission-template.md`
- `examples/marketplace/pack-readme-template.md`

Submissions remain preview-only during the v4 beta. Arkivel does not fetch remote code, run install scripts, or execute third-party pack code through the marketplace authoring API.

## Quality Expectations

- Design quality: screenshots should show real states, not marketing-only placeholders.
- Accessibility: document keyboard behavior, focus, contrast, reduced motion, and screen-reader-visible labels.
- Performance: avoid oversized assets, blocking scripts, and runtime network requirements.
- Security: reject remote code, path traversal, unsafe hooks, excessive permissions, and hidden install steps.
- Documentation: include compatibility notes, changelog/update notes, rollback instructions, and testing evidence.
