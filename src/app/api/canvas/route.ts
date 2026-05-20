import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });
  const canvases = await prisma.canvas.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });
  return NextResponse.json(canvases);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  const canvas = await prisma.canvas.create({
    data: { name: name || "Untitled Canvas", userId: session.id },
    select: { id: true, name: true },
  });
  return NextResponse.json(canvas, { status: 201 });
}
