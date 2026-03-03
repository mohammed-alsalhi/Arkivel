import { NextRequest, NextResponse } from "next/server";
import { semanticSearch } from "@/lib/embeddings";

/** GET /api/ai/semantic-search?q=... — find articles by semantic similarity. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await semanticSearch(q, Math.min(limit, 20));
  return NextResponse.json({ results });
}
