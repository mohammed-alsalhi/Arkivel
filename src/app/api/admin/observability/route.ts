import { NextRequest, NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import {
  createStructuredLogEvent,
  normalizeAnalyticsPrivacyControls,
  observabilityContract,
  type StructuredLogCategory,
} from "@/lib/observability";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const limit = Math.min(200, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? observabilityContract.eventFeed.defaultLimit)));
  const controls = await readControls();
  const rows = controls.eventFeedEnabled
    ? await prisma.metricLog.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        duration: true,
        id: true,
        metadata: true,
        path: true,
        status: true,
        type: true,
      },
      take: limit,
    }).catch(() => [])
    : [];

  const events = rows.map((row) => createStructuredLogEvent({
    category: categoryForMetric(row.type),
    message: `${row.type} ${row.path}`,
    metadata: {
      duration: row.duration,
      id: row.id,
      metadata: row.metadata,
      status: row.status,
    },
    severity: row.status && row.status >= 500 ? "error" : row.status && row.status >= 400 ? "warning" : "info",
    timestamp: row.createdAt.toISOString(),
  }));

  return NextResponse.json({
    contract: observabilityContract,
    controls,
    events,
    generatedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const controls = normalizeAnalyticsPrivacyControls(body);
  await prisma.pluginState.upsert({
    where: { id: observabilityContract.privacyControls.storageKey },
    update: { config: controls, enabled: controls.analyticsEnabled },
    create: {
      config: controls,
      enabled: controls.analyticsEnabled,
      id: observabilityContract.privacyControls.storageKey,
    },
  });

  return NextResponse.json({ controls });
}

async function readControls() {
  const record = await prisma.pluginState.findUnique({
    where: { id: observabilityContract.privacyControls.storageKey },
  }).catch(() => null);
  return normalizeAnalyticsPrivacyControls(
    record?.config && typeof record.config === "object" && !Array.isArray(record.config)
      ? record.config
      : {},
  );
}

function categoryForMetric(type: string): StructuredLogCategory {
  if (type.includes("search")) return "search";
  if (type.includes("webhook")) return "webhooks";
  if (type.includes("export") || type.includes("import")) return "migrations";
  if (type.includes("asset")) return "assets";
  if (type.includes("plugin")) return "plugins";
  if (type.includes("auth")) return "auth";
  return "prisma";
}
