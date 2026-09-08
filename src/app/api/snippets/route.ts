import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snippets = await prisma.snippet.findMany({
    where: { userId: session.id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(snippets);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, content } = await request.json();
  if (!name?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
  }

  try {
    const snippet = await prisma.snippet.create({
      data: { userId: session.id, name: name.trim(), content: content.trim() },
    });
    return NextResponse.json(snippet, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Name already in use" }, { status: 409 });
  }
}
