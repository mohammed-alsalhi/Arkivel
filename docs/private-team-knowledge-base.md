# Private Team Knowledge Base

Arkivel can run as a private team knowledge base by combining workspace visibility, role templates, collaboration controls, and conservative public-surface checks.

## Recommended Setup

1. Create a workspace with the `team` bootstrap profile.
2. Keep `visibility` set to `members` or `private`.
3. Invite at least two `team-owner` users for recovery.
4. Use `docs-maintainer`, `editor`, `reviewer`, `contributor`, and `viewer` templates for day-to-day roles.
5. Keep `includeGlobal=1` disabled after migrating legacy unscoped articles.

## Collaboration Controls

Workspace collaboration controls cover co-authors, edit locks, review assignments, comments, mentions, notifications, activity digests, and contribution summaries. Editors can acquire locks and participate in reviews only inside workspaces where they are active members. Mentions route only to active workspace members who have mention notifications enabled.

## Public Surface Safety

Anonymous RSS, Atom, sitemap, and `/api/sitemap` outputs include only:

- Legacy unscoped published articles.
- Published articles in public workspaces.

Private and members-only workspace articles are excluded from these surfaces. API v1 callers with `X-API-Key` can read unscoped articles plus public, owned, or actively-membered workspaces.

## User Settings

User preferences include display-facing settings through the existing account/profile surfaces and preference JSON: dashboard widgets, editor mode, notification flags, digest cadence, locale, timezone, avatar URL, and default editor preferences.

