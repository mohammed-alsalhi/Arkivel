# Editor Troubleshooting

Arkivel v4.85.0 publishes the `arkivel.editor-reliability.v1` contract through `/api/customization` as `editorReliability`.

## Reliability Areas

The editor reliability contract covers:

- Collaborative editing sync and pending local update states.
- Draft recovery from browser-local autosave records.
- Offline warnings and local preservation.
- Autosave repair for malformed draft payloads.
- Paste cleanup for Markdown, URLs, and images.
- Embed handling for images, videos, Gists, Mermaid, math, Excalidraw, and rich blocks.
- Large-document checks for tables, code blocks, footnotes, images, and wiki links.

## Draft Recovery

Article edit pages save local drafts under `wiki_draft_<articleId>` after the editor has been idle for 2 seconds. The shared helper in `src/lib/editor-reliability.ts` defines the recoverable draft shape and repairs partial records when possible.

## Snapshot Flows

Named snapshots support:

- List snapshots: `GET /api/articles/:id/snapshots`
- Read one snapshot: `GET /api/articles/:id/snapshots?snapshotId=...`
- Compare with current article: `GET /api/articles/:id/snapshots?snapshotId=...&compare=1`
- Create a snapshot: `POST /api/articles/:id/snapshots`
- Restore a snapshot: `PUT /api/articles/:id/snapshots`
- Discard a snapshot: `DELETE /api/articles/:id/snapshots`

Restore first saves the current article state as a new "Before restore" snapshot, then applies the selected snapshot.

## Health Diagnostics

`diagnoseEditorHealth()` reports extension load failures, duplicate schema nodes, offline state, storage unavailability, and large-document pressure. Use this helper when adding editor extensions, plugin commands, or new embedded block types.

## Large Documents

Large-document fixtures cover tables, code blocks, footnotes, images, and wiki links. Add focused fixtures before changing parsing, paste handling, serialization, or rich block behavior.
