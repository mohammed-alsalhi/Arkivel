import { NextResponse } from "next/server";
import { createAccessibilityFinishReport } from "@/lib/accessibility-finish";

export async function GET() {
  return NextResponse.json(createAccessibilityFinishReport());
}
