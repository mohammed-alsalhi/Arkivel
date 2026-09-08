import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = await prisma.learningPath.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, displayName: true } },
      articles: {
        orderBy: { order: "asc" },
        include: { article: { select: { id: true, title: true, slug: true, excerpt: true, updatedAt: true } } },
      },
    },
  });

  if (!path) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const admin = await isAdmin();
  const path = await prisma.learningPath.findUnique({ where: { id }, select: { authorId: true } });
  if (!path) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!admin && path.authorId !== session?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, isPublic } = await request.json();
  const updated = await prisma.learningPath.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const admin = await isAdmin();
  const path = await prisma.learningPath.findUnique({ where: { id }, select: { authorId: true } });
  if (!path) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!admin && path.authorId !== session?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.learningPath.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
