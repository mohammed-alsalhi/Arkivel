import { NextResponse } from "next/server";
import { createInAppOnboardingReport } from "@/lib/in-app-onboarding";

export async function GET() {
  return NextResponse.json(createInAppOnboardingReport());
}
