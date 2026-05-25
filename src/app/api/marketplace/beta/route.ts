import { NextResponse } from "next/server";
import { createMarketplaceBetaReport } from "@/lib/marketplace-beta";

export async function GET() {
  return NextResponse.json(createMarketplaceBetaReport());
}
