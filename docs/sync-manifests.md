# Sync Manifests

Arkivel v4.93.0 defines a preview-safe sync manifest for moving selected spaces between installs. It is a planning contract, not live network federation.

## Contract

- `GET /api/sync-manifests` returns the schema version, example manifest, dry-run report shape, signed snapshot plans, staging promotion checklist, and the release gate that keeps network federation outside stable scope.
- Manifests include source and target instance metadata, app version, schema version, per-section checksums, visibility rules, and conflict policy.
- Covered sections are categories, articles, tags, assets, revisions, comments, and customizations.
- Visibility rules distinguish public-only content from authenticated, private-space, sensitive-article, and admin-only data.

## Dry Runs

Syncs must produce a dry-run report before any future write path is allowed. The report groups creates, updates, deletes, warnings, and conflicts by section. Blocked conflicts stop the sync; manual-review conflicts require an operator decision.

Expected conflict classes include slug collisions, missing parents, checksum mismatches, visibility downgrades, schema mismatches, customization overwrites, and divergent revision history.

## Signed Snapshots

Public read replicas should include only public categories, articles, tags, assets, and customizations. Private mirrors may include revisions, comments, and private visibility classes. Both targets require a signed manifest plan with Ed25519 signatures and signing keys kept outside exported bundles.

## Staging To Production

Use staging as the source and production as the target. Run the dry run, inspect visibility downgrades and private omissions, compare checksums, review divergent revision/comment histories, and promote customizations only after theme, layout, marketplace, and plugin compatibility are confirmed.

Network federation remains excluded from stable v5 scope unless repeated syncs, mirrors, conflict handling, and privacy boundaries prove reliable.
