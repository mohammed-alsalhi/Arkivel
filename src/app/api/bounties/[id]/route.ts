import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const bounty = await prisma.knowledgeBounty.findUnique({
    where: { id },
    include: {
      requester: { select: { username: true, displayName: true } },
      claimer: { select: { username: true, displayName: true } },
      article: { select: { title: true, slug: true } },
    },
  });
  if (!bounty) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bounty);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bounty = await prisma.knowledgeBounty.findUnique({ where: { id } });
  if (!bounty) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { action, articleId, title, description } = body;

  // Claim
  if (action === "claim") {
    if (bounty.status !== "open") return NextResponse.json({ error: "Already claimed" }, { status: 400 });
    const updated = await prisma.knowledgeBounty.update({
      where: { id },
      data: { status: "claimed", claimedBy: user.id },
    });
    return NextResponse.json(updated);
  }

  // Fulfill
  if (action === "fulfill") {
    if (bounty.claimedBy !== user.id && !await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await prisma.knowledgeBounty.update({
      where: { id },
      data: { status: "fulfilled", articleId: articleId || undefined },
    });
    return NextResponse.json(updated);
  }

  // Close (admin or requester)
  if (action === "close") {
    if (bounty.requesterId !== user.id && !await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await prisma.knowledgeBounty.update({ where: { id }, data: { status: "closed" } });
    return NextResponse.json(updated);
  }

  // General edit (requester only)
  if (bounty.requesterId !== user.id && !await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updated = await prisma.knowledgeBounty.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
    },
  });
  return NextResponse.json(updated);
}

export const dynamic = "force-dynamic";
