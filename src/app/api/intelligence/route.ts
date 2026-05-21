import { NextResponse } from "next/server";
import { getIntelligenceReport } from "@/lib/intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getIntelligenceReport();
  return NextResponse.json(report);
}
