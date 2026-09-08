import { describe, expect, it } from "vitest";
import { COMMAND_DESTINATIONS, isFocusedWorkspacePath } from "../navigation";

describe("navigation registry", () => {
  it("recognizes focused workspace routes", () => {
    expect(isFocusedWorkspacePath("/ask")).toBe(true);
    expect(isFocusedWorkspacePath("/graph")).toBe(true);
    expect(isFocusedWorkspacePath("/split")).toBe(true);
    expect(isFocusedWorkspacePath("/map/world")).toBe(true);
    expect(isFocusedWorkspacePath("/present/example")).toBe(true);
  });

  it("does not hide mobile navigation on normal browsing routes", () => {
    expect(isFocusedWorkspacePath("/")).toBe(false);
    expect(isFocusedWorkspacePath("/articles")).toBe(false);
    expect(isFocusedWorkspacePath("/search")).toBe(false);
  });

  it("keeps command destinations unique by id and href", () => {
    const ids = new Set(COMMAND_DESTINATIONS.map((destination) => destination.id));
    const hrefs = new Set(COMMAND_DESTINATIONS.map((destination) => destination.href));

    expect(ids.size).toBe(COMMAND_DESTINATIONS.length);
    expect(hrefs.size).toBe(COMMAND_DESTINATIONS.length);
  });
});
