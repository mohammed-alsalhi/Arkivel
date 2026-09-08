import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const forks = await prisma.articleFork.findMany({
    where: { originalArticleId: id },
    include: { author: { select: { username: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(forks);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const article = await prisma.article.findUnique({
    where: { id },
    select: { title: true, content: true, contentRaw: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { message } = await request.json().catch(() => ({ message: undefined }));

  const fork = await prisma.articleFork.create({
    data: {
      originalArticleId: id,
      authorId: user.id,
      title: article.title,
      content: article.content,
      contentRaw: article.contentRaw,
      message,
      status: "draft",
    },
  });

  return NextResponse.json(fork, { status: 201 });
}

export const dynamic = "force-dynamic";
