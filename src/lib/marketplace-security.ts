export const MARKETPLACE_SECURITY_SCHEMA_VERSION = "2026-05-25.v4.89.2";

export const BLOCKED_MARKETPLACE_PERMISSIONS = [
  "admin:all",
  "filesystem:*",
  "shell:*",
  "system:*",
  "network:*",
] as const;

export const DANGEROUS_PLUGIN_CAPABILITIES = [
  {
    capability: "file:read",
    warning: "Can read explicitly configured local files during trusted local operations.",
  },
  {
    capability: "job:execute",
    warning: "Can run declared manual or scheduled jobs and should be reviewed for side effects.",
  },
  {
    capability: "settings:write",
    warning: "Can request settings changes that may affect the whole instance.",
  },
  {
    capability: "webhook:send",
    warning: "Can send data to configured external receivers.",
  },
] as const;

export const BLOCKED_HOOK_PREFIXES = ["system.", "shell.", "filesystem.", "process.", "child_process.", "network."] as const;

export const packProvenancePlan = {
  required: ["source.path", "source.remote=false", "checksums.manifest", "license", "author", "compatibility"],
  plannedVerification: [
    "Compare manifest checksum before local install.",
    "Verify screenshot checksums when screenshots are bundled.",
    "Record source path and schema version in install intent logs.",
    "Reject remote sources and executable install payloads before any install flow.",
  ],
} as const;

export const localOnlyExtensionSecurityDocs = {
  docs: "docs/secure-marketplace-plugins.md",
  installBoundary: "Marketplace previews and trusted plugin discovery are local-only; Arkivel does not fetch remote code or run install scripts.",
  operatorChecklist: [
    "Review manifest permissions and dangerous capability warnings.",
    "Confirm source.remote is false and source.path is local.",
    "Verify checksums and compatibility before copying files into a trusted plugin or pack directory.",
    "Keep plugins disabled until an admin explicitly enables them.",
  ],
} as const;

export const marketplaceSecurityContract = {
  apiRoute: "/api/marketplace/security",
  blockedHookPrefixes: BLOCKED_HOOK_PREFIXES,
  blockedPermissions: BLOCKED_MARKETPLACE_PERMISSIONS,
  dangerousCapabilities: DANGEROUS_PLUGIN_CAPABILITIES.map((item) => item.capability),
  docs: localOnlyExtensionSecurityDocs.docs,
  excessivePermissionThreshold: 5,
  provenanceRequired: packProvenancePlan.required,
  schemaVersion: MARKETPLACE_SECURITY_SCHEMA_VERSION,
} as const;

export function isBlockedMarketplacePermission(permission: string) {
  return (
    permission.includes("*") ||
    permission === "admin:all" ||
    permission.startsWith("filesystem:") ||
    permission.startsWith("shell:") ||
    permission.startsWith("system:") ||
    permission.startsWith("network:")
  );
}

export function isUnsafeMarketplaceHook(hook: string) {
  const normalized = hook.trim().toLowerCase();
  return normalized.includes("*") || BLOCKED_HOOK_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function hasExcessiveMarketplacePermissions(permissions: readonly string[]) {
  return permissions.length > marketplaceSecurityContract.excessivePermissionThreshold;
}

export function getDangerousCapabilityWarnings(permissions: readonly string[]) {
  return DANGEROUS_PLUGIN_CAPABILITIES.filter((item) => permissions.includes(item.capability)).map((item) => item.warning);
}
