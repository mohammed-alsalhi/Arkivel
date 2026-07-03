# Collaboration UX

Arkivel v4.85.2 documents and exposes the collaboration user-experience contract around the existing live editor, review, discussion, and notification systems.

## Live Editing States

`src/lib/collaboration-ux.ts` defines the shared state vocabulary for collaboration surfaces:

- disabled
- connecting
- connected
- syncing
- reconnecting
- conflict
- offline

The live editor now displays these states alongside collaborator names and last-saved copy. Conflict and offline states are warnings for editors to review the shared session before publishing.

## Comments, Suggestions, and Review Notes

The collaboration UX contract includes planning metadata for:

- comment anchors with `data-comment-anchor`, `data-review-thread`, and `data-suggestion-id`
- suggestion modes: off, suggest, and review
- inline note types: comment, suggestion, change request, and resolution
- resolved thread history for editors and admins

Future inline notes should reference review or suggestion ids rather than embedding reviewer-only text in public article HTML.

## Notification Routing

The collaboration UX contract describes notification routing for:

- mentions
- assignments
- review changes
- watched article updates

Routes include trigger descriptions, recipients, dedupe windows, and quiet-hours awareness so notification surfaces and trusted plugins can use the same routing language.

## Mobile QA

The mobile editor QA checklist covers toolbar wrapping, selection actions, review trays, presence strips, and future comment anchors across common phone viewports.

## Accessibility

Collaboration controls should announce status with `aria-live=polite`, expose collaborator names beyond color, keep comment anchors keyboard reachable, restore focus after dialogs, and announce conflict/offline warnings without stealing focus.
