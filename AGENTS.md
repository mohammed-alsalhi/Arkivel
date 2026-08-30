# Arkivel contributor instructions

Arkivel has one public source repository and two Vercel deployments:

- `arkivel.com` uses `ARKIVEL_SITE_MODE=product` for the product site and docs.
- the WorldWiki project uses `ARKIVEL_SITE_MODE=wiki` for the private wiki.

Keep the repository focused on the knowledge-base core: articles, wiki links, search, categories, tags, graph navigation, revisions, import/export, assets, authentication, users, audit, and maintenance. Do not reintroduce AI assistants, collaboration, marketplaces, plugins, workspaces, gamification, social feeds, or personal dashboards without an explicit product decision.

## Safety

- Never run `prisma db push`, `--accept-data-loss`, `DROP ... CASCADE`, or a destructive migration against an existing database.
- Back up and restore-rehearse before any physical schema deletion.
- Builds generate the Prisma client but do not migrate production.
- Keep product and wiki secrets isolated in their own Vercel projects.

## Development

```bash
npm install
npx prisma generate
npm run dev
```

Before delivery, run:

```bash
npm run lint
npm test
npm run build
npm run release:docs-sync
```

Prefer deletion and existing primitives over new abstractions. Update the relevant docs with behavior, API, schema, or deployment changes. Keep commits concise, detailed, and lowercase.
