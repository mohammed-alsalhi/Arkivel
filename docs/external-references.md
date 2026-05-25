# External References

Arkivel v4.93.1 adds cross-instance reference metadata without expanding live federation. The contract describes where content came from, how it is mirrored, and which references can safely appear in public indexes.

## Metadata

`GET /api/external-references` publishes the reference schema, example references, provenance labels, diagnostics, and public-index planning.

References can describe:

- Articles
- Spaces
- Sources
- Imported snapshots

Each record includes instance id, base URL, external id, label, relation, privacy level, optional canonical URL, optional checksum, and optional last-seen timestamp.

## Provenance

Article and admin UI can use the shared provenance label helper to render “Imported from …” and “Mirrored from …” copy. Provenance should appear near article metadata or import/sync review surfaces so operators can understand whether local content is original, imported, or mirrored.

## Diagnostics

Broken reference diagnostics flag missing canonical URLs, stale or unreachable instances, checksum drift, unknown relations, and private references that appear in public index URLs. Blocked diagnostics must stop public-index export.

## Public Index Plan

Public indexes are local and opt-in. Arkivel must not centralize private content. Only `public-indexable` references with canonical URLs may be included, and the index shape is limited to instance id, type, external id, label, canonical URL, and checksum. Authenticated, private, and sensitive references are omitted with explicit reasons.
