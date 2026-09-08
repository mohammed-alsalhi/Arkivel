import packageJson from "../../package.json";

export const PLUGIN_MANIFEST_SCHEMA_VERSION = "arkivel.plugin.v1";
export const PLUGIN_API_VERSION = "arkivel.plugin-api.v1";

export const PLUGIN_PERMISSION_SCOPES = [
  "article:read",
  "article:write",
  "category:read",
  "category:write",
  "user:read",
  "settings:write",
  "webhook:send",
  "file:read",
  "job:execute",
] as const;

export const PLUGIN_HOOKS = [
  "article.beforeCreate",
  "article.afterCreate",
  "article.beforeUpdate",
  "article.afterUpdate",
  "article.render",
  "dashboard.render",
  "search.afterQuery",
  "webhook.beforeSend",
] as const;

export const PLUGIN_WEBHOOK_EVENTS = [
  "article.created",
  "article.updated",
  "article.deleted",
  "review.requested",
  "review.completed",
  "space.health.changed",
] as const;

export type PluginPermissionScope = (typeof PLUGIN_PERMISSION_SCOPES)[number];
export type PluginHook = (typeof PLUGIN_HOOKS)[number];
export type PluginWebhookEvent = (typeof PLUGIN_WEBHOOK_EVENTS)[number];

export type PluginManifestCompatibility = {
  arkivel: string;
  node?: string;
  pluginApi: typeof PLUGIN_API_VERSION;
};

export type PluginManifestSetting = {
  defaultValue?: boolean | number | string;
  description: string;
  key: string;
  label: string;
  options?: string[];
  required?: boolean;
  type: "boolean" | "number" | "select" | "string" | "url" | "secret";
};

export type PluginManifestRoute = {
  adminOnly?: boolean;
  id: string;
  label: string;
  path: string;
  title: string;
};

export type PluginManifestWidget = {
  id: string;
  placement: "admin-dashboard" | "article-sidebar" | "homepage" | "space-dashboard";
  title: string;
};

export type PluginManifestJob = {
  id: string;
  permission: "job:execute";
  schedule: "manual" | "hourly" | "daily" | "weekly";
  title: string;
};

export type PluginManifestStorage = {
  namespace: string;
  quotaKb: number;
  retention: "ephemeral" | "persistent";
  schemaVersion: string;
};

export type PluginManifestWebhook = {
  events: PluginWebhookEvent[];
  id: string;
  secretEnvVar?: string;
  urlEnvVar: string;
};

export type ArkivelPluginManifest = {
  apiScopes: PluginPermissionScope[];
  author: string;
  compatibility: PluginManifestCompatibility;
  description: string;
  hooks: PluginHook[];
  id: string;
  identity: {
    homepage?: string;
    name: string;
    slug: string;
  };
  jobs: PluginManifestJob[];
  kind: "plugin";
  license: string;
  permissions: PluginPermissionScope[];
  routes: PluginManifestRoute[];
  schemaVersion: typeof PLUGIN_MANIFEST_SCHEMA_VERSION;
  settings: PluginManifestSetting[];
  storage: PluginManifestStorage;
  version: string;
  webhooks: PluginManifestWebhook[];
  widgets: PluginManifestWidget[];
};

export type PluginManifestIssue = {
  code: string;
  field: string;
  message: string;
  severity: "error" | "warning";
};

export type PluginManifestValidation = {
  issues: PluginManifestIssue[];
  valid: boolean;
};

export const pluginManifestSchema = {
  schemaVersion: PLUGIN_MANIFEST_SCHEMA_VERSION,
  pluginApiVersion: PLUGIN_API_VERSION,
  fields: [
    "schemaVersion",
    "kind",
    "id",
    "identity",
    "version",
    "compatibility",
    "permissions",
    "routes",
    "settings",
    "widgets",
    "hooks",
    "jobs",
    "storage",
    "apiScopes",
    "webhooks",
  ],
  hooks: PLUGIN_HOOKS,
  permissions: PLUGIN_PERMISSION_SCOPES,
  routeBoundary: "Routes must be local absolute paths under /plugins and cannot shadow core Arkivel admin/auth/api routes.",
  storageBoundary: "Storage namespace must match plugin id and declare schema version, retention policy, and quota in kilobytes.",
  webhookBoundary: "Webhooks declare supported events and environment-variable names; manifests must not contain literal remote URLs.",
  webhookEvents: PLUGIN_WEBHOOK_EVENTS,
};

export const pluginCompatibilityMatrix = [
  {
    arkivel: ">=4.80.0 <5.0.0",
    notes: "Manifest schema preview; no runtime loader enabled by default.",
    pluginApi: PLUGIN_API_VERSION,
    status: "beta",
  },
  {
    arkivel: ">=4.81.0 <5.0.0",
    notes: "Trusted local loader planned; manifest remains declarative and local-first.",
    pluginApi: PLUGIN_API_VERSION,
    status: "planned",
  },
  {
    arkivel: ">=5.0.0",
    notes: "Stable plugin API requires release-candidate evidence gates before guarantee.",
    pluginApi: PLUGIN_API_VERSION,
    status: "target",
  },
];

export const plannedPluginExamples: ArkivelPluginManifest[] = [
  createPluginExample({
    description: "Capture browser selections and send them into Arkivel as draft articles.",
    hooks: ["article.beforeCreate", "article.afterCreate"],
    id: "web-clipper",
    jobs: [],
    permissions: ["article:write", "category:read"],
    routes: [route("clipper", "/plugins/web-clipper", "Web Clipper")],
    settings: [setting("defaultCategoryId", "Default category", "string")],
    widgets: [widget("capture-button", "homepage", "Capture Button")],
  }),
  createPluginExample({
    description: "Import content from a local JSON adapter into draft articles.",
    hooks: ["article.beforeCreate"],
    id: "import-adapter",
    jobs: [job("import-dry-run", "manual", "Import Dry Run")],
    permissions: ["article:write", "category:write", "file:read", "job:execute"],
    routes: [route("import", "/plugins/import-adapter", "Import Adapter")],
    settings: [setting("sourcePath", "Local source path", "string")],
    widgets: [widget("import-status", "admin-dashboard", "Import Status")],
  }),
  createPluginExample({
    description: "Export curated article sets to an external webhook endpoint.",
    hooks: ["webhook.beforeSend"],
    id: "export-adapter",
    jobs: [job("scheduled-export", "weekly", "Scheduled Export")],
    permissions: ["article:read", "webhook:send", "job:execute"],
    routes: [route("export", "/plugins/export-adapter", "Export Adapter")],
    settings: [setting("webhookUrl", "Webhook URL", "url")],
    widgets: [widget("export-health", "admin-dashboard", "Export Health")],
  }),
  createPluginExample({
    description: "Render a dashboard widget for operational health checks.",
    hooks: ["dashboard.render"],
    id: "dashboard-widget",
    jobs: [],
    permissions: ["article:read"],
    routes: [],
    settings: [setting("label", "Widget label", "string")],
    widgets: [widget("health-card", "admin-dashboard", "Health Card")],
  }),
  createPluginExample({
    description: "Add an editor command that inserts a reusable article block.",
    hooks: ["article.render"],
    id: "editor-command",
    jobs: [],
    permissions: ["article:read", "article:write"],
    routes: [route("command-docs", "/plugins/editor-command", "Editor Command")],
    settings: [setting("blockTemplate", "Block template", "string")],
    widgets: [],
  }),
  createPluginExample({
    description: "Bridge article events to local notification webhooks.",
    hooks: ["article.afterCreate", "article.afterUpdate", "webhook.beforeSend"],
    id: "notification-bridge",
    jobs: [job("retry-notifications", "hourly", "Retry Notifications")],
    permissions: ["article:read", "webhook:send", "job:execute"],
    routes: [route("notifications", "/plugins/notification-bridge", "Notification Bridge")],
    settings: [setting("webhookUrl", "Webhook URL", "url")],
    widgets: [widget("notification-health", "admin-dashboard", "Notification Health")],
  }),
];

export function validateArkivelPluginManifest(input: unknown): PluginManifestValidation {
  const issues: PluginManifestIssue[] = [];
  const manifest = input as Partial<ArkivelPluginManifest>;

  if (!manifest || typeof manifest !== "object") {
    return { issues: [issue("invalid-manifest", "root", "Plugin manifest must be an object.")], valid: false };
  }

  if (manifest.schemaVersion !== PLUGIN_MANIFEST_SCHEMA_VERSION) {
    issues.push(issue("unsupported-schema", "schemaVersion", `Expected ${PLUGIN_MANIFEST_SCHEMA_VERSION}.`));
  }
  if (manifest.kind !== "plugin") issues.push(issue("unsupported-kind", "kind", "kind must be plugin."));
  if (!isSafeId(manifest.id)) issues.push(issue("invalid-id", "id", "id must be a stable lowercase local id."));
  if (!manifest.identity || typeof manifest.identity !== "object") {
    issues.push(issue("missing-identity", "identity", "identity is required."));
  } else {
    if (!manifest.identity.name?.trim()) issues.push(issue("missing-name", "identity.name", "identity.name is required."));
    if (!isSafeId(manifest.identity.slug)) issues.push(issue("invalid-slug", "identity.slug", "identity.slug must be a stable local id."));
  }
  if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    issues.push(issue("invalid-version", "version", "version must be semantic, for example 1.0.0."));
  }
  validateCompatibility(manifest.compatibility, issues);
  validatePermissions(manifest.permissions, "permissions", issues);
  validatePermissions(manifest.apiScopes, "apiScopes", issues);
  validateRoutes(manifest.routes, issues);
  validateSettings(manifest.settings, issues);
  validateWidgets(manifest.widgets, issues);
  validateHooks(manifest.hooks, issues);
  validateJobs(manifest.jobs, issues);
  validateStorage(manifest.storage, manifest.id, issues);
  validateWebhooks(manifest.webhooks, issues);
  if (hasUnsafeJsonValue(manifest)) {
    issues.push(issue("unsafe-reference", "root", "Manifest cannot include remote code references, literal URLs, commands, or path traversal."));
  }

  return { issues, valid: issues.every((item) => item.severity !== "error") };
}

function createPluginExample(config: {
  description: string;
  hooks: PluginHook[];
  id: string;
  jobs: PluginManifestJob[];
  permissions: PluginPermissionScope[];
  routes: PluginManifestRoute[];
  settings: PluginManifestSetting[];
  widgets: PluginManifestWidget[];
}): ArkivelPluginManifest {
  return {
    apiScopes: config.permissions,
    author: "Arkivel",
    compatibility: {
      arkivel: ">=4.80.0 <5.0.0",
      node: ">=20",
      pluginApi: PLUGIN_API_VERSION,
    },
    description: config.description,
    hooks: config.hooks,
    id: config.id,
    identity: {
      name: titleize(config.id),
      slug: config.id,
    },
    jobs: config.jobs,
    kind: "plugin",
    license: "MIT",
    permissions: config.permissions,
    routes: config.routes,
    schemaVersion: PLUGIN_MANIFEST_SCHEMA_VERSION,
    settings: config.settings,
    storage: { namespace: config.id, quotaKb: 512, retention: "persistent", schemaVersion: "1.0.0" },
    version: "0.1.0",
    webhooks: config.permissions.includes("webhook:send")
      ? [{ events: ["article.created", "article.updated"], id: `${config.id}-webhook`, secretEnvVar: `${envPrefix(config.id)}_SECRET`, urlEnvVar: `${envPrefix(config.id)}_WEBHOOK_URL` }]
      : [],
    widgets: config.widgets,
  };
}

function validateCompatibility(value: unknown, issues: PluginManifestIssue[]) {
  const compatibility = value as Partial<PluginManifestCompatibility> | undefined;
  if (!compatibility || typeof compatibility !== "object") {
    issues.push(issue("missing-compatibility", "compatibility", "compatibility must declare Arkivel and plugin API support."));
    return;
  }
  if (!compatibility.arkivel?.startsWith(">=")) {
    issues.push(issue("invalid-arkivel-compatibility", "compatibility.arkivel", "compatibility.arkivel must declare a supported range such as >=4.80.0 <5.0.0."));
  }
  if (compatibility.pluginApi !== PLUGIN_API_VERSION) {
    issues.push(issue("unsupported-api-version", "compatibility.pluginApi", `Expected plugin API ${PLUGIN_API_VERSION}.`));
  }
}

function validatePermissions(value: unknown, field: string, issues: PluginManifestIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("invalid-permissions", field, `${field} must be an array.`));
    return;
  }
  for (const permission of value) {
    if (!PLUGIN_PERMISSION_SCOPES.includes(permission as PluginPermissionScope)) {
      issues.push(issue("unsupported-permission", field, `Unsupported permission: ${String(permission)}.`));
    }
  }
}

function validateRoutes(value: unknown, issues: PluginManifestIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("invalid-routes", "routes", "routes must be an array."));
    return;
  }
  for (const routeItem of value as PluginManifestRoute[]) {
    if (!isSafeId(routeItem.id)) issues.push(issue("invalid-route-id", "routes.id", `Invalid route id: ${String(routeItem.id)}.`));
    if (!routeItem.path?.startsWith("/plugins/")) {
      issues.push(issue("invalid-route-path", "routes.path", `Plugin route must start with /plugins/: ${String(routeItem.path)}.`));
    }
    if (routeItem.path?.startsWith("/api") || routeItem.path?.startsWith("/admin") || routeItem.path?.startsWith("/auth")) {
      issues.push(issue("reserved-route", "routes.path", `Plugin route shadows a reserved path: ${routeItem.path}.`));
    }
  }
}

function validateSettings(value: unknown, issues: PluginManifestIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("invalid-settings", "settings", "settings must be an array."));
    return;
  }
  for (const settingItem of value as PluginManifestSetting[]) {
    if (!isSafeKey(settingItem.key)) issues.push(issue("invalid-setting-key", "settings.key", `Invalid setting key: ${String(settingItem.key)}.`));
    if (!["boolean", "number", "select", "string", "url", "secret"].includes(settingItem.type)) {
      issues.push(issue("invalid-setting-type", "settings.type", `Invalid setting type: ${String(settingItem.type)}.`));
    }
    if (settingItem.type === "select" && (!Array.isArray(settingItem.options) || settingItem.options.length === 0)) {
      issues.push(issue("missing-setting-options", "settings.options", `Select setting ${String(settingItem.key)} must declare options.`));
    }
  }
}

function validateWidgets(value: unknown, issues: PluginManifestIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("invalid-widgets", "widgets", "widgets must be an array."));
    return;
  }
  for (const widgetItem of value as PluginManifestWidget[]) {
    if (!isSafeId(widgetItem.id)) issues.push(issue("invalid-widget-id", "widgets.id", `Invalid widget id: ${String(widgetItem.id)}.`));
    if (!["admin-dashboard", "article-sidebar", "homepage", "space-dashboard"].includes(widgetItem.placement)) {
      issues.push(issue("invalid-widget-placement", "widgets.placement", `Invalid widget placement: ${String(widgetItem.placement)}.`));
    }
  }
}

function validateHooks(value: unknown, issues: PluginManifestIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("invalid-hooks", "hooks", "hooks must be an array."));
    return;
  }
  for (const hook of value) {
    if (!PLUGIN_HOOKS.includes(hook as PluginHook)) {
      issues.push(issue("unsupported-hook", "hooks", `Unsupported hook: ${String(hook)}.`));
    }
  }
}

function validateJobs(value: unknown, issues: PluginManifestIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("invalid-jobs", "jobs", "jobs must be an array."));
    return;
  }
  for (const jobItem of value as PluginManifestJob[]) {
    if (!isSafeId(jobItem.id)) issues.push(issue("invalid-job-id", "jobs.id", `Invalid job id: ${String(jobItem.id)}.`));
    if (jobItem.permission !== "job:execute") {
      issues.push(issue("invalid-job-permission", "jobs.permission", `Job ${String(jobItem.id)} must require job:execute.`));
    }
    if (!["manual", "hourly", "daily", "weekly"].includes(jobItem.schedule)) {
      issues.push(issue("invalid-job-schedule", "jobs.schedule", `Invalid job schedule: ${String(jobItem.schedule)}.`));
    }
  }
}

function validateStorage(value: unknown, id: unknown, issues: PluginManifestIssue[]) {
  const storage = value as Partial<PluginManifestStorage> | undefined;
  if (!storage || typeof storage !== "object") {
    issues.push(issue("missing-storage", "storage", "storage is required."));
    return;
  }
  if (!isSafeId(storage.namespace) || (typeof id === "string" && storage.namespace !== id)) {
    issues.push(issue("invalid-storage-namespace", "storage.namespace", "storage namespace must match plugin id."));
  }
  if (!Number.isInteger(storage.quotaKb) || Number(storage.quotaKb) <= 0) {
    issues.push(issue("invalid-storage-quota", "storage.quotaKb", "storage quota must be a positive integer."));
  }
  if (!storage.schemaVersion || !/^\d+\.\d+\.\d+$/.test(storage.schemaVersion)) {
    issues.push(issue("invalid-storage-schema", "storage.schemaVersion", "storage schemaVersion must be semantic, for example 1.0.0."));
  }
  if (!["ephemeral", "persistent"].includes(String(storage.retention))) {
    issues.push(issue("invalid-storage-retention", "storage.retention", "storage retention must be ephemeral or persistent."));
  }
}

function validateWebhooks(value: unknown, issues: PluginManifestIssue[]) {
  if (!Array.isArray(value)) {
    issues.push(issue("invalid-webhooks", "webhooks", "webhooks must be an array."));
    return;
  }
  for (const webhook of value as PluginManifestWebhook[]) {
    if (!isSafeId(webhook.id)) issues.push(issue("invalid-webhook-id", "webhooks.id", `Invalid webhook id: ${String(webhook.id)}.`));
    if (!isSafeEnvVar(webhook.urlEnvVar)) issues.push(issue("invalid-webhook-url-env", "webhooks.urlEnvVar", "webhook urlEnvVar must name an environment variable such as MY_PLUGIN_WEBHOOK_URL."));
    if (webhook.secretEnvVar && !isSafeEnvVar(webhook.secretEnvVar)) issues.push(issue("invalid-webhook-secret-env", "webhooks.secretEnvVar", "webhook secretEnvVar must name an environment variable."));
    if (!Array.isArray(webhook.events) || webhook.events.length === 0) {
      issues.push(issue("invalid-webhook-events", "webhooks.events", "webhooks must declare at least one event."));
    }
    for (const event of webhook.events ?? []) {
      if (!PLUGIN_WEBHOOK_EVENTS.includes(event)) {
        issues.push(issue("unsupported-webhook-event", "webhooks.events", `Unsupported webhook event: ${String(event)}.`));
      }
    }
  }
}

function hasUnsafeJsonValue(value: unknown): boolean {
  if (typeof value === "string") {
    return (
      value.includes("../") ||
      value.includes("://") ||
      value.includes("javascript:") ||
      value.includes("git+") ||
      value.includes("npm:") ||
      value.includes("postinstall") ||
      value.includes("exec(")
    );
  }
  if (Array.isArray(value)) return value.some(hasUnsafeJsonValue);
  if (value && typeof value === "object") return Object.values(value).some(hasUnsafeJsonValue);
  return false;
}

function isSafeId(value: unknown) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value);
}

function isSafeKey(value: unknown) {
  return typeof value === "string" && /^[a-zA-Z][a-zA-Z0-9._-]*$/.test(value);
}

function isSafeEnvVar(value: unknown) {
  return typeof value === "string" && /^[A-Z][A-Z0-9_]*$/.test(value);
}

function issue(code: string, field: string, message: string, severity: "error" | "warning" = "error"): PluginManifestIssue {
  return { code, field, message, severity };
}

function job(id: string, schedule: PluginManifestJob["schedule"], title: string): PluginManifestJob {
  return { id, permission: "job:execute", schedule, title };
}

function route(id: string, path: string, title: string): PluginManifestRoute {
  return { adminOnly: path.includes("adapter") || path.includes("notification"), id, label: title, path, title };
}

function setting(key: string, label: string, type: PluginManifestSetting["type"]): PluginManifestSetting {
  return { description: `${label} for the plugin.`, key, label, type };
}

function widget(id: string, placement: PluginManifestWidget["placement"], title: string): PluginManifestWidget {
  return { id, placement, title };
}

function titleize(value: string) {
  return value.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

function envPrefix(value: string) {
  return value.replace(/-/g, "_").toUpperCase();
}

export const pluginManifestRegistry = {
  arkivelVersion: packageJson.version,
  compatibilityMatrix: pluginCompatibilityMatrix,
  examples: plannedPluginExamples,
  schema: pluginManifestSchema,
  validation: {
    valid: plannedPluginExamples.every((example) => validateArkivelPluginManifest(example).valid),
  },
};
