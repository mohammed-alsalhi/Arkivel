import { describe, expect, it } from "vitest";
import {
  MODERATION_SCHEMA_VERSION,
  estimateContributionSpamScore,
  moderationContract,
  moderationStateForSpamScore,
  normalizeDiscussionStatus,
  normalizeDiscussionVisibility,
  normalizeSuggestionStatus,
} from "../moderation";

describe("moderation contract", () => {
  it("publishes discussion, suggestion, and public contribution planning metadata", () => {
    expect(moderationContract.schemaVersion).toBe(MODERATION_SCHEMA_VERSION);
    expect(moderationContract.discussion.statuses).toEqual(expect.arrayContaining(["visible", "reported", "hidden", "removed"]));
    expect(moderationContract.discussion.visibilities).toContain("reviewers");
    expect(moderationContract.suggestions.actions).toEqual(expect.arrayContaining(["accept", "reject", "comment", "assign", "convert-to-task"]));
    expect(moderationContract.publicContributionPlanning.defaultRateLimit.anonymousPerHour).toBeGreaterThan(0);
  });

  it("normalizes moderation enums defensively", () => {
    expect(normalizeDiscussionStatus("reported")).toBe("reported");
    expect(normalizeDiscussionStatus("unknown")).toBeNull();
    expect(normalizeDiscussionVisibility("reviewers")).toBe("reviewers");
    expect(normalizeSuggestionStatus("converted")).toBe("converted");
  });

  it("scores obvious public contribution spam signals", () => {
    const score = estimateContributionSpamScore({
      author: "Anonymous",
      email: "bad-email",
      content: "buy now http://a.example http://b.example http://c.example crypto giveaway",
    });

    expect(score).toBeGreaterThanOrEqual(70);
    expect(moderationStateForSpamScore(score)).toBe("blocked");
    expect(moderationStateForSpamScore(45)).toBe("needs_review");
    expect(moderationStateForSpamScore(10)).toBe("open");
  });
});
