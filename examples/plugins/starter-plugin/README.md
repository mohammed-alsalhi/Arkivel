# Starter Plugin

This folder is a copyable starter kit for Arkivel's v1 trusted-local plugin manifest. It is intentionally manifest-first: the v4.80 runtime validates `plugin.json`, shows permissions in `/admin/plugins`, and does not execute plugin code yet.

## Files

- `plugin.json` - complete v1 manifest with route, widget, setting, hook, job, storage, permissions, and compatibility.
- `route.md` - route contract notes for the future `/plugins/starter-plugin` surface.
- `widget.md` - dashboard widget contract notes.
- `setting.md` - setting schema notes.
- `hook.md` - article render hook notes.
- `job.md` - manual job notes.
- `tests.md` - smoke-test checklist for plugin authors.

## Validate

```bash
npm run plugin:validate -- examples/plugins/starter-plugin/plugin.json
npm run plugin:validate -- --list-surfaces
```
