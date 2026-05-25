# Setup Paths

Use this page to choose an installation shape and the checks it needs before production use.

## vercel

Use Vercel for hosted Next.js deployment. Configure `DATABASE_URL`, public customization variables, blob/storage settings if used, and run smoke tests against the deployed `BASE_URL`.

## docker

Use Docker for self-hosted deployments where app and database lifecycle are managed together. Keep `.env` outside the image, persist uploads/assets, and rehearse backup/restore before upgrades.

## local-node

Use local Node for development or a small trusted install. Run `npm install`, `npx prisma generate`, `npx prisma db push`, `node prisma/seed.mjs`, and `npm run dev`.

## managed-postgres

Use managed Postgres or Neon-compatible Postgres for production. Confirm Prisma adapter compatibility, connection pooling, backups, restore rehearsal, and migration dry-run output.

## private-team

Use a private team setup when collaboration, roles, invitations, private workspaces, and audit logs matter. Review `docs/private-team-knowledge-base.md` and privacy controls.

## public-docs

Use public docs when feeds, sitemap, API v1, and public search are expected. Verify draft visibility, public workspace scopes, SEO metadata, and export behavior.

## personal-wiki

Use a personal wiki for a single maintainer or small private knowledge base. Keep backups simple, document local customization, and avoid enabling plugins without reviewing permissions.

## demo-instance

Use a demo instance for examples, screenshots, smoke tests, and onboarding. Seed repeatable content, avoid real private data, and reset regularly.
