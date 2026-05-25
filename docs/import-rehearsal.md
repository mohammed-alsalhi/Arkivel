# Import Rehearsal

Arkivel import rehearsal is dry-run-only. It previews what an import would do, groups conflicts, recommends actions, and creates a rollback plan before any future write flow can apply changes.

## Conflict Categories

- Duplicate slugs
- Category conflicts
- Tag conflicts
- User mapping
- Asset mapping
- Revision preservation
- Unsupported schema
- Permission gaps

## Recommended Actions

Dry-run reports can recommend slug renames, category merges, category creation, tag merges, tag creation, user mapping, user skipping, asset mapping, asset skipping, revision preservation, revision skipping, or blocking the import.

## Fixtures

Planning fixtures cover:

- Small wiki
- Large archive
- Docs portal
- Worldbuilding atlas

## Safety

Use `/api/import/rehearsal` to inspect the contract and preview report. The preview shape includes blocked changes and a rollback plan, and `writeAllowed` remains `false` in v4.81.2.
