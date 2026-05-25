# Privacy Controls

Arkivel v4.89.1 defines a pre-v5 privacy contract for deployment operators, admins, plugin authors, and contributors.

## Surfaces

- `/api/privacy/controls` publishes privacy controls, retention settings, user data lifecycle planning, and warnings for AI/external integrations.
- `privacyControls` in `/api/customization` exposes the schema version, API route, covered surfaces, retention keys, warning ids, and user-data export scope.

## Deployment Modes

Personal deployments should keep workspaces private, disable public indexing unless intentional, minimize profile details, and avoid analytics unless needed for operations.

Team deployments should use private/team workspaces, signed-in member visibility, aggregate analytics with IP anonymization, and approved webhook/AI providers.

Public deployments should publish only reviewed public workspaces, keep drafts hidden, disclose analytics and AI behavior, and use signed webhook payloads.

## Controlled Surfaces

The contract covers public/private spaces, indexing, feeds, exports, analytics, AI features, webhook payloads, and user profiles. Each surface records a default mode and deployment-specific recommendation in `src/lib/privacy-controls.ts`.

## Retention Settings

Default retention planning:

- Activity feed events: 180 days
- Audit logs: 365 days
- Query analytics: 90 days
- Notifications: 90 days
- Sessions: 30 days
- Webhook deliveries: 90 days

Self-host admins can tune these values in future settings work, but release rehearsals should test cleanup behavior against these keys.

## User Data Lifecycle

Planned user export scope includes profile, preferences, authored articles, comments, suggestions, watchlist, and notifications. Deletion planning covers account deactivation, contribution anonymization, private preference deletion, and workspace ownership reassignment.

Admins should confirm requester identity, preview affected content and ownership, prefer anonymization where public contribution history would otherwise damage shared knowledge, and record export/deletion actions in the audit trail.

## AI And External Integrations

AI features may send selected content, prompts, filenames, or search context to configured providers. Webhooks send payloads to external receivers. Exports outlive Arkivel access controls after download. Feeds, sitemaps, and indexing can make public content discoverable outside the instance.
