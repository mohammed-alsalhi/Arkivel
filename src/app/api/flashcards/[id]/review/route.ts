import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sm2 } from "@/lib/sm2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { grade } = await request.json(); // 0-5

  const card = await prisma.flashcard.findFirst({
    where: { id, userId: session.id },
  });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = sm2(
    { interval: card.interval, easeFactor: card.easeFactor, repetitions: card.repetitions, nextDue: card.nextDue },
    grade
  );

  const result = await prisma.flashcard.update({
    where: { id },
    data: updated,
  });

  return NextResponse.json(result);
}

export const dynamic = "force-dynamic";
