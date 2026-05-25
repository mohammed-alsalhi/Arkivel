import { NextResponse } from "next/server";
import { createMarketplaceLifecycleReport } from "@/lib/marketplace-lifecycle";

export async function GET() {
  return NextResponse.json(createMarketplaceLifecycleReport());
}
