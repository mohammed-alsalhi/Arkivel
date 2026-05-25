# Marketplace Lifecycle

Arkivel v4.90.1 defines the local pack lifecycle contract that future install inventory will use.

## Surfaces

- `/api/marketplace/lifecycle` publishes lifecycle states, allowed transitions, local inventory metadata, health checks, preview media validation, changelog/update fields, compatibility warnings, and rollback instructions.
- `marketplaceLifecycle` in `/api/customization` exposes the schema version, API route, states, preview media checks, and docs path.

## States

Pack states are `draft`, `previewed`, `installed-local`, `enabled`, `disabled`, `deprecated`, `incompatible`, `blocked`, and `removed`.

Allowed transitions keep risky moves explicit. For example, `draft` can move to `previewed`, `blocked`, or `removed`; `previewed` can move to `installed-local`, `blocked`, `incompatible`, or `removed`; `enabled` can move to `disabled`, `deprecated`, or `blocked`.

## Metadata

Lifecycle metadata includes changelog fields, update note fields, compatibility warning categories, and rollback instructions. Rollbacks should disable a pack before removing files, restore previous env vars or component/theme ids, clear local inventory entries, re-run validation, and restart after filesystem changes.

## Inventory And Health

The lifecycle report maps current local registry items into an inventory with id, kind, version, compatibility, source path, and derived state. Health checks count invalid preview media and missing screenshot checksums.

## Preview Media Validation

Preview media must use local paths, supported image extensions, and screenshot checksum metadata. Remote screenshots are invalid for local-first beta inventory.
