# api v1 in arkivel 6

Arkivel 6 keeps a compact `/api/v1` surface:

- `GET /api/v1/articles`
- `GET /api/v1/categories`
- `GET /api/v1/tags`
- `GET /api/v1/search`

The machine-readable contract is at `/api/v1/contract`; OpenAPI is at `/api/v1/openapi.json`; the rendered reference is at `/api-docs`.

Clients migrating from earlier versions must remove calls to AI, workspace, marketplace, plugin, webhook, collaboration, analytics, social, learning, map, canvas, and v2 endpoints. Use the response shapes in the generated contract instead of legacy SDK metadata.
