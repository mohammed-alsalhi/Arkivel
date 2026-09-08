import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function sessionId(request: NextRequest): string {
  return (
    request.headers.get("x-session-id") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

/** POST /api/articles/[id]/polls/[pollId] — cast a vote */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  const { pollId } = await params;
  const { optionIndex } = await request.json();

  if (typeof optionIndex !== "number") {
    return NextResponse.json({ error: "optionIndex required" }, { status: 400 });
  }

  const poll = await prisma.articlePoll.findUnique({
    where: { id: pollId },
    select: { options: true, closed: true },
  });
  if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (poll.closed) return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const sid = sessionId(request);
  await prisma.pollVote.upsert({
    where: { pollId_sessionId: { pollId, sessionId: sid } },
    update: { optionIndex },
    create: { pollId, sessionId: sid, optionIndex },
  });

  return NextResponse.json({ ok: true });
}

/** DELETE /api/articles/[id]/polls/[pollId] — delete poll (admin only) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { pollId } = await params;
  await prisma.articlePoll.delete({ where: { id: pollId } });
  return NextResponse.json({ ok: true });
}

/** PATCH /api/articles/[id]/polls/[pollId] — close/reopen poll (admin only) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { pollId } = await params;
  const { closed } = await request.json();
  const poll = await prisma.articlePoll.update({
    where: { id: pollId },
    data: { closed: !!closed },
    select: { id: true, closed: true },
  });
  return NextResponse.json(poll);
}
