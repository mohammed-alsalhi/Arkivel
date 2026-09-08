import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const progress = await prisma.learningPathProgress.findUnique({
    where: { userId_pathId: { userId: session.id, pathId: id } },
  });

  return NextResponse.json(progress || { completedArticleIds: [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { articleId } = await request.json();

  const existing = await prisma.learningPathProgress.findUnique({
    where: { userId_pathId: { userId: session.id, pathId: id } },
  });

  const completed = new Set(existing?.completedArticleIds || []);
  completed.add(articleId);

  const progress = await prisma.learningPathProgress.upsert({
    where: { userId_pathId: { userId: session.id, pathId: id } },
    create: { userId: session.id, pathId: id, completedArticleIds: [...completed] },
    update: { completedArticleIds: [...completed] },
  });

  return NextResponse.json(progress);
}

export const dynamic = "force-dynamic";
