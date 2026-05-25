# Discovery Engines

Arkivel v4.84.1 adds the `arkivel.discovery-engines.v1` contract. It is exposed from `/api/customization` as `discoveryEngines` and available at `/api/discovery` with a live report.

## Engines

The shared helper in `src/lib/discovery-engines.ts` detects:

- Duplicate page candidates through word-set similarity.
- Unresolved questions from TODO/FIXME/TBD/open-question markers and question-heavy copy.
- Canon conflicts from explicit conflict language.
- Glossary gaps from repeated capitalized terms that are missing from glossary terms and aliases.
- Orphan topics with no inbound wiki links.

## Clusters And Continue Reading

The first cluster pass groups articles by category and tags. Each cluster includes a `continueReading` list with article links and reasons. Later UI can promote these into topic cluster pages, article modules, or trail widgets without changing the report shape.

## Admin Actions And Widgets

The contract declares admin actions for merging duplicates, connecting orphans, seeding glossary entries, resolving canon conflicts, and answering unresolved questions. The report also includes dashboard-ready widget descriptors for duplicate candidates, orphan topics, glossary gaps, unresolved questions, and continue-reading coverage.

## API

`GET /api/discovery` returns:

- `contract`: the discovery engine contract.
- `report.schemaVersion`.
- `report.summary`.
- `report.opportunities`.
- `report.clusters`.
- `report.widgets`.
