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

  const collections = await prisma.smartCollection.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(collections);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, query, isPublic } = await request.json();
  if (!name || !query) return NextResponse.json({ error: "name and query required" }, { status: 400 });

  const collection = await prisma.smartCollection.create({
    data: { name, query, isPublic: !!isPublic, userId: user.id },
  });

  return NextResponse.json(collection, { status: 201 });
}
