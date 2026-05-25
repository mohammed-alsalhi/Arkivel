import { NextResponse } from "next/server";
import { createAssistantPackReport } from "@/lib/assistant-packs";

export async function GET() {
  return NextResponse.json(createAssistantPackReport());
}
