import { NextResponse } from "next/server";
import { createSyncManifestReport } from "@/lib/sync-manifests";

export async function GET() {
  return NextResponse.json(createSyncManifestReport());
}
