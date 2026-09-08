export const OBSERVABILITY_SCHEMA_VERSION = "2026-05-25.v4.87.2";

export const STRUCTURED_LOG_CATEGORIES = [
  "config",
  "auth",
  "prisma",
  "migrations",
  "assets",
  "search",
  "customization",
  "marketplace",
  "plugins",
  "webhooks",
] as const;

export const OBSERVABILITY_METRIC_TYPES = [
  "page_latency",
  "api_latency",
  "editor_autosave",
  "search_response_time",
  "export_duration",
  "import_duration",
  "webhook_delivery",
] as const;

export type StructuredLogCategory = typeof STRUCTURED_LOG_CATEGORIES[number];
export type ObservabilityMetricType = typeof OBSERVABILITY_METRIC_TYPES[number];
export type ObservabilitySeverity = "debug" | "info" | "warning" | "error";

export type StructuredLogEvent = {
  category: StructuredLogCategory;
  message: string;
  metadata: Record<string, unknown>;
  severity: ObservabilitySeverity;
  timestamp: string;
};

export type ObservabilityMetric = {
  duration: number;
  metadata: Record<string, unknown>;
  path: string;
  status?: number;
  timestamp: string;
  type: ObservabilityMetricType;
};

export type AnalyticsPrivacyControls = {
  analyticsEnabled: boolean;
  eventFeedEnabled: boolean;
  ipAnonymization: boolean;
  queryLoggingEnabled: boolean;
  retentionDays: number;
};

export const defaultAnalyticsPrivacyControls: AnalyticsPrivacyControls = {
  analyticsEnabled: true,
  eventFeedEnabled: true,
  ipAnonymization: true,
  queryLoggingEnabled: true,
  retentionDays: 90,
};

export const observabilityContract = {
  schemaVersion: OBSERVABILITY_SCHEMA_VERSION,
  adminRoute: "/admin/observability",
  adminApiRoute: "/api/admin/observability",
  metricIngestRoute: "/api/observability/metrics",
  structuredLogCategories: STRUCTURED_LOG_CATEGORIES,
  metricTypes: OBSERVABILITY_METRIC_TYPES,
  privacyControls: {
    defaults: defaultAnalyticsPrivacyControls,
    storageKey: "observability_privacy_controls",
  },
  eventFeed: {
    defaultLimit: 100,
    source: "MetricLog",
  },
} as const;

const SENSITIVE_KEYS = ["authorization", "cookie", "password", "secret", "token", "apiKey", "key"];

export function createStructuredLogEvent(input: {
  category: StructuredLogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  severity?: ObservabilitySeverity;
  timestamp?: string;
}): StructuredLogEvent {
  return {
    category: input.category,
    message: input.message,
    metadata: redactObservabilityMetadata(input.metadata ?? {}),
    severity: input.severity ?? "info",
    timestamp: input.timestamp ?? new Date().toISOString(),
  };
}

export function createObservabilityMetric(input: {
  duration: number;
  metadata?: Record<string, unknown>;
  path: string;
  status?: number;
  timestamp?: string;
  type: ObservabilityMetricType;
}): ObservabilityMetric {
  return {
    duration: Math.max(0, Math.round(input.duration)),
    metadata: redactObservabilityMetadata(input.metadata ?? {}),
    path: input.path,
    status: input.status,
    timestamp: input.timestamp ?? new Date().toISOString(),
    type: input.type,
  };
}

export function normalizeAnalyticsPrivacyControls(input: Partial<AnalyticsPrivacyControls> = {}): AnalyticsPrivacyControls {
  return {
    analyticsEnabled: input.analyticsEnabled ?? defaultAnalyticsPrivacyControls.analyticsEnabled,
    eventFeedEnabled: input.eventFeedEnabled ?? defaultAnalyticsPrivacyControls.eventFeedEnabled,
    ipAnonymization: input.ipAnonymization ?? defaultAnalyticsPrivacyControls.ipAnonymization,
    queryLoggingEnabled: input.queryLoggingEnabled ?? defaultAnalyticsPrivacyControls.queryLoggingEnabled,
    retentionDays: Number.isFinite(input.retentionDays) && Number(input.retentionDays) > 0
      ? Math.min(365, Math.round(Number(input.retentionDays)))
      : defaultAnalyticsPrivacyControls.retentionDays,
  };
}

export function redactObservabilityMetadata(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        return [key, "[redacted]"];
      }
      if (child && typeof child === "object" && !Array.isArray(child)) {
        return [key, redactObservabilityMetadata(child as Record<string, unknown>)];
      }
      return [key, child];
    }),
  );
}

export function isObservabilityMetricType(value: string): value is ObservabilityMetricType {
  return (OBSERVABILITY_METRIC_TYPES as readonly string[]).includes(value);
}
