import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSession();
  const url = new URL(request.url);
  const ownOnly = url.searchParams.get("own") === "1";

  const where = user
    ? ownOnly
      ? { userId: user.id }
      : { OR: [{ isPublic: true }, { userId: user.id }] }
    : { isPublic: true };

  const lists = await prisma.readingList.findMany({
    where,
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, isPublic } = await request.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const list = await prisma.readingList.create({
    data: { name, description, isPublic: !!isPublic, userId: user.id },
  });

  return NextResponse.json(list, { status: 201 });
}

export const dynamic = "force-dynamic";
