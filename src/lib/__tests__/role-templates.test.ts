import { describe, expect, it } from "vitest";
import {
  PERMISSION_SURFACES,
  ROLE_TEMPLATE_IDS,
  canActorUseSurface,
  getDefaultTemplateForRole,
  getRoleTemplate,
  roleTemplateContract,
  roleTemplates,
} from "../role-templates";

describe("role templates", () => {
  it("defines every v4.82.1 role template", () => {
    expect(roleTemplates.map((template) => template.id)).toEqual([...ROLE_TEMPLATE_IDS]);
    for (const template of roleTemplates) {
      expect(Object.keys(template.permissions).sort()).toEqual([...PERMISSION_SURFACES].sort());
    }
  });

  it("publishes a permission matrix for product docs and UI", () => {
    expect(roleTemplateContract.schemaVersion).toBe("arkivel.role-templates.v1");
    expect(roleTemplateContract.permissionMatrix.surfaces).toContain("exports");
    expect(roleTemplateContract.permissionMatrix.templates).toHaveLength(ROLE_TEMPLATE_IDS.length);
  });

  it("maps base roles to conservative defaults", () => {
    expect(getDefaultTemplateForRole("admin").id).toBe("team-owner");
    expect(getDefaultTemplateForRole("editor").id).toBe("editor");
    expect(getDefaultTemplateForRole("viewer").id).toBe("viewer");
    expect(getDefaultTemplateForRole(null).id).toBe("public-reader");
  });

  it("covers invitation defaults without making public readers inviteable", () => {
    expect(getRoleTemplate("docs-maintainer")?.invitationDefault).toBe(true);
    expect(getRoleTemplate("public-reader")?.invitationDefault).toBe(false);
  });

  it("keeps admin/editor/viewer/api-key behavior distinct", () => {
    expect(canActorUseSurface({ kind: "user", role: "admin" }, "plugins", "admin")).toBe(true);
    expect(canActorUseSurface({ kind: "user", role: "editor" }, "pages", "write")).toBe(true);
    expect(canActorUseSurface({ kind: "user", role: "viewer" }, "pages", "write")).toBe(false);
    expect(canActorUseSurface({ kind: "api-key", role: "editor" }, "apis", "write")).toBe(true);
    expect(canActorUseSurface({ kind: "api-key", role: "admin" }, "plugins", "admin")).toBe(false);
    expect(canActorUseSurface({ kind: "anonymous", templateId: "public-reader" }, "pages", "read")).toBe(true);
  });

  it("includes self-host admin recovery guidance", () => {
    expect(roleTemplateContract.accountRecoveryGuide.selfHosted.join(" ")).toContain("ADMIN_SECRET");
    expect(roleTemplateContract.invitationFlow.actions).toEqual(["create", "resend", "revoke", "accept"]);
  });
});

