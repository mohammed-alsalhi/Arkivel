import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/articles/[id]/polls — list polls for this article with vote counts */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const polls = await prisma.articlePoll.findMany({
    where: { articleId: id },
    include: { votes: { select: { optionIndex: true } } },
    orderBy: { createdAt: "asc" },
  });

  const result = polls.map((p) => {
    const counts = new Array(p.options.length).fill(0);
    p.votes.forEach((v) => { if (v.optionIndex < counts.length) counts[v.optionIndex]++; });
    return {
      id: p.id,
      question: p.question,
      options: p.options,
      counts,
      totalVotes: p.votes.length,
      closed: p.closed,
    };
  });

  return NextResponse.json(result);
}

/** POST /api/articles/[id]/polls — create a new poll (admin only) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { question, options } = await request.json();

  if (!question?.trim()) return NextResponse.json({ error: "question required" }, { status: 400 });
  if (!Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: "at least 2 options required" }, { status: 400 });
  }

  const poll = await prisma.articlePoll.create({
    data: {
      articleId: id,
      question: question.trim(),
      options: options.map((o: string) => o.trim()).filter(Boolean),
    },
  });

  return NextResponse.json({ id: poll.id, question: poll.question, options: poll.options, counts: new Array(poll.options.length).fill(0), totalVotes: 0, closed: false });
}
