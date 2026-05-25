import { NextResponse } from "next/server";
import {
  privacyControls,
  privacyControlsContract,
  privacyWarnings,
  retentionSettings,
  userDataLifecyclePlan,
} from "@/lib/privacy-controls";

export async function GET() {
  return NextResponse.json({
    contract: privacyControlsContract,
    controls: privacyControls,
    retention: retentionSettings,
    userDataLifecycle: userDataLifecyclePlan,
    warnings: privacyWarnings,
  });
}
