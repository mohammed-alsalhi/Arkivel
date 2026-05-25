import { NextResponse } from "next/server";
import { createAssistantGovernanceReport } from "@/lib/assistant-governance";

export async function GET() {
  return NextResponse.json(createAssistantGovernanceReport());
}
