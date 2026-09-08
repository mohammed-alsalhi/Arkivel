export const OPERATIONS_DASHBOARD_SCHEMA_VERSION = "2026-05-25.v4.87.0";

export type OperationsStatus = "healthy" | "degraded" | "critical" | "unknown";

export type OperationsQueue = {
  description: string;
  failed: number;
  id: string;
  pending: number;
  processed24h: number;
  route: string;
  title: string;
};

export type OperationsService = {
  checks: string[];
  id: string;
  message: string;
  route?: string;
  status: OperationsStatus;
  title: string;
};

export type OperationsMetric = {
  description: string;
  id: string;
  label: string;
  route?: string;
  status: OperationsStatus;
  value: number | string;
};

export type OperationsAlert = {
  acknowledgeKey: string;
  createdAt: string;
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
  source: string;
  status: "open" | "acknowledged";
  title: string;
};

export type OperationsDiagnosticBundle = {
  generatedAt: string;
  redactions: string[];
  sections: {
    id: string;
    included: boolean;
    label: string;
    notes: string;
  }[];
};

export type OperationsDashboardReport = {
  alerts: OperationsAlert[];
  bundle: OperationsDiagnosticBundle;
  generatedAt: string;
  metrics: OperationsMetric[];
  queues: OperationsQueue[];
  schemaVersion: string;
  services: OperationsService[];
  slowPages: OperationsMetric[];
};

export const operationsDashboardContract = {
  schemaVersion: OPERATIONS_DASHBOARD_SCHEMA_VERSION,
  adminRoute: "/admin/operations",
  apiRoute: "/api/admin/operations",
  supportBundle: {
    route: "/api/admin/operations?bundle=1",
    redactions: [
      "webhook secrets",
      "API keys",
      "session tokens",
      "password hashes",
      "raw environment values",
      "full article content",
    ],
  },
  alertAcknowledgements: {
    storageKey: "arkivel:operations-alert-acks",
    scope: "browser-local admin acknowledgement state",
  },
  serviceCards: [
    "database",
    "prisma",
    "storage",
    "AI providers",
    "webhooks",
    "search",
    "background jobs",
  ],
  queueCards: [
    "webhook deliveries",
    "imports",
    "exports",
    "plugin load errors",
    "slow pages",
    "database health",
  ],
} as const;

export function getOperationsStatusScore(status: OperationsStatus): number {
  if (status === "critical") return 3;
  if (status === "degraded") return 2;
  if (status === "unknown") return 1;
  return 0;
}

export function summarizeOperationsStatus(statuses: OperationsStatus[]): OperationsStatus {
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("degraded")) return "degraded";
  if (statuses.includes("unknown")) return "unknown";
  return "healthy";
}

export function buildOperationsAlert(input: {
  count?: number;
  generatedAt: string;
  id: string;
  message: string;
  severity?: OperationsAlert["severity"];
  source: string;
  threshold?: number;
  title: string;
}): OperationsAlert | null {
  const count = input.count ?? 1;
  const threshold = input.threshold ?? 1;
  if (count < threshold) return null;

  return {
    acknowledgeKey: `${OPERATIONS_DASHBOARD_SCHEMA_VERSION}:${input.id}`,
    createdAt: input.generatedAt,
    id: input.id,
    message: input.message,
    severity: input.severity ?? "warning",
    source: input.source,
    status: "open",
    title: input.title,
  };
}

export function createDiagnosticBundle(generatedAt: string): OperationsDiagnosticBundle {
  return {
    generatedAt,
    redactions: [...operationsDashboardContract.supportBundle.redactions],
    sections: [
      {
        id: "summary",
        included: true,
        label: "Instance summary",
        notes: "Version, feature flags, counts, and health grades without secrets.",
      },
      {
        id: "webhooks",
        included: true,
        label: "Webhook delivery health",
        notes: "Delivery counts, status codes, and timestamps without webhook secrets or full payloads.",
      },
      {
        id: "imports-exports",
        included: true,
        label: "Import and export activity",
        notes: "Recent job status and manifest summaries without exported content.",
      },
      {
        id: "plugins",
        included: true,
        label: "Plugin health",
        notes: "Plugin ids, versions, enablement, permission prompts, and load errors.",
      },
      {
        id: "metrics",
        included: true,
        label: "Performance metrics",
        notes: "Slow routes, error counts, and aggregate timings.",
      },
    ],
  };
}

export function applyAcknowledgements(
  alerts: OperationsAlert[],
  acknowledgedKeys: string[],
): OperationsAlert[] {
  const acknowledged = new Set(acknowledgedKeys);
  return alerts.map((alert) => ({
    ...alert,
    status: acknowledged.has(alert.acknowledgeKey) ? "acknowledged" : "open",
  }));
}

export function createOperationsDashboardReport(input: {
  alerts?: OperationsAlert[];
  generatedAt?: string;
  metrics: OperationsMetric[];
  queues: OperationsQueue[];
  services: OperationsService[];
  slowPages: OperationsMetric[];
}): OperationsDashboardReport {
  const generatedAt = input.generatedAt ?? new Date().toISOString();

  return {
    alerts: [...(input.alerts ?? [])].sort(
      (a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity),
    ),
    bundle: createDiagnosticBundle(generatedAt),
    generatedAt,
    metrics: input.metrics,
    queues: input.queues,
    schemaVersion: OPERATIONS_DASHBOARD_SCHEMA_VERSION,
    services: input.services,
    slowPages: input.slowPages,
  };
}

function getSeverityScore(severity: OperationsAlert["severity"]): number {
  if (severity === "critical") return 3;
  if (severity === "warning") return 2;
  return 1;
}
