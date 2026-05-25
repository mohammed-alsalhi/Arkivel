import { NextResponse } from "next/server";
import { createFeatureFreezeReport } from "@/lib/feature-freeze";

export async function GET() {
  return NextResponse.json(createFeatureFreezeReport());
}
