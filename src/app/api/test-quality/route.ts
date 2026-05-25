import { NextResponse } from "next/server";
import { createTestQualityReport } from "@/lib/test-quality-gates";

export async function GET() {
  return NextResponse.json(createTestQualityReport());
}
