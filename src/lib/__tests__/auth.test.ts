import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    session: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { requireAdmin, requireRole, type SessionUser } from "../auth";

describe("requireAdmin", () => {
  it("returns null when authorized", () => {
    expect(requireAdmin(true)).toBeNull();
  });
  it("returns 401 response when unauthorized", () => {
    const result = requireAdmin(false);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });
});

describe("requireRole", () => {
  const admin: SessionUser = {
    id: "1",
    username: "admin",
    email: "admin@test.com",
    displayName: "Admin",
    role: "admin",
  };
  const editor: SessionUser = {
    id: "2",
    username: "editor",
    email: "editor@test.com",
    displayName: "Editor",
    role: "editor",
  };
  const viewer: SessionUser = {
    id: "3",
    username: "viewer",
    email: "viewer@test.com",
    displayName: "Viewer",
    role: "viewer",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for null user", () => {
    const result = requireRole(null, "viewer");
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("allows admin to access all roles", () => {
    expect(requireRole(admin, "admin")).toBeNull();
    expect(requireRole(admin, "editor")).toBeNull();
    expect(requireRole(admin, "viewer")).toBeNull();
  });

  it("allows editor to access editor and viewer", () => {
    expect(requireRole(editor, "editor")).toBeNull();
    expect(requireRole(editor, "viewer")).toBeNull();
  });

  it("denies editor from admin role", () => {
    const result = requireRole(editor, "admin");
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("allows viewer to access viewer only", () => {
    expect(requireRole(viewer, "viewer")).toBeNull();
  });

  it("denies viewer from editor role", () => {
    const result = requireRole(viewer, "editor");
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("denies viewer from admin role", () => {
    const result = requireRole(viewer, "admin");
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});
