import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type AuditAction =
  | "article.create"
  | "article.delete"
  | "article.status_change"
  | "article.restore"
  | "category.create"
  | "category.delete"
  | "space.customization_update"
  | "space.governance_update"
  | "permission.grant"
  | "permission.revoke"
  | "permission.update"
  | "workspace.invitation_create"
  | "workspace.invitation_resend"
  | "workspace.invitation_revoke"
  | "plugin.install"
  | "plugin.enable"
  | "plugin.disable"
  | "plugin.settings_change"
  | "plugin.route_access"
  | "plugin.job_run"
  | "plugin.hook_failure"
  | "import.preview"
  | "import.execute"
  | "export.create"
  | "export.download"
  | "marketplace.preview"
  | "marketplace.install"
  | "ai.generate_content"
  | "ai.rewrite"
  | "ai.summarize"
  | "ai.taxonomy_change"
  | "admin.failed_operation"
  | "admin.sensitive_action"
  | "security.suspicious_activity"
  | "moderation.discussion_update"
  | "moderation.report"
  | "suggestion.accept"
  | "suggestion.reject"
  | "suggestion.comment"
  | "suggestion.assign"
  | "suggestion.convert_to_task"
  | "suggestion.delete"
  | "user.role_change"
  | "user.delete"
  | "revision.revert"
  | "discussion.delete";

export type AuditSeverity = "info" | "warning" | "high" | "critical";
export type AuditActorType = "user" | "api-key" | "system" | "anonymous";
export type AuditRedactionMode = "full" | "summary" | "standard" | "strict" | "redacted";

export const AUDIT_SCHEMA_VERSION = "arkivel.audit-trail.v1";

export type AuditOptions = {
  workspaceId?: string | null;
  severity?: AuditSeverity;
  actorType?: AuditActorType;
  ipAddress?: string | null;
  userAgent?: string | null;
  success?: boolean;
  request?: Request;
};

export const AUDIT_RETENTION_DEFAULTS = {
  standardDays: 365,
  criticalDays: 2555,
  exportFormats: ["json", "json-redacted"],
  immutable: true,
};

export const AUDIT_ALERT_RULES = [
  { id: "critical-admin-action", severity: "critical", actionPrefix: "admin.", destination: "audit-log" },
  { id: "sensitive-admin-action", severity: "high", action: "admin.sensitive_action", destination: "audit-log" },
  { id: "failed-admin-operation", severity: "warning", action: "admin.failed_operation", destination: "audit-log" },
  { id: "suspicious-activity", severity: "critical", action: "security.suspicious_activity", destination: "audit-log" },
  { id: "plugin-hook-failure", severity: "warning", action: "plugin.hook_failure", destination: "audit-log" },
] as const;

export const auditTrailContract = {
  schemaVersion: AUDIT_SCHEMA_VERSION,
  immutableEvents: [
    "sensitive admin actions",
    "permission updates",
    "customization changes",
    "plugin changes",
    "imports",
    "exports",
    "marketplace installs",
    "AI generated content",
    "AI rewrites",
    "AI summaries",
    "AI taxonomy changes",
  ],
  filters: ["actor", "action", "target", "workspace", "severity", "date", "success"],
  redaction: {
    redactedKeys: ["password", "token", "secret", "apiKey", "authorization", "cookie", "email", "ipAddress", "userAgent"],
    exportModes: ["full", "summary", "standard", "strict"],
  },
  alerts: AUDIT_ALERT_RULES,
  retention: AUDIT_RETENTION_DEFAULTS,
};

export async function logAudit(
  action: AuditAction,
  entity: { type: string; id?: string; label?: string },
  metadata?: Record<string, unknown>,
  options: AuditOptions = {}
) {
  try {
    const session = await getSession();
    const requestIp = options.request
      ? options.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? options.request.headers.get("x-real-ip")
      : null;
    const userAgent = options.userAgent ?? options.request?.headers.get("user-agent") ?? null;

    await prisma.auditLog.create({
      data: {
        userId: session?.id ?? null,
        username: session?.username ?? null,
        action,
        entityType: entity.type,
        entityId: entity.id ?? null,
        entityLabel: entity.label ?? null,
        workspaceId: options.workspaceId ?? null,
        severity: options.severity ?? defaultAuditSeverity(action),
        actorType: options.actorType ?? (session ? "user" : "system"),
        ipAddress: options.ipAddress ?? requestIp ?? null,
        userAgent,
        success: options.success ?? true,
        metadata: metadata ? (metadata as import("@prisma/client").Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    // Audit logging must never break the main operation
  }
}

export function defaultAuditSeverity(action: AuditAction): AuditSeverity {
  if (
    action.includes("delete") ||
    action.includes("disable") ||
    action === "admin.failed_operation" ||
    action === "plugin.hook_failure" ||
    action === "moderation.report"
  ) {
    return "warning";
  }
  if (
    action === "security.suspicious_activity" ||
    action === "marketplace.install" ||
    action === "import.execute" ||
    action === "permission.grant" ||
    action === "permission.revoke"
  ) {
    return "critical";
  }
  if (
    action === "permission.update" ||
    action === "admin.sensitive_action" ||
    action === "export.download" ||
    action.startsWith("ai.") ||
    action.startsWith("suggestion.") ||
    action === "moderation.discussion_update"
  ) {
    return "high";
  }
  return "info";
}

export function shouldAlertOnAuditEvent(event: { action: string; severity?: string | null; success?: boolean | null }) {
  if (event.success === false && event.action.startsWith("admin.")) return true;
  if (event.severity === "critical") return true;
  return AUDIT_ALERT_RULES.some((rule) => {
    if ("action" in rule && rule.action === event.action) return true;
    if ("actionPrefix" in rule && event.action.startsWith(rule.actionPrefix) && event.severity === rule.severity) return true;
    return false;
  });
}

export function redactAuditMetadata(value: unknown, mode: AuditRedactionMode = "standard"): unknown {
  if (mode === "full") return value;
  if (Array.isArray(value)) return value.map((item) => redactAuditMetadata(item, mode));
  if (!value || typeof value !== "object") return value;
  if (mode === "summary") return "[metadata redacted]";

  const redacted: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    const lowerKey = key.toLowerCase();
    const sensitive = auditTrailContract.redaction.redactedKeys.some((needle) => lowerKey.includes(needle.toLowerCase()));
    if (sensitive || mode === "strict") {
      redacted[key] = "[redacted]";
    } else {
      redacted[key] = redactAuditMetadata(child, mode);
    }
  }
  return redacted;
}

export function formatAuditExportEntry<T extends { metadata?: unknown; ipAddress?: string | null; userAgent?: string | null; username?: string | null; userId?: string | null }>(
  entry: T,
  mode: AuditRedactionMode = "standard"
): T {
  if (mode === "full") return entry;
  if (mode === "summary") {
    return {
      ...entry,
      userId: entry.userId ? "[redacted]" : entry.userId,
      username: entry.username ? "[redacted]" : entry.username,
      ipAddress: entry.ipAddress ? "[redacted]" : entry.ipAddress,
      userAgent: entry.userAgent ? "[redacted]" : entry.userAgent,
      metadata: "[metadata redacted]",
    };
  }
  return {
    ...entry,
    ipAddress: entry.ipAddress ? "[redacted]" : entry.ipAddress,
    userAgent: mode === "strict" && entry.userAgent ? "[redacted]" : entry.userAgent,
    username: mode === "strict" && entry.username ? "[redacted]" : entry.username,
    userId: mode === "strict" && entry.userId ? "[redacted]" : entry.userId,
    metadata: redactAuditMetadata(entry.metadata, mode),
  };
}

export function createAuditExport<T extends { metadata?: unknown; ipAddress?: string | null; userAgent?: string | null; username?: string | null; userId?: string | null }>(
  logs: T[],
  options: { redaction?: AuditRedactionMode; exportedAt?: string } = {}
) {
  const redaction = options.redaction ?? "standard";
  return {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    redaction,
    count: logs.length,
    logs: logs.map((entry) => formatAuditExportEntry(entry, redaction)),
  };
}
