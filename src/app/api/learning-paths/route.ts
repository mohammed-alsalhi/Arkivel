import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const mine = request.nextUrl.searchParams.get("mine") === "1";

  const where = mine && session
    ? { authorId: session.id }
    : { OR: [{ isPublic: true }, ...(session ? [{ authorId: session.id }] : [])] };

  const paths = await prisma.learningPath.findMany({
    where,
    include: {
      author: { select: { username: true, displayName: true } },
      _count: { select: { articles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(paths);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session && !(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, isPublic, articleIds } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const path = await prisma.learningPath.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      isPublic: isPublic ?? true,
      authorId: session?.id || null,
      articles: articleIds?.length
        ? { create: (articleIds as string[]).map((id: string, i: number) => ({ articleId: id, order: i })) }
        : undefined,
    },
    include: { _count: { select: { articles: true } } },
  });

  return NextResponse.json(path, { status: 201 });
}

export const dynamic = "force-dynamic";
