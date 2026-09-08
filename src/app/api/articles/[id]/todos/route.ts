import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/articles/[id]/todos — list todos for this article */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todos = await prisma.articleTodo.findMany({
    where: { articleId: id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, text: true, done: true, sortOrder: true },
  });
  return NextResponse.json(todos);
}

/** POST /api/articles/[id]/todos — create a new todo (admin only) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { text } = await request.json();
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });

  const article = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.articleTodo.count({ where: { articleId: id } });
  const todo = await prisma.articleTodo.create({
    data: { articleId: id, text: text.trim(), sortOrder: count },
    select: { id: true, text: true, done: true, sortOrder: true },
  });
  return NextResponse.json(todo);
}
