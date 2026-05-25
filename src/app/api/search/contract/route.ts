import { NextResponse } from "next/server";
import { searchApiContract } from "@/lib/search-api";
import { searchRelevanceContract } from "@/lib/search-relevance";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    searchApi: searchApiContract,
    searchRelevance: searchRelevanceContract,
  });
}
