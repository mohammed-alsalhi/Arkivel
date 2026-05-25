# Moderation And Suggestions

Arkivel's v4.83.2 moderation contract covers public discussion threads, edit suggestions, public contribution requests, and reported content. The contract is exposed from `/api/customization` as `moderation`.

## Discussion Moderation

Discussion rows track:

- `status`: `visible`, `reported`, `hidden`, or `removed`.
- `visibility`: `public` or `reviewers`.
- Report metadata: count, reason, and report time.
- Moderator metadata: reason, moderator id, and moderation time.

Public readers only see comments with `status=visible` and `visibility=public`. Admins can update moderation fields through `PATCH /api/articles/:id/discussions`; public users can report a comment with `action=report`.

## Suggestion Queue

`/admin/suggestions` supports the review actions expected for public contribution workflows:

- Accept.
- Reject.
- Comment.
- Assign.
- Convert to task.

The API stores `assigneeId`, `reviewerComment`, `convertedTaskUrl`, source type, spam score, moderation state, and request IP metadata. Existing accepted/rejected status updates remain backward-compatible.

## Anti-Spam Planning

`src/lib/moderation.ts` defines the first anti-spam planning contract. Public submissions are scored for short content, excessive links, blocked phrases, anonymous authorship, and invalid email shape. Scores map to `open`, `needs_review`, or `blocked` moderation states. Default rate-limit targets are documented as 5 anonymous submissions per hour and 20 authenticated submissions per hour; enforcement is reserved for a later rate-limit implementation.

## Community Wiki Setup

For public docs and community wiki deployments:

- Keep anonymous suggestions enabled only when admins review `/admin/suggestions` regularly.
- Use reviewer-only discussion visibility for staff notes that should not appear in public threads.
- Treat `reported` comments as review queue entries, not automatic deletion.
- Prefer converting accepted public contributions into review tasks when the change needs editorial ownership.
