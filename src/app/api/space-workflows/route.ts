import { NextResponse } from "next/server";
import { createDomainWorkflowReport } from "@/lib/domain-workflows";

export async function GET() {
  return NextResponse.json(createDomainWorkflowReport());
}
