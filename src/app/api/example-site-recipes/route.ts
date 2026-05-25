import { NextResponse } from "next/server";
import { createExampleSiteRecipesReport } from "@/lib/example-site-recipes";

export async function GET() {
  return NextResponse.json(createExampleSiteRecipesReport());
}
