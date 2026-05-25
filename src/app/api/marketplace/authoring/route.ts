import { NextResponse } from "next/server";
import { createMarketplaceAuthoringReport } from "@/lib/marketplace-authoring";

export async function GET() {
  return NextResponse.json(createMarketplaceAuthoringReport());
}
