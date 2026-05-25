import { NextResponse } from "next/server";
import {
  abuseCaseTestMatrix,
  buildSecurityHeaders,
  dependencySupplyChainChecklist,
  preV5ThreatModelDraft,
  securityReviewChecklist,
  securityReviewContract,
} from "@/lib/security-review";

export async function GET() {
  return NextResponse.json({
    abuseCases: abuseCaseTestMatrix,
    checklist: securityReviewChecklist,
    contract: securityReviewContract,
    dependencySupplyChainChecklist,
    headers: buildSecurityHeaders(),
    threatModelDraft: preV5ThreatModelDraft,
  });
}
