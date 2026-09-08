import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const VALID_REACTIONS = ["helpful", "insightful", "outdated", "confusing"];

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const counts = await prisma.articleReaction.groupBy({
    by: ["reaction"],
    where: { articleId: id },
    _count: { reaction: true },
  });

  const result = Object.fromEntries(
    VALID_REACTIONS.map((r) => [r, counts.find((c) => c.reaction === r)?._count.reaction ?? 0])
  );

  return NextResponse.json(result);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();

  const { reaction, sessionId } = await request.json();
  if (!VALID_REACTIONS.includes(reaction)) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  if (user) {
    await prisma.articleReaction.upsert({
      where: { articleId_userId: { articleId: id, userId: user.id } },
      create: { articleId: id, userId: user.id, reaction },
      update: { reaction },
    });
  } else if (sessionId) {
    // Anonymous: update by sessionId (not unique constrained, just append)
    await prisma.articleReaction.create({
      data: { articleId: id, sessionId, reaction },
    });
  } else {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
