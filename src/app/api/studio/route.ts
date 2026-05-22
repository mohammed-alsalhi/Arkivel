import { NextResponse } from "next/server";
import { getStudioReport } from "@/lib/studio";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getStudioReport();
  return NextResponse.json(report);
}
