import { NextResponse } from "next/server";
import {
  mobileStartupChecklist,
  offlineCacheRules,
  offlineDraftWarnings,
  offlinePrivacyLimits,
  offlinePwaContract,
  retryQueueRules,
  staleIndicatorContract,
} from "@/lib/offline-pwa";

export async function GET() {
  return NextResponse.json({
    contract: offlinePwaContract,
    draftWarnings: offlineDraftWarnings,
    mobileQa: mobileStartupChecklist,
    privacyLimits: offlinePrivacyLimits,
    retryQueueRules,
    staleIndicators: staleIndicatorContract,
    strategy: offlineCacheRules,
  });
}
