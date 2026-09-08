import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const pad = await prisma.scratchpad.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ content: pad?.content ?? "" });
}

export async function PUT(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { content } = await request.json();

  const pad = await prisma.scratchpad.upsert({
    where: { userId: user.id },
    update: { content: content ?? "" },
    create: { userId: user.id, content: content ?? "" },
  });

  return NextResponse.json({ updatedAt: pad.updatedAt });
}

export const dynamic = "force-dynamic";
