# Assistant Packs

Arkivel v4.92.0 turns AI features into opt-in assistant pack metadata. The contract is exposed at `/api/assistant-packs`, `/admin/assistants`, and `/api/customization` as `assistantPacks`.

## Manifest Fields

Assistant packs declare provider, model, privacy mode, cost, data retention, prompt scope, permissions, tools, prompts, context sources, output types, limits, and safety notes.

## Graceful Degradation

When no provider is configured, Arkivel should keep assistant features disabled or use heuristic/browser-local fallbacks. The built-in `ai-disabled` pack is the privacy-first default for local and offline-friendly deployments.

## Privacy-First Guidance

- Review provider, model, cost, and retention before enabling a pack.
- Enable provider-processed packs per space only after reviewing public/private visibility.
- Avoid sending private drafts, secrets, user profile data, or unrelated workspace context to external providers.
- Keep local/offline deployments on the disabled pack unless admins explicitly opt in.

## Built-In Packs

Arkivel v4.92.1 defines disabled-by-default metadata for drafting, summarization, search, claim extraction, taxonomy, alt-text, import cleanup, and review assistants.

Each pack declares per-space availability, data access scope, prompt preview, context preview, permissions, output types, limits, safety notes, usage log fields, and cost-estimate metadata. Provider-backed packs remain opt-in and should be enabled per space only after admins review the prompt scope and retention policy.
