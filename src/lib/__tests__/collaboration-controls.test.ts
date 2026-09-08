import { describe, expect, it } from "vitest";
import {
  COLLABORATION_SURFACES,
  canUseCollaborationSurface,
  collaborationControlsContract,
  shouldRouteMentionNotification,
} from "../collaboration-controls";

describe("collaboration controls", () => {
  it("publishes policy metadata for every collaboration surface", () => {
    expect(collaborationControlsContract.schemaVersion).toBe("arkivel.collaboration-controls.v1");
    expect(collaborationControlsContract.surfaces).toEqual([...COLLABORATION_SURFACES]);
    expect(collaborationControlsContract.visibilityChecks.publicSurfaces).toContain("feed.xml");
  });

  it("keeps collaboration permissions role aware", () => {
    expect(canUseCollaborationSurface("admin", "co-authors", "admin")).toBe(true);
    expect(canUseCollaborationSurface("editor", "edit-locks", "write")).toBe(true);
    expect(canUseCollaborationSurface("viewer", "comments", "comment")).toBe(true);
    expect(canUseCollaborationSurface("viewer", "edit-locks", "write")).toBe(false);
    expect(canUseCollaborationSurface("public-reader", "mentions", "comment")).toBe(false);
  });

  it("routes mention notifications only to eligible workspace members", () => {
    expect(
      shouldRouteMentionNotification({
        authorId: "author",
        mentionedUserId: "editor",
        mentionedUserIsWorkspaceMember: true,
      })
    ).toBe(true);
    expect(
      shouldRouteMentionNotification({
        authorId: "editor",
        mentionedUserId: "editor",
        mentionedUserIsWorkspaceMember: true,
      })
    ).toBe(false);
    expect(
      shouldRouteMentionNotification({
        mentionedUserId: "outsider",
        mentionedUserIsWorkspaceMember: false,
      })
    ).toBe(false);
    expect(
      shouldRouteMentionNotification({
        mentionedUserId: "muted",
        mentionedUserIsWorkspaceMember: true,
        notifyOnMention: false,
      })
    ).toBe(false);
  });
});

