# Archive And Mirror Workflows

Arkivel v4.93.2 keeps archive and mirror work preview-safe while documenting the path toward selected-space moves between installs.

## Read-Only Archive Snapshots

Archive snapshots are immutable and read-only. They preserve revisions, assets, categories, and metadata alongside articles, tags, comments, and customizations so an install can be browsed or restored without rewriting history.

## Private Mirrors

Team mirrors should use private target workspaces, authenticated visibility, preserved revision/comment history, and reviewed provenance before public links are enabled.

Personal mirrors should export selected spaces, exclude sessions, API keys, and analytics, run dry-run conflict reports before repeated syncs, and store signed archive manifests next to local backups.

## Selected-Space Transfer

The selected-space workflow is:

1. Select source spaces and export scope.
2. Generate a sync manifest and signed archive snapshot.
3. Run an import dry run against the target install.
4. Resolve repeated-sync conflicts before applying changes.
5. Record external provenance for imported or mirrored content.

## Repeated Sync Conflicts

Repeated syncs must record whether source wins, target wins, manual merge, or skip-and-report was used. Manual merge is recommended for divergent revisions, category moves, comments, and customization overrides.

## Release Decision

The v4.93.2 checkpoint asks whether federation graduates before v5. The required evidence is repeated sync dry runs, private mirror privacy review, archive restore rehearsal, and conflict resolution acceptance. Until that evidence exists, live network federation remains deferred.
