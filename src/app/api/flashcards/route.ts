import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Return cards due today (nextDue <= now), limit 20
  const cards = await prisma.flashcard.findMany({
    where: { userId: session.id, nextDue: { lte: new Date() } },
    orderBy: { nextDue: "asc" },
    take: 20,
    include: { article: { select: { title: true, slug: true } } },
  });

  const total = await prisma.flashcard.count({ where: { userId: session.id } });
  return NextResponse.json({ cards, total });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { front, back, articleId } = await request.json();
  if (!front?.trim() || !back?.trim()) {
    return NextResponse.json({ error: "front and back are required" }, { status: 400 });
  }

  const card = await prisma.flashcard.create({
    data: {
      userId: session.id,
      front: front.trim(),
      back: back.trim(),
      articleId: articleId || null,
    },
  });

  return NextResponse.json(card, { status: 201 });
}

export const dynamic = "force-dynamic";
