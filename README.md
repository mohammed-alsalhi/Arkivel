# arkivel

Arkivel is a small, self-hosted knowledge base for writing, linking, searching, and exporting documentation. It uses Next.js, PostgreSQL, Prisma, Tiptap, and optional Vercel Blob uploads.

One repository serves two independent deployments:

| deployment | mode | purpose |
| --- | --- | --- |
| `arkivel.com` | `ARKIVEL_SITE_MODE=product` | branding, installation docs, and API reference |
| WorldWiki | `ARKIVEL_SITE_MODE=wiki` | the private wiki application |

Each deployment keeps its own domains, environment variables, database, and blob credentials.

Wiki deployments default to the lowercase, full-viewport `folio` skin. Set `NEXT_PUBLIC_ARKIVEL_SKIN=wiki` to keep the classic framed wiki skin without changing the supported feature set.

## core

- articles with rich text, wiki links, backlinks, and a local graph
- categories, tags, keyword search, and recent changes
- revision history, diff, blame, restore, redirects, and draft share links
- Markdown, JSON, ZIP, Notion, and Obsidian import/export paths
- asset uploads through Vercel Blob
- local credentials, optional OAuth, sessions, roles, and audit logs
- maintenance/read-only controls and health endpoints
- a versioned `/api/v1` contract with generated OpenAPI

## local setup

Requirements: Node.js 20+, PostgreSQL, and npm.

```bash
git clone https://github.com/mohammed-alsalhi/arkivel.git
cd arkivel
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

Use `prisma db push` only for a new, empty local database. For an existing database, review the schema difference, take a verified backup, and use explicit SQL after a restore rehearsal.

The wiki opens at `http://localhost:3000`. To preview the database-free product site:

```bash
ARKIVEL_SITE_MODE=product npm run dev
```

## required configuration

```dotenv
DATABASE_URL=postgresql://user:password@host:5432/database
ADMIN_SECRET=replace-me
NEXT_PUBLIC_BASE_URL=https://wiki.example.com
ARKIVEL_SITE_MODE=wiki
```

Optional variables include OAuth credentials, `BLOB_READ_WRITE_TOKEN`, and public brand assets. See [.env.example](.env.example).

## commands

```bash
npm run lint
npm test
npm run test:e2e
npm run build
npm run release:docs-sync
```

## documentation

- [user guide](docs/help.md)
- [feature boundary](docs/features.md)
- [api v1 migration](docs/api-v1-migration.md)
- [maintainer guide](docs/maintainer-guide.md)
- [architecture](ARCHITECTURE.md)

License: MIT.
