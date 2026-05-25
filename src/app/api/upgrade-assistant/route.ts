import { NextResponse } from "next/server";
import { createUpgradeAssistantReport } from "@/lib/upgrade-assistant";

export async function GET() {
  return NextResponse.json(createUpgradeAssistantReport());
}
