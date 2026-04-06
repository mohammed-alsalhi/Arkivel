import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * SM-2 algorithm: compute next interval and ease factor after a review.
 * quality: 0-5 (0=total blackout, 5=perfect recall)
 */
function sm2(ease: number, interval: number, repetitions: number, quality: number) {
  if (quality < 3) {
    // Failed — restart repetitions
    return { newEase: Math.max(1.3, ease - 0.2), newInterval: 1, newRepetitions: 0 };
  }
  const newEase = Math.max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let newInterval: number;
  if (repetitions === 0) newInterval = 1;
  else if (repetitions === 1) newInterval = 6;
  else newInterval = Math.round(interval * newEase);
  return { newEase, newInterval, newRepetitions: repetitions + 1 };
}

/** GET — fetch items due for review today (or all enrolled items) */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mode = request.nextUrl.searchParams.get("mode") || "due";

  if (mode === "due") {
    const items = await prisma.spacedRepetitionItem.findMany({
      where: {
        userId: session.id,
        nextReviewAt: { lte: new Date() },
      },
      include: {
        article: { select: { id: true, title: true, slug: true, excerpt: true, category: { select: { name: true } } } },
      },
      orderBy: { nextReviewAt: "asc" },
      take: 20,
    });
    return NextResponse.json(items);
  }

  // mode=all — return all enrolled items with status
  const items = await prisma.spacedRepetitionItem.findMany({
    where: { userId: session.id },
    include: {
      article: { select: { id: true, title: true, slug: true, excerpt: true, category: { select: { name: true } } } },
    },
    orderBy: { nextReviewAt: "asc" },
  });

  const now = new Date();
  return NextResponse.json(items.map((item) => ({
    ...item,
    isDue: item.nextReviewAt <= now,
    daysUntilDue: Math.ceil((item.nextReviewAt.getTime() - now.getTime()) / 86400000),
  })));
}

/** POST — enroll an article or submit a review result */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.action === "enroll") {
    const { articleId } = body;
    const item = await prisma.spacedRepetitionItem.upsert({
      where: { userId_articleId: { userId: session.id, articleId } },
      create: { userId: session.id, articleId, nextReviewAt: new Date() },
      update: {},
    });
    return NextResponse.json(item);
  }

  if (body.action === "review") {
    const { articleId, quality } = body; // quality 0-5
    const existing = await prisma.spacedRepetitionItem.findUnique({
      where: { userId_articleId: { userId: session.id, articleId } },
    });
    if (!existing) return NextResponse.json({ error: "Item not enrolled" }, { status: 404 });

    const { newEase, newInterval, newRepetitions } = sm2(
      existing.ease,
      existing.interval,
      existing.repetitions,
      quality
    );

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    const updated = await prisma.spacedRepetitionItem.update({
      where: { id: existing.id },
      data: {
        ease: newEase,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewAt,
        lastReviewAt: new Date(),
      },
    });
    return NextResponse.json(updated);
  }

  if (body.action === "unenroll") {
    const { articleId } = body;
    await prisma.spacedRepetitionItem.deleteMany({
      where: { userId: session.id, articleId },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
