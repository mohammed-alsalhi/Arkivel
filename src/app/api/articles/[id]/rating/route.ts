import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/articles/[id]/rating — avg rating + count (+ caller's own rating by session)
 * POST /api/articles/[id]/rating — upsert a 1–5 star rating for this session
 */

function sessionId(request: NextRequest): string {
  return (
    request.headers.get("x-session-id") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sid = sessionId(request);

  const [agg, own] = await Promise.all([
    prisma.articleRating.aggregate({
      where: { articleId: id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.articleRating.findUnique({
      where: { articleId_sessionId: { articleId: id, sessionId: sid } },
      select: { rating: true },
    }),
  ]);

  return NextResponse.json({
    avg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
    count: agg._count.rating,
    own: own?.rating ?? null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { rating } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sid = sessionId(request);
  await prisma.articleRating.upsert({
    where: { articleId_sessionId: { articleId: id, sessionId: sid } },
    update: { rating },
    create: { articleId: id, sessionId: sid, rating },
  });

  return NextResponse.json({ ok: true });
}
