import { NextResponse } from "next/server";
import { createExternalReferenceReport } from "@/lib/external-references";

export async function GET() {
  return NextResponse.json(createExternalReferenceReport());
}
