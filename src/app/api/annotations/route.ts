import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const annotations = await prisma.annotation.findMany({
    where: {
      articleId,
      OR: [
        { userId: session.id },
        { isShared: true },
      ],
    },
    include: { user: { select: { username: true, displayName: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(annotations);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId, selector, note, isShared } = await request.json();
  if (!articleId || !selector || !note?.trim()) {
    return NextResponse.json({ error: "articleId, selector, and note are required" }, { status: 400 });
  }

  const annotation = await prisma.annotation.create({
    data: {
      articleId,
      userId: session.id,
      selector,
      note: note.trim(),
      isShared: isShared ?? false,
    },
    include: { user: { select: { username: true, displayName: true } } },
  });

  return NextResponse.json(annotation);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const annotation = await prisma.annotation.findUnique({ where: { id } });
  if (!annotation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (annotation.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.annotation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, note, isShared } = await request.json();
  const annotation = await prisma.annotation.findUnique({ where: { id } });
  if (!annotation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (annotation.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.annotation.update({
    where: { id },
    data: {
      ...(note !== undefined && { note: note.trim() }),
      ...(isShared !== undefined && { isShared }),
    },
    include: { user: { select: { username: true, displayName: true } } },
  });

  return NextResponse.json(updated);
}
