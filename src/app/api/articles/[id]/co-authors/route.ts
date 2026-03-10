import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET — list co-authors
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const coAuthors = await prisma.articleCoAuthor.findMany({
    where: { articleId: id },
    select: {
      id: true,
      addedAt: true,
      user: { select: { id: true, username: true, displayName: true } },
    },
    orderBy: { addedAt: "asc" },
  });
  return NextResponse.json(coAuthors);
}

// POST — add a co-author (body: { userId })
export async function POST(req: NextRequest, { params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const ca = await prisma.articleCoAuthor.upsert({
    where: { articleId_userId: { articleId: id, userId } },
    create: { articleId: id, userId },
    update: {},
    select: { id: true, addedAt: true, user: { select: { username: true, displayName: true } } },
  });
  return NextResponse.json(ca, { status: 201 });
}

// DELETE — remove a co-author (body: { userId })
export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId } = await req.json();
  await prisma.articleCoAuthor.deleteMany({ where: { articleId: id, userId } });
  return NextResponse.json({ ok: true });
}
