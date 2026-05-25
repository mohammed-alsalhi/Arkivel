import { NextResponse } from "next/server";
import { createFinalReleaseGatesReport } from "@/lib/final-release-gates";

export async function GET() {
  return NextResponse.json(createFinalReleaseGatesReport());
}
