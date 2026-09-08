import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const boards = await prisma.whiteboard.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, updatedAt: true, authorId: true },
  });
  return NextResponse.json(boards);
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { title } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).slice(2, 7);

  const board = await prisma.whiteboard.create({
    data: { title: title.trim(), slug, authorId: user.id, data: {} },
  });
  return NextResponse.json(board, { status: 201 });
}

export const dynamic = "force-dynamic";
