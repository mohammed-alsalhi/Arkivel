import { NextResponse } from "next/server";
import { createDocumentationOnboardingReport } from "@/lib/documentation-onboarding";

export async function GET() {
  return NextResponse.json(createDocumentationOnboardingReport());
}
