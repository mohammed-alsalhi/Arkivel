# Role Templates

Arkivel v4.82.1 publishes role templates for workspace invitations, permission review, docs, and future UI surfaces. The contract is exposed at `/api/customization` as `roleTemplates`.

## Templates

- `personal-admin` — full-control single-owner install role.
- `team-owner` — full workspace owner role for members, settings, webhooks, plugins, customization, and marketplace actions.
- `docs-maintainer` — trusted docs maintainer with write access to pages and APIs, read access to exports and operational surfaces.
- `editor` — general content editor for article, category, tag, and review work.
- `reviewer` — review/comment-focused role without broad publishing or integration control.
- `contributor` — authenticated commenter/proposer for future suggestion flows.
- `viewer` — authenticated reader for private or members-only workspaces.
- `public-reader` — anonymous published-content reader for public workspaces.

## Permission Matrix

The matrix covers pages, APIs, exports, webhooks, plugins, customization, and marketplace actions with `none`, `read`, `comment`, `write`, and `admin` levels. API keys can write through API surfaces when their user role allows it, but they cannot administer plugins, customization, or marketplace settings.

## Invitations

Workspace invitations expire after 14 days. Admins can create, resend, and revoke invitations through `/api/wikis/:id/invitations`; these actions emit audit events:

- `workspace.invitation_create`
- `workspace.invitation_resend`
- `workspace.invitation_revoke`

## Recovery

Self-host installs should keep `ADMIN_SECRET` in the deployment secret store. If all admin sessions are lost, temporarily restore `ADMIN_SECRET` access, sign in, rotate the secret, promote exactly one known account from a trusted database console if needed, and revoke stale sessions or API keys after recovery.

