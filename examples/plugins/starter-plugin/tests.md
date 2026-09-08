# Plugin Smoke Tests

- `npm run plugin:validate -- examples/plugins/starter-plugin/plugin.json` passes.
- Invalid permissions return fielded validation errors.
- The plugin appears in `/admin/plugins` only when copied into the trusted local plugin directory and `ARKIVEL_ENABLE_TRUSTED_PLUGINS=true`.
- Enable/disable actions write audit events.
- Route, widget, hook, job, and setting metadata remain visible before future runtime code execution.
