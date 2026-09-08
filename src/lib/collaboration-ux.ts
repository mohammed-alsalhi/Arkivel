export const COLLABORATION_UX_SCHEMA_VERSION = "2026-05-25.v4.85.2";

export type CollaborationConnectionState =
  | "disabled"
  | "connecting"
  | "connected"
  | "syncing"
  | "reconnecting"
  | "conflict"
  | "offline";

export type CollaborationNotificationRoute =
  | "mentions"
  | "assignments"
  | "review-changes"
  | "watched-article-updates";

export const collaborationConnectionStates: Record<CollaborationConnectionState, {
  label: string;
  severity: "neutral" | "info" | "success" | "warning" | "danger";
  description: string;
}> = {
  disabled: {
    label: "Live editing off",
    severity: "neutral",
    description: "The editor is local-only until live editing is enabled.",
  },
  connecting: {
    label: "Connecting",
    severity: "info",
    description: "Arkivel is loading the shared editing session and presence roster.",
  },
  connected: {
    label: "Connected",
    severity: "success",
    description: "Presence, sync, and last-saved indicators are healthy.",
  },
  syncing: {
    label: "Syncing",
    severity: "info",
    description: "Local changes are being written to the collaboration session.",
  },
  reconnecting: {
    label: "Reconnecting",
    severity: "warning",
    description: "Arkivel will keep local changes and retry the shared session.",
  },
  conflict: {
    label: "Conflict warning",
    severity: "warning",
    description: "Remote changes arrived while local edits were pending; review before publishing.",
  },
  offline: {
    label: "Offline",
    severity: "danger",
    description: "Network sync is unavailable; continue locally and reconnect before publishing.",
  },
};

export const commentAnchorContract = {
  anchorAttributes: ["data-comment-anchor", "data-review-thread", "data-suggestion-id"],
  states: ["open", "resolved", "reopened"],
  retention: "Resolved thread history remains visible to editors and admins for review provenance.",
  accessibility: "Anchors must be reachable by keyboard and expose the thread status in their accessible name.",
};

export const suggestionModePlan = {
  modes: ["off", "suggest", "review"],
  inlineNoteTypes: ["comment", "suggestion", "change-request", "resolution"],
  reviewThreadStates: ["open", "accepted", "rejected", "resolved"],
  storagePlan: "Inline notes should reference review/suggestion ids instead of embedding reviewer-only text in public article HTML.",
};

export const collaborationNotificationRoutes: Record<CollaborationNotificationRoute, {
  trigger: string;
  recipients: string;
  dedupeWindow: string;
  quietHoursAware: boolean;
}> = {
  mentions: {
    trigger: "@username in discussion, review note, or future inline comment",
    recipients: "mentioned active workspace member, excluding the author",
    dedupeWindow: "15 minutes per article/thread/user",
    quietHoursAware: true,
  },
  assignments: {
    trigger: "review request, suggestion, or task assignment changes owner",
    recipients: "new assignee plus workspace admins for unassigned escalations",
    dedupeWindow: "1 hour per assignment target",
    quietHoursAware: true,
  },
  "review-changes": {
    trigger: "review submitted, approved, change-requested, rejected, or reopened",
    recipients: "article author, assignee, reviewers, and co-authors",
    dedupeWindow: "15 minutes per review",
    quietHoursAware: false,
  },
  "watched-article-updates": {
    trigger: "watched article edited, restored, discussed, or published",
    recipients: "watchers in the same workspace, excluding the actor",
    dedupeWindow: "24 hours for digestable edits; immediate for publish/restore",
    quietHoursAware: true,
  },
};

export const mobileEditorQaCheckpoints = [
  { id: "mobile-toolbar-wrap", viewport: "375x812", check: "Toolbar, tray toggles, and status bar wrap without overlapping the canvas." },
  { id: "mobile-selection-actions", viewport: "390x844", check: "Selection actions stay reachable after text selection and keyboard appearance." },
  { id: "mobile-review-tray", viewport: "414x896", check: "Review tray quality checks and disclosure panels remain tappable." },
  { id: "mobile-presence-strip", viewport: "375x812", check: "Presence avatars, connection state, and sync actions wrap onto multiple rows." },
  { id: "mobile-comment-anchors", viewport: "390x844", check: "Future comment anchors and inline notes do not cover selected text." },
];

export const editorAccessibilityCheckpoints = [
  "Live collaboration status uses aria-live=polite.",
  "Presence avatars expose participant names and do not rely on color alone.",
  "Tray toggles, table controls, and selection actions have accessible names.",
  "Comment anchors and future suggestion notes are keyboard reachable.",
  "Dialogs and popovers restore focus to the invoking editor control.",
  "Conflict and offline warnings are announced without stealing focus.",
];

export const collaborationUxContract = {
  schemaVersion: COLLABORATION_UX_SCHEMA_VERSION,
  connectionStates: collaborationConnectionStates,
  commentAnchorContract,
  suggestionModePlan,
  notificationRoutes: collaborationNotificationRoutes,
  mobileEditorQa: mobileEditorQaCheckpoints,
  accessibility: editorAccessibilityCheckpoints,
};

export function getCollaborationConnectionState(input: {
  enabled: boolean;
  syncing?: boolean;
  syncError?: boolean;
  hasPendingLocalChanges?: boolean;
  remoteChangedWhilePending?: boolean;
  online?: boolean;
}): CollaborationConnectionState {
  if (!input.enabled) return "disabled";
  if (input.online === false) return "offline";
  if (input.remoteChangedWhilePending) return "conflict";
  if (input.syncError) return input.hasPendingLocalChanges ? "reconnecting" : "offline";
  if (input.syncing) return "syncing";
  return "connected";
}

export function formatLastSaved(value: Date | string | null): string {
  if (!value) return "Not synced yet";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not synced yet";
  return `Last saved ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export function getNotificationRoute(route: CollaborationNotificationRoute) {
  return collaborationNotificationRoutes[route];
}
