import { NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { getMetricsSummary } from "@/lib/metrics";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const metrics = await getMetricsSummary();
  return NextResponse.json(metrics);
}
