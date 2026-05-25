import { NextRequest, NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { customization } from "@/lib/customization";
import {
  buildOperationsAlert,
  createOperationsDashboardReport,
  summarizeOperationsStatus,
  type OperationsMetric,
  type OperationsQueue,
  type OperationsService,
} from "@/lib/operations-dashboard";
import prisma from "@/lib/prisma";
import { loadPlugins } from "@/lib/plugins/registry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const generatedAt = new Date().toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const bundle = request.nextUrl.searchParams.get("bundle") === "1";

  const dbStart = Date.now();
  let databaseStatus: OperationsService["status"] = "healthy";
  let databaseMessage = "Database responded normally.";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseStatus = "critical";
    databaseMessage = error instanceof Error ? error.message : "Database health check failed.";
  }
  const dbDuration = Date.now() - dbStart;
  if (databaseStatus === "healthy" && dbDuration > 1000) {
    databaseStatus = "degraded";
    databaseMessage = `Database responded slowly in ${dbDuration}ms.`;
  }

  const [
    activeWebhooks,
    failedWebhookDeliveries,
    recentWebhookDeliveries,
    exportJobs,
    failedExports,
    recentExports,
    importRequests,
    failedImportRequests,
    searchNoResults,
    apiErrors,
    slowMetricRows,
    articleCount,
    metricCount,
    pluginsResult,
  ] = await Promise.all([
    prisma.webhook.count({ where: { active: true } }).catch(() => 0),
    prisma.webhookDelivery.count({ where: { status: "failed" } }).catch(() => 0),
    prisma.webhookDelivery.count({ where: { createdAt: { gte: since24h } } }).catch(() => 0),
    prisma.exportHistory.count().catch(() => 0),
    prisma.exportHistory.count({ where: { status: { not: "completed" } } }).catch(() => 0),
    prisma.exportHistory.count({ where: { createdAt: { gte: since24h } } }).catch(() => 0),
    prisma.metricLog.count({ where: { path: { contains: "/api/import" }, createdAt: { gte: since24h } } }).catch(() => 0),
    prisma.metricLog.count({
      where: {
        path: { contains: "/api/import" },
        status: { gte: 400 },
        createdAt: { gte: since24h },
      },
    }).catch(() => 0),
    prisma.metricLog.count({ where: { type: "search_no_results", createdAt: { gte: since24h } } }).catch(() => 0),
    prisma.metricLog.count({ where: { status: { gte: 500 }, createdAt: { gte: since24h } } }).catch(() => 0),
    prisma.metricLog.findMany({
      orderBy: { duration: "desc" },
      select: { duration: true, path: true, status: true, type: true },
      take: 8,
      where: { duration: { gte: 750 }, createdAt: { gte: since24h } },
    }).catch(() => []),
    prisma.article.count().catch(() => 0),
    prisma.metricLog.count({ where: { createdAt: { gte: since24h } } }).catch(() => 0),
    loadPlugins().catch((error) => ({
      errors: [{ message: error instanceof Error ? error.message : "Unable to load plugins." }],
      loader: { enabled: false },
      plugins: [],
    })),
  ]);

  const pluginErrors = pluginsResult.errors.length + pluginsResult.plugins.filter((plugin) => plugin.health?.status === "error").length;
  const enabledPlugins = pluginsResult.plugins.filter((plugin) => plugin.enabled).length;
  const slowPages = slowMetricRows.map((metric): OperationsMetric => ({
    description: `${metric.type}${metric.status ? `, HTTP ${metric.status}` : ""}`,
    id: `slow:${metric.path}`,
    label: metric.path,
    route: metric.path,
    status: metric.duration >= 2000 ? "critical" : "degraded",
    value: `${metric.duration}ms`,
  }));

  const queues: OperationsQueue[] = [
    {
      description: "Outbound webhook deliveries with retry and redelivery support.",
      failed: failedWebhookDeliveries,
      id: "webhooks",
      pending: 0,
      processed24h: recentWebhookDeliveries,
      route: "/admin/webhooks",
      title: "Webhook deliveries",
    },
    {
      description: "Admin import requests observed through request metrics.",
      failed: failedImportRequests,
      id: "imports",
      pending: 0,
      processed24h: importRequests,
      route: "/admin/import",
      title: "Imports",
    },
    {
      description: "Export history records and incomplete export runs.",
      failed: failedExports,
      id: "exports",
      pending: 0,
      processed24h: recentExports,
      route: "/api/export/history",
      title: "Exports",
    },
    {
      description: "Trusted local plugin manifest and loader errors.",
      failed: pluginErrors,
      id: "plugins",
      pending: 0,
      processed24h: enabledPlugins,
      route: "/admin/plugins",
      title: "Plugin errors",
    },
  ];

  const services: OperationsService[] = [
    {
      checks: [`${dbDuration}ms query latency`, `${articleCount} article records visible`],
      id: "database",
      message: databaseMessage,
      route: "/admin/health",
      status: databaseStatus,
      title: "Database",
    },
    {
      checks: ["Prisma singleton loaded", "Prisma query executed through adapter"],
      id: "prisma",
      message: databaseStatus === "critical" ? "Prisma could not complete the database query." : "Prisma client is available.",
      status: databaseStatus,
      title: "Prisma",
    },
    {
      checks: ["Local export history enabled", "No object storage secrets exposed"],
      id: "storage",
      message: exportJobs > 0 ? `${exportJobs} export record(s) are available for audit.` : "No export history has been recorded yet.",
      route: "/api/export/history",
      status: "healthy",
      title: "Storage",
    },
    {
      checks: ["Provider env presence only", "No API key values returned"],
      id: "ai-providers",
      message: process.env.OPENAI_API_KEY ? "AI provider credentials are configured." : "No AI provider credentials are configured.",
      status: process.env.OPENAI_API_KEY ? "healthy" : "unknown",
      title: "AI providers",
    },
    {
      checks: [`${activeWebhooks} active webhook(s)`, `${failedWebhookDeliveries} failed delivery record(s)`],
      id: "webhooks",
      message: failedWebhookDeliveries > 0 ? "Failed webhook deliveries need review." : "Webhook deliveries are clear.",
      route: "/admin/webhooks",
      status: failedWebhookDeliveries > 0 ? "degraded" : "healthy",
      title: "Webhooks",
    },
    {
      checks: [`${searchNoResults} zero-result search(es) in 24h`],
      id: "search",
      message: searchNoResults > 10 ? "Search has repeated no-result queries." : "Search metrics are within normal bounds.",
      route: "/admin/search-analytics",
      status: searchNoResults > 10 ? "degraded" : "healthy",
      title: "Search",
    },
    {
      checks: [`${metricCount} metric event(s) in 24h`, `${apiErrors} server error(s) in 24h`],
      id: "background-jobs",
      message: apiErrors > 0 ? "Recent server errors need investigation." : "No recent server errors were recorded.",
      route: "/admin/metrics",
      status: apiErrors > 0 ? "degraded" : "healthy",
      title: "Background jobs",
    },
  ];

  const metrics: OperationsMetric[] = [
    {
      description: "Worst status across operations service cards.",
      id: "overall",
      label: "Overall status",
      status: summarizeOperationsStatus(services.map((service) => service.status)),
      value: summarizeOperationsStatus(services.map((service) => service.status)),
    },
    {
      description: "Server errors observed in request metrics during the last 24 hours.",
      id: "api-errors",
      label: "API errors",
      route: "/admin/metrics",
      status: apiErrors > 0 ? "degraded" : "healthy",
      value: apiErrors,
    },
    {
      description: "Pages or API routes slower than 750ms during the last 24 hours.",
      id: "slow-pages",
      label: "Slow pages",
      route: "/admin/metrics",
      status: slowPages.length > 0 ? "degraded" : "healthy",
      value: slowPages.length,
    },
    {
      description: "Zero-result searches recorded during the last 24 hours.",
      id: "search-gaps",
      label: "Search gaps",
      route: "/admin/search-gaps",
      status: searchNoResults > 10 ? "degraded" : "healthy",
      value: searchNoResults,
    },
  ];

  const alerts = [
    buildOperationsAlert({
      count: failedWebhookDeliveries,
      generatedAt,
      id: "failed-webhooks",
      message: `${failedWebhookDeliveries} webhook delivery record(s) are failed.`,
      severity: failedWebhookDeliveries > 5 ? "critical" : "warning",
      source: "webhooks",
      title: "Failed webhook deliveries",
    }),
    buildOperationsAlert({
      count: failedExports,
      generatedAt,
      id: "failed-exports",
      message: `${failedExports} export job(s) are incomplete or failed.`,
      source: "exports",
      title: "Export jobs need review",
    }),
    buildOperationsAlert({
      count: pluginErrors,
      generatedAt,
      id: "plugin-load-errors",
      message: `${pluginErrors} plugin loader or health issue(s) were detected.`,
      source: "plugins",
      title: "Plugin errors detected",
    }),
    buildOperationsAlert({
      count: apiErrors,
      generatedAt,
      id: "api-errors",
      message: `${apiErrors} server error(s) were recorded in the last 24 hours.`,
      severity: "critical",
      source: "metrics",
      title: "Recent server errors",
    }),
  ].filter((alert) => alert !== null);

  const report = createOperationsDashboardReport({
    alerts,
    generatedAt,
    metrics,
    queues,
    services,
    slowPages,
  });

  const payload = {
    ...report,
    instance: {
      name: customization.brand.name,
      version: customization.version,
    },
  };

  if (bundle) {
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Disposition": `attachment; filename="arkivel-diagnostics-${generatedAt.slice(0, 10)}.json"`,
        "Content-Type": "application/json",
      },
    });
  }

  return NextResponse.json(payload);
}
