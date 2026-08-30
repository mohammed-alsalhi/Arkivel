# maintainer guide

## deploy

Use the same GitHub repository for the product and wiki Vercel projects. Give each project its own mode, domains, and environment variables. Product mode does not receive wiki database, admin, or blob secrets.

## data safety

Before schema or infrastructure work:

1. enable read-only or maintenance mode
2. take a fresh custom-format PostgreSQL dump
3. checksum it and inspect `pg_restore --list`
4. restore it into an isolated database
5. rehearse the exact SQL and smoke the retained core
6. cut over only after retained row counts and relationships match

Never use `--accept-data-loss` or `DROP ... CASCADE`. Extra legacy tables are harmless while absent from the application Prisma schema; deleting them can wait.

## checks

```bash
npx prisma validate
npx prisma generate
npm run lint
npm test
npm run build
npm run release:docs-sync
```

The Vercel build does not run database migrations. Verify both deployments resolve the same intended Git SHA after merging.
