import { NextRequest, NextResponse } from "next/server";
import {
  createObservabilityMetric,
  isObservabilityMetricType,
  normalizeAnalyticsPrivacyControls,
  observabilityContract,
} from "@/lib/observability";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const controls = await readControls();
  if (!controls.analyticsEnabled) {
    return NextResponse.json({ accepted: false, reason: "analytics-disabled" }, { status: 202 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.type !== "string" || !isObservabilityMetricType(body.type)) {
    return NextResponse.json({ error: "Unsupported metric type" }, { status: 400 });
  }

  const metric = createObservabilityMetric({
    duration: Number(body.duration ?? 0),
    metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {},
    path: typeof body.path === "string" ? body.path : request.nextUrl.pathname,
    status: typeof body.status === "number" ? body.status : undefined,
    type: body.type,
  });

  await prisma.metricLog.create({
    data: {
      duration: metric.duration,
      metadata: {
        ...metric.metadata,
        observabilitySchema: observabilityContract.schemaVersion,
      },
      path: metric.path,
      status: metric.status,
      type: metric.type,
    },
  }).catch(() => null);

  return NextResponse.json({ accepted: true, metric });
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
