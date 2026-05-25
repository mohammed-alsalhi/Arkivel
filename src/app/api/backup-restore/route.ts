import { NextResponse } from "next/server";
import { createBackupRestoreReport } from "@/lib/backup-restore";

export async function GET() {
  return NextResponse.json(createBackupRestoreReport());
}
