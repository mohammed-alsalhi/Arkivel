import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const fork = await prisma.articleFork.findUnique({
    where: { id },
    include: {
      author: { select: { username: true, displayName: true } },
      original: { select: { title: true, slug: true, content: true } },
    },
  });
  if (!fork) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(fork);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fork = await prisma.articleFork.findUnique({ where: { id } });
  if (!fork) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (fork.authorId !== user.id && !await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, content, contentRaw, message, action } = await request.json();

  if (action === "propose") {
    const updated = await prisma.articleFork.update({
      where: { id },
      data: { status: "proposed", ...(message && { message }) },
    });
    return NextResponse.json(updated);
  }

  const updated = await prisma.articleFork.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(contentRaw !== undefined && { contentRaw }),
      ...(message !== undefined && { message }),
    },
  });
  return NextResponse.json(updated);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSession();
  if (!user || !await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const action = url.pathname.endsWith("/merge") ? "merge" : url.pathname.endsWith("/reject") ? "reject" : null;
  const body = await request.json().catch(() => ({}));

  const fork = await prisma.articleFork.findUnique({ where: { id } });
  if (!fork) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "merge" || body.action === "merge") {
    // Apply fork content to original article
    await prisma.$transaction([
      prisma.article.update({
        where: { id: fork.originalArticleId },
        data: { title: fork.title, content: fork.content, contentRaw: fork.contentRaw },
      }),
      prisma.articleFork.update({ where: { id }, data: { status: "merged" } }),
    ]);
    return NextResponse.json({ ok: true, merged: true });
  }

  if (action === "reject" || body.action === "reject") {
    const updated = await prisma.articleFork.update({
      where: { id },
      data: { status: "rejected", reviewNote: body.reviewNote },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export const dynamic = "force-dynamic";
