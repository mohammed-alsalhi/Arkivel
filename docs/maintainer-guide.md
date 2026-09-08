# Maintainer Guide

This guide orients new maintainers around the surfaces that usually need coordinated changes.

## install

Install dependencies with `npm install`, configure `DATABASE_URL`, run `npx prisma generate`, then start local development with `npm run dev`.

## upgrade

Before upgrading, read `CHANGELOG.md`, run `npm run release:docs-sync`, and follow `docs/v5-upgrade-planning.md`.

## deployment

Choose a setup path from `docs/setup-paths.md`. Vercel, Docker, local Node, and managed Postgres all need explicit environment variable, Prisma, backup, and smoke-test checks.

## customization

Public customization lives in `src/lib/customization.ts` and `/api/customization`. Keep `README.md`, `docs/help.md`, `docs/features.md`, `/help`, `/features`, and `/api-docs` aligned when behavior changes.

## marketplace

Marketplace metadata lives in `src/lib/marketplace.ts`, import preview validation in `src/lib/marketplace-import.ts`, and contribution guidance in `docs/marketplace-contributions.md`.

## plugin

Plugins are trusted-local and manifest-first. Start with `docs/plugin-authoring.md`, validate manifests with `npm run plugin:validate`, and keep permission warnings visible before enablement.

## api

Public REST API v1 is documented in `/api-docs`, `docs/api-v1-migration.md`, `/api/v1/contract`, and `/api/v1/openapi.json`. Do not change v1 behavior without tests and migration notes.

## security

Security review notes live in `docs/security-review.md`. Review auth, API keys, webhook signatures, import/export behavior, marketplace payloads, plugins, and browser headers before release candidates.

## backup

Verify database dumps, assets, env vars, marketplace packs, plugin manifests, customization settings, and restore rehearsal results before upgrades.

## contribution

Contributor guidance lives in `CONTRIBUTING.md` and `AGENTS.md`. Every behavior, workflow, API, schema, configuration, or docs-visible change must keep docs and version metadata synchronized.
