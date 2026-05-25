import { NextResponse } from "next/server";
import { createE2eSmokeSuiteReport } from "@/lib/e2e-smoke-suite";

export async function GET() {
  return NextResponse.json(createE2eSmokeSuiteReport());
}
