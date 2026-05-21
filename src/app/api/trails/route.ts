import { NextResponse } from "next/server";
import { getCanonTrailsReport } from "@/lib/canon-trails";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getCanonTrailsReport();
  return NextResponse.json(report);
}
