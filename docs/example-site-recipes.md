# Example Site Recipes

Arkivel v4.97.2 publishes reusable setup recipes for common self-host shapes. These recipes are docs-first examples: they provide configuration snippets, screenshot targets, recommended starter surfaces, migration notes, and a v5 readiness checklist without importing content automatically.

## Contract

- API: `/api/example-site-recipes`
- Customization manifest key: `exampleSiteRecipes`
- Schema: `arkivel.example-site-recipes.v1`
- Example metadata: `examples/recipes/site-recipes.json`
- Test coverage: `src/lib/__tests__/example-site-recipes.test.ts`

## Recipes

### personal-wiki

- Env snippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=personal-wiki`
- Screenshot target: `docs/screenshots/personal-wiki.png`
- Recommended template: personal wiki
- Recommended packs: default wiki

### team-handbook

- Env snippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=team-handbook`
- Screenshot target: `docs/screenshots/team-handbook.png`
- Recommended template: team handbook
- Recommended packs: default wiki, docs portal, team knowledge base

### public-docs

- Env snippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=public-docs`
- Screenshot target: `docs/screenshots/public-docs.png`
- Recommended template: public docs
- Recommended packs: default wiki, docs portal, team knowledge base

### worldbuilding-atlas

- Env snippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=worldbuilding-atlas`
- Screenshot target: `docs/screenshots/worldbuilding-atlas.png`
- Recommended template: worldbuilding atlas
- Recommended packs: default wiki, docs portal, team knowledge base

### research-library

- Env snippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=research-library`
- Screenshot target: `docs/screenshots/research-library.png`
- Recommended template: research library
- Recommended packs: default wiki, docs portal, team knowledge base

### read-only-archive

- Env snippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=read-only-archive`
- Screenshot target: `docs/screenshots/read-only-archive.png`
- Recommended template: read-only archive
- Recommended packs: default wiki, docs portal, team knowledge base

### product-knowledge-base

- Env snippet: `NEXT_PUBLIC_ARKIVEL_LAYOUT=product-knowledge-base`
- Screenshot target: `docs/screenshots/product-knowledge-base.png`
- Recommended template: product knowledge base
- Recommended packs: default wiki, docs portal, team knowledge base

## Migration Stories

- `notion` - export Markdown and assets, normalize titles, rehearse imports, and verify private/public visibility.
- `obsidian` - preserve folder context as spaces or categories, resolve wiki links, and review attachment paths.
- `mediawiki` - convert pages and categories, preserve redirects where possible, and map permissions before public launch.
- `markdown-folders` - import folder structure, infer categories, and add metadata where front matter is missing.
- `docs-sites` - map routes to slugs, preserve canonical links, and test public feeds, sitemap, and redirects.

Every migration story requires a dry-run rehearsal before write-capable imports.

## v5 Readiness Checklist

- `auth-and-roles`
- `backup-and-restore`
- `migration-dry-run`
- `customization-manifest`
- `marketplace-and-plugins`
- `public-api-v1`
- `webhooks-and-feeds`
- `security-and-privacy`
- `smoke-suite`
- `docs-sync`

Self-host admins should treat every item as release-blocking before moving a serious instance to v5.0.0.
