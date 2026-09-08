# Plugin Authoring

Arkivel v4.80 plugins are trusted-local and manifest-first. The runtime validates `plugin.json`, shows permissions and health in `/admin/plugins`, and does not fetch remote code or run arbitrary install scripts.

## Starter Kit

Copy `examples/plugins/starter-plugin/` and update:

- `id`, `identity.name`, `identity.slug`, `version`, `author`, and `license`
- `compatibility.arkivel` and `compatibility.pluginApi`
- `permissions` and matching `apiScopes`
- `routes`, `settings`, `widgets`, `hooks`, `jobs`, `storage`, and `webhooks`

Validate before sharing:

```bash
npm run plugin:validate -- examples/plugins/starter-plugin/plugin.json
npm run plugin:validate -- --list-surfaces
```

## Security Boundary

- Use `ARKIVEL_ENABLE_TRUSTED_PLUGINS=true` only for a directory you control.
- `ARKIVEL_TRUSTED_PLUGIN_DIR` must be an absolute path.
- Webhook manifests should reference environment variable names, not literal remote URLs.
- Routes must stay under `/plugins`.
- Remote arbitrary-code loading is out of scope for v1.

## Smoke Test Checklist

- Manifest validates with no errors.
- Permission prompts match the plugin's real behavior.
- Health metadata reports load errors clearly.
- Enable/disable actions are audit logged.
- Route, widget, setting, hook, and job metadata are visible in `/admin/plugins`.
