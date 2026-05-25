# Search Relevance

Arkivel v4.84.0 introduces the `arkivel.search-relevance.v2` contract. The contract is published from `/api/customization` as `searchRelevance`.

## Ranking Signals

Search ranking combines:

- Exact title, title prefix, and title contains matches.
- Phrase matches in excerpts and article content.
- Word coverage after synonym expansion and light stemming.
- Alias and redirect matches through slugs and redirect targets.
- Verification boosts for reviewed content.
- Stale, draft, review, and expired-verification penalties.

Weights live in `src/lib/search-relevance.ts` and are grouped as the admin-tunable default set for future settings UI.

## Facets And Filters

`/api/search` continues to accept existing filters for category, tags, author, status, dates, word counts, workspace, and semantic blending. Responses now also include `facets` with category, tag, and status counts for the returned result set.

Saved-filter metadata, synonyms, redirects, aliases, stemming strategy, phrase ranking, and facet support are documented in the public contract so search clients can migrate without scraping route code.

## Explain Mode

Admins can request `GET /api/search?q=...&explain=1`. Each result may include:

- `score`.
- `searchExplain.schemaVersion`.
- `matchedTerms`.
- Per-signal score contributions.
- The active weight table.

Non-admin callers do not receive explain payloads.

## Migration Notes

Existing clients can continue to read `results`, `semanticResults`, and `suggestions`. New clients may optionally read `facets`, `score`, and `searchExplain`. Treat those scoring fields as additive and versioned by `arkivel.search-relevance.v2`.
