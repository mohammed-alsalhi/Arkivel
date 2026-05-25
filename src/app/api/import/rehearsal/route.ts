import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { createImportDryRunPreview, importRehearsalContract } from "@/lib/import-rehearsal";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    contract: importRehearsalContract,
    preview: createImportDryRunPreview(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const preview = createImportDryRunPreview({
    blockedChanges: Array.isArray(body.blockedChanges) ? body.blockedChanges : [],
    rollbackPlan: Array.isArray(body.rollbackPlan) ? body.rollbackPlan : [],
  });
  await logAudit("import.preview", { type: "import", label: "Import rehearsal" }, {
    blockedChanges: preview.plan.blockedChanges.length,
    recommendedActions: preview.plan.recommendedActions.length,
    writeAllowed: preview.plan.writeAllowed,
  }, { request });

  return NextResponse.json({
    contract: importRehearsalContract,
    preview,
  });
}
