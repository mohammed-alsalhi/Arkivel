import { NextResponse } from "next/server";
import { createArchiveMirrorReport } from "@/lib/archive-mirrors";

export async function GET() {
  return NextResponse.json(createArchiveMirrorReport());
}
