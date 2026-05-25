# Secure Marketplace And Plugins

Arkivel v4.89.2 tightens local-first marketplace and trusted plugin security before marketplace beta work resumes.

## Surfaces

- `/api/marketplace/security` publishes blocked permissions, blocked hook prefixes, dangerous capability warnings, local-only installation guidance, and provenance requirements.
- `marketplaceSecurity` in `/api/customization` exposes the same contract for self-host dashboards and tooling.
- Marketplace import previews reject unsafe packs before any future install intent can reuse the parser.

## Blocked Pack Inputs

Preview parsing blocks remote URLs, executable fields, install commands, path traversal, unsafe hooks, and excessive permission sets. Hooks beginning with `system.`, `shell.`, `filesystem.`, `process.`, `child_process.`, or `network.` are rejected.

Blocked permissions include wildcard permissions, `admin:all`, `filesystem:*`, `shell:*`, `system:*`, and `network:*`-style capabilities. Packs requesting more than five permissions are blocked for review rather than accepted as a preview.

## Dangerous Capabilities

Plugin manifests may still declare high-trust local capabilities, but admins must review warnings for:

- `file:read`
- `job:execute`
- `settings:write`
- `webhook:send`

These capabilities should remain local-only, disabled by default, and documented in the plugin README.

## Provenance And Checksums

Future local install flows should require `source.path`, `source.remote=false`, `checksums.manifest`, `license`, `author`, and `compatibility`. Operators should verify manifest checksums, screenshot checksums when bundled, schema version, and source path before copying files into a trusted plugin or pack directory.

## Local-Only Installation

Arkivel does not fetch remote marketplace code or run install scripts. Trusted plugin discovery reads local `plugin.json` manifests only when `ARKIVEL_ENABLE_TRUSTED_PLUGINS=true` and `ARKIVEL_TRUSTED_PLUGIN_DIR` points to an absolute local directory. Keep plugins disabled until an admin reviews permissions, warnings, routes, widgets, hooks, compatibility, and provenance.
