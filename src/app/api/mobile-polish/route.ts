import { NextResponse } from "next/server";
import { createMobilePolishReport } from "@/lib/mobile-polish";

export async function GET() {
  return NextResponse.json(createMobilePolishReport());
}
