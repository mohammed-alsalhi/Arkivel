export const ROLE_TEMPLATE_SCHEMA_VERSION = "arkivel.role-templates.v1";

export const ROLE_TEMPLATE_IDS = [
  "personal-admin",
  "team-owner",
  "docs-maintainer",
  "editor",
  "reviewer",
  "contributor",
  "viewer",
  "public-reader",
] as const;

export const PERMISSION_SURFACES = [
  "pages",
  "apis",
  "exports",
  "webhooks",
  "plugins",
  "customization",
  "marketplace",
] as const;

export type RoleTemplateId = (typeof ROLE_TEMPLATE_IDS)[number];
export type PermissionSurface = (typeof PERMISSION_SURFACES)[number];
export type PermissionLevel = "none" | "read" | "comment" | "write" | "admin";
export type ActorKind = "anonymous" | "api-key" | "user";

export type RoleTemplate = {
  id: RoleTemplateId;
  label: string;
  baseRole: "admin" | "editor" | "viewer" | "anonymous";
  description: string;
  invitationDefault: boolean;
  permissions: Record<PermissionSurface, PermissionLevel>;
  notes: string[];
};

export type PermissionActor = {
  kind: ActorKind;
  role?: "admin" | "editor" | "viewer" | string;
  templateId?: RoleTemplateId;
};

function permissions(
  pages: PermissionLevel,
  apis: PermissionLevel,
  exports: PermissionLevel,
  webhooks: PermissionLevel,
  plugins: PermissionLevel,
  customization: PermissionLevel,
  marketplace: PermissionLevel
): Record<PermissionSurface, PermissionLevel> {
  return { pages, apis, exports, webhooks, plugins, customization, marketplace };
}

export const roleTemplates: RoleTemplate[] = [
  {
    id: "personal-admin",
    label: "Personal Admin",
    baseRole: "admin",
    description: "Single-owner install with full local control and recovery responsibility.",
    invitationDefault: false,
    permissions: permissions("admin", "admin", "admin", "admin", "admin", "admin", "admin"),
    notes: ["Best fit for personal and private archive workspaces."],
  },
  {
    id: "team-owner",
    label: "Team Owner",
    baseRole: "admin",
    description: "Workspace owner who manages members, settings, integrations, and release-sensitive actions.",
    invitationDefault: false,
    permissions: permissions("admin", "admin", "admin", "admin", "admin", "admin", "admin"),
    notes: ["Can grant plugin permissions and manage marketplace selections."],
  },
  {
    id: "docs-maintainer",
    label: "Docs Maintainer",
    baseRole: "editor",
    description: "Trusted maintainer for public docs, review queues, exports, and content operations.",
    invitationDefault: true,
    permissions: permissions("write", "write", "read", "read", "read", "read", "read"),
    notes: ["Can edit docs content without owning plugin or webhook configuration."],
  },
  {
    id: "editor",
    label: "Editor",
    baseRole: "editor",
    description: "General content editor with article, category, tag, and review access.",
    invitationDefault: true,
    permissions: permissions("write", "write", "read", "none", "read", "read", "read"),
    notes: ["Cannot enable plugins or change webhook destinations."],
  },
  {
    id: "reviewer",
    label: "Reviewer",
    baseRole: "editor",
    description: "Editorial reviewer focused on approvals, comments, claim checks, and review queues.",
    invitationDefault: true,
    permissions: permissions("comment", "read", "none", "none", "none", "none", "read"),
    notes: ["Use for people who should review without broad publishing control."],
  },
  {
    id: "contributor",
    label: "Contributor",
    baseRole: "viewer",
    description: "Authenticated contributor who can propose changes and participate in discussions.",
    invitationDefault: true,
    permissions: permissions("comment", "read", "none", "none", "none", "none", "read"),
    notes: ["Future suggestion flows can map to this template without granting direct writes."],
  },
  {
    id: "viewer",
    label: "Viewer",
    baseRole: "viewer",
    description: "Authenticated reader for private or members-only workspaces.",
    invitationDefault: true,
    permissions: permissions("read", "read", "none", "none", "none", "none", "read"),
    notes: ["Can read permitted published content and public marketplace metadata."],
  },
  {
    id: "public-reader",
    label: "Public Reader",
    baseRole: "anonymous",
    description: "Anonymous public reader for published content in public workspaces.",
    invitationDefault: false,
    permissions: permissions("read", "read", "none", "none", "none", "none", "read"),
    notes: ["Never sees drafts, private draft config, admin settings, or API keys."],
  },
];

export const permissionMatrix = {
  schemaVersion: ROLE_TEMPLATE_SCHEMA_VERSION,
  surfaces: PERMISSION_SURFACES,
  templates: roleTemplates.map(({ id, label, baseRole, permissions }) => ({ id, label, baseRole, permissions })),
};

export const accountRecoveryGuide = {
  selfHosted: [
    "Keep ADMIN_SECRET in the deployment secret store, not in source control.",
    "If all admin sessions are lost, temporarily restore ADMIN_SECRET access, sign in, and rotate the secret afterward.",
    "For database-backed users, promote exactly one known account to admin from a trusted database console, then audit membership changes.",
    "Revoke stale sessions and API keys after recovery.",
  ],
  hostedTeam: [
    "Keep at least two team-owner or personal-admin accounts in production workspaces.",
    "Review workspace invitations before recovery so expired or revoked invitations cannot be reused.",
  ],
};

export const roleTemplateContract = {
  schemaVersion: ROLE_TEMPLATE_SCHEMA_VERSION,
  templates: roleTemplates,
  permissionMatrix,
  invitationFlow: {
    expirationDays: 14,
    actions: ["create", "resend", "revoke", "accept"],
    auditEvents: ["workspace.invitation_create", "workspace.invitation_resend", "workspace.invitation_revoke"],
  },
  accountRecoveryGuide,
};

export function getRoleTemplate(id: RoleTemplateId | string | null | undefined): RoleTemplate | undefined {
  return roleTemplates.find((template) => template.id === id);
}

export function getDefaultTemplateForRole(role: string | null | undefined): RoleTemplate {
  if (role === "admin") return getRoleTemplate("team-owner")!;
  if (role === "editor") return getRoleTemplate("editor")!;
  if (role === "viewer") return getRoleTemplate("viewer")!;
  return getRoleTemplate("public-reader")!;
}

export function canActorUseSurface(actor: PermissionActor, surface: PermissionSurface, required: PermissionLevel): boolean {
  const template = actor.templateId ? getRoleTemplate(actor.templateId) : getDefaultTemplateForRole(actor.role);
  if (!template) return false;
  if (actor.kind === "anonymous" && template.baseRole !== "anonymous") return false;
  if (actor.kind === "api-key" && ["plugins", "customization", "marketplace"].includes(surface) && required !== "read") {
    return false;
  }
  return levelValue(template.permissions[surface]) >= levelValue(required);
}

function levelValue(level: PermissionLevel): number {
  return { none: 0, read: 1, comment: 2, write: 3, admin: 4 }[level];
}

