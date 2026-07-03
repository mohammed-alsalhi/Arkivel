# Workspaces

Arkivel v4.82 hardens the existing `Wiki` model into the durable workspace boundary for the v5 line. Workspaces carry visibility, default role, navigation mode, bootstrap profile, settings, marketplace selections, memberships, and invitations.

## Bootstrap Profiles

Supported profiles are `personal`, `team`, `public-docs`, `private-archive`, and `demo`. Each profile defines starter spaces, starter tags, visibility, default role, navigation mode, and default marketplace selections.

## Invitations

Roles remain `admin`, `editor`, and `viewer`. Invitations default to the workspace default role when no role is provided.

## Scoped APIs

The core read APIs now accept a workspace scope through `workspaceId`, `wikiId`, or the `X-Arkivel-Workspace` header:

- `GET /api/articles`
- `GET /api/search`
- `GET /api/categories`
- `GET /api/tags`

Use `includeGlobal=1` during migration to include legacy rows that still have `Article.wikiId = null`.

## Single-Workspace Migration

1. Create a `personal` workspace for the existing owner/admin.
2. Backfill `Article.wikiId` for rows that should belong to that workspace.
3. Keep `includeGlobal=1` enabled only while old unscoped rows are being assigned.
4. Review visibility, default role, navigation mode, settings, and marketplace selections.
5. Invite members after the workspace boundary and private content have been checked.

