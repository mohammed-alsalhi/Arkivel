import { NextResponse } from "next/server";
import { createDesktopResearchReport } from "@/lib/desktop-research";

export async function GET() {
  return NextResponse.json(createDesktopResearchReport());
}
