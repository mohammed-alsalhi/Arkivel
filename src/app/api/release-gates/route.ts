import packageJson from "../../../../package.json";
import { NextResponse } from "next/server";
import { createReleaseGateReport } from "@/lib/release-gate-automation";

export async function GET() {
  return NextResponse.json(createReleaseGateReport(packageJson.version));
}
