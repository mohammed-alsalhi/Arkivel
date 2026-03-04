import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId } = await request.json();
  if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, status: true },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const embedToken = await prisma.embedToken.create({
    data: { articleId },
  });

  return NextResponse.json(embedToken, { status: 201 });
}

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const articleId = url.searchParams.get("articleId");

  const tokens = await prisma.embedToken.findMany({
    where: articleId ? { articleId } : {},
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tokens);
}

export const dynamic = "force-dynamic";
