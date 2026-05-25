import { describe, expect, it } from "vitest";
import {
  collaborationUxContract,
  formatLastSaved,
  getCollaborationConnectionState,
  getNotificationRoute,
  mobileEditorQaCheckpoints,
} from "../collaboration-ux";

describe("collaboration ux contract", () => {
  it("describes live editor states and warnings", () => {
    expect(getCollaborationConnectionState({ enabled: false })).toBe("disabled");
    expect(getCollaborationConnectionState({ enabled: true, syncing: true })).toBe("syncing");
    expect(getCollaborationConnectionState({ enabled: true, syncError: true, hasPendingLocalChanges: true })).toBe("reconnecting");
    expect(getCollaborationConnectionState({ enabled: true, remoteChangedWhilePending: true })).toBe("conflict");
    expect(collaborationUxContract.connectionStates.conflict.description).toContain("Remote changes");
  });

  it("documents notification routes and mobile qa", () => {
    expect(getNotificationRoute("mentions").recipients).toContain("mentioned active workspace member");
    expect(getNotificationRoute("watched-article-updates").trigger).toContain("watched article");
    expect(mobileEditorQaCheckpoints.map((checkpoint) => checkpoint.id)).toContain("mobile-presence-strip");
    expect(collaborationUxContract.accessibility.some((item) => item.includes("aria-live"))).toBe(true);
  });

  it("formats last saved copy defensively", () => {
    expect(formatLastSaved(null)).toBe("Not synced yet");
    expect(formatLastSaved("not-a-date")).toBe("Not synced yet");
    expect(formatLastSaved(new Date("2026-05-25T12:30:00Z"))).toContain("Last saved");
  });
});
