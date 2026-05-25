import { NextResponse } from "next/server";
import { createMigrationReadinessReport } from "@/lib/migration-readiness";

export async function GET() {
  return NextResponse.json(createMigrationReadinessReport());
}
