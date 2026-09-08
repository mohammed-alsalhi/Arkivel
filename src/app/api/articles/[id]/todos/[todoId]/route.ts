import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** PATCH /api/articles/[id]/todos/[todoId] — toggle done or update text */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  const { todoId } = await params;
  const body = await request.json();

  const data: { done?: boolean; text?: string } = {};
  if (typeof body.done === "boolean") data.done = body.done;
  if (typeof body.text === "string" && body.text.trim()) data.text = body.text.trim();

  const todo = await prisma.articleTodo.update({
    where: { id: todoId },
    data,
    select: { id: true, text: true, done: true, sortOrder: true },
  });
  return NextResponse.json(todo);
}

/** DELETE /api/articles/[id]/todos/[todoId] — remove a todo (admin only) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { todoId } = await params;
  await prisma.articleTodo.delete({ where: { id: todoId } });
  return NextResponse.json({ ok: true });
}
