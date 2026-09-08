import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId, score, totalQuestions, answers } = await request.json();
  if (!articleId || score === undefined || !totalQuestions) {
    return NextResponse.json({ error: "articleId, score, and totalQuestions required" }, { status: 400 });
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.id,
      articleId,
      score,
      totalQuestions,
      answers: answers || [],
    },
  });

  return NextResponse.json(attempt, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: session.id },
    include: { article: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(attempts);
}

export const dynamic = "force-dynamic";
