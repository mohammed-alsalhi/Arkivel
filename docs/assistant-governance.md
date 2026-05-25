# Assistant Governance

Arkivel v4.92.2 adds governance metadata for responsible AI use in self-hosted knowledge bases. The contract is exposed at `/api/assistant-packs/governance` and through `/api/customization` as `assistantGovernance`.

## Privacy Warnings

- Provider-backed assistants may send selected article, search, import, or review context outside the instance.
- Private spaces and sensitive articles should opt out unless an admin explicitly enables the pack.
- Prompt previews must show context sources, redactions, provider, model, retention, and estimated cost.
- Prompts must not include secrets, API keys, private user profile fields, or unrelated workspace content.

## Output Requirements

Generated content, rewrites, summaries, taxonomy changes, and claim extraction require human review before publishing or applying changes. Ask-wiki answers, summaries, claim extraction, and review notes should include citation prompts. Claim extraction, taxonomy suggestions, review notes, and search answers should include confidence metadata.

## Audit Events

AI governance defines audit actions for generated content, rewrites, summaries, and taxonomy changes:

- `ai.generate_content`
- `ai.rewrite`
- `ai.summarize`
- `ai.taxonomy_change`

## Opt-Out Controls

Private spaces default to opt-out. Sensitive articles use the `assistantDisabled` flag, and space policies use `assistantAvailability`. The user-visible fallback copy is: `AI assistants are disabled for this space or article.`

## Release Gate

Before v5, AI must remain optional and non-blocking: provider packs disabled by default, core editing works without AI, fallback copy exists, and private opt-out controls exist.
