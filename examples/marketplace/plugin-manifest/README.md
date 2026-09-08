# Example Plugin Manifest

This sample shows the folder shape for a preview-only plugin manifest contribution. The marketplace preview accepts metadata only; trusted local loading is planned later in the roadmap.

## Contents

- `manifest.json` declares permissions, routes, settings, widgets, and hooks.
- `screenshots/README.md` describes plugin admin and widget previews.
- `tests/README.md` lists validation and permission-review checks.

## Review notes

- Keep permissions narrow and human-readable.
- Do not include remote code, shell commands, filesystem permissions, or executable payloads.
- Validate the manifest with `/admin/marketplace` import preview.
