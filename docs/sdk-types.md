# SDK Types And Examples

Arkivel v4.86.1 publishes SDK-ready TypeScript contracts for the frozen public API v1 and adjacent integration surfaces.

## Contract Metadata

Use these endpoints:

- `GET /api/v1/sdk`
- `sdkTypes` in `GET /api/customization`

The SDK contract names stable TypeScript payloads for REST responses, webhook events, customization manifests, marketplace packs, plugin manifests, and export bundle manifests.

## API Key Scopes

The typed scope registry includes read/write intent and matching surfaces:

- `articles:read`
- `categories:read`
- `tags:read`
- `revisions:read`
- `search:read`
- `customization:read`
- `marketplace:read`
- `plugins:read`
- `webhooks:read`
- `webhooks:write`
- `exports:read`
- `exports:write`
- `health:read`

Self-host admins can use this vocabulary for API-key UI, plugin permissions, generated clients, and audit messages.

## Client Examples

`sdkTypes.generatedClientExamples` includes Node, browser, curl, and webhook consumer snippets. These are intentionally small and copy-ready so downstream SDK generation can replace them without changing docs vocabulary.

## Sample Scripts

Sample scripts live in `examples/api/`:

- `backup.mjs`
- `import.mjs`
- `search.mjs`
- `content-audit.mjs`
- `webhook-test.mjs`

They use `ARKIVEL_URL` and `ARKIVEL_API_KEY` where a live API call is needed.

## Stable Endpoint Coverage

Pair this SDK contract with `GET /api/v1/contract` and `GET /api/v1/openapi.json` when generating clients. The v4.86.1 SDK layer does not replace the frozen v1 route envelopes; it gives those envelopes typed names and examples.
