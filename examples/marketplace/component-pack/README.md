# Example Component Pack

This sample shows the expected structure for an Arkivel component-pack contribution. It is preview-only: the manifest can be parsed and validated, but Arkivel does not load third-party runtime components yet.

## Contents

- `manifest.json` declares supported slots and compatibility.
- `components/README.md` documents the planned slot components.
- `screenshots/README.md` lists required preview captures.
- `tests/README.md` records validation and QA evidence.

## Validation

```bash
npm run marketplace:validate-pack -- examples/marketplace/component-pack/manifest.json
```

## Compatibility notes

- Uses the `arkivel.marketplace.import.v1` preview schema.
- Targets Arkivel `>=4.78.3`.
- Slots must match `src/lib/component-slots.ts`.
