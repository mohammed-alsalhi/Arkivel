import { NextResponse } from "next/server";
import { getCanonAtlasReport } from "@/lib/canon-atlas";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getCanonAtlasReport();
  return NextResponse.json(report);
}
