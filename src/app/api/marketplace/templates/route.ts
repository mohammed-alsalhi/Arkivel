import { NextResponse } from "next/server";
import { createTemplateMarketplaceReport } from "@/lib/template-marketplace";

export async function GET() {
  return NextResponse.json(createTemplateMarketplaceReport());
}
