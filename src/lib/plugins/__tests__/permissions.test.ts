import { describe, expect, it } from "vitest";
import {
  canGrantPluginPermission,
  canUsePluginPermission,
  getPluginPermissionPrompts,
  pluginPermissionPrompts,
} from "../permissions";

describe("plugin permissions", () => {
  it("provides prompts for every v1 permission scope", () => {
    expect(Object.keys(pluginPermissionPrompts)).toEqual([
      "article:read",
      "article:write",
      "category:read",
      "category:write",
      "user:read",
      "settings:write",
      "webhook:send",
      "file:read",
      "job:execute",
    ]);
    expect(getPluginPermissionPrompts(["article:read", "job:execute"]).map((item) => item.scope)).toEqual([
      "article:read",
      "job:execute",
    ]);
  });

  it("limits grant decisions to admins", () => {
    expect(canGrantPluginPermission({ type: "user", role: "admin" }, "settings:write")).toBe(true);
    expect(canGrantPluginPermission({ type: "user", role: "editor" }, "settings:write")).toBe(false);
    expect(canGrantPluginPermission({ type: "user", role: "viewer" }, "article:read")).toBe(false);
    expect(canGrantPluginPermission({ type: "api-key", userId: "u1" }, "article:read")).toBe(false);
    expect(canGrantPluginPermission({ type: "anonymous" }, "article:read")).toBe(false);
  });

  it("keeps runtime permission defaults role-aware", () => {
    expect(canUsePluginPermission({ type: "user", role: "admin" }, "job:execute")).toBe(true);
    expect(canUsePluginPermission({ type: "user", role: "editor" }, "article:write")).toBe(true);
    expect(canUsePluginPermission({ type: "user", role: "viewer" }, "article:write")).toBe(false);
    expect(canUsePluginPermission({ type: "api-key", userId: "k1" }, "webhook:send")).toBe(true);
    expect(canUsePluginPermission({ type: "anonymous" }, "webhook:send")).toBe(false);
  });
});
