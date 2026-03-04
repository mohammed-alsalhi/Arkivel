import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const MAX_HISTORY_ENTRIES = 50;
const DEFAULT_RETURN_LIMIT = 20;

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const history = await prisma.searchHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: DEFAULT_RETURN_LIMIT,
    select: {
      id: true,
      query: true,
      filters: true,
      createdAt: true,
    },
  });

  return NextResponse.json(history);
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { query?: string; filters?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { query, filters } = body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  // Create the new history entry
  const entry = await prisma.searchHistory.create({
    data: {
      userId: user.id,
      query: query.trim(),
      filters: (filters ?? undefined) as Prisma.InputJsonValue | undefined,
    },
    select: {
      id: true,
      query: true,
      filters: true,
      createdAt: true,
    },
  });

  // Auto-cap: if user has more than MAX_HISTORY_ENTRIES, remove oldest
  const count = await prisma.searchHistory.count({
    where: { userId: user.id },
  });

  if (count > MAX_HISTORY_ENTRIES) {
    const oldest = await prisma.searchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: count - MAX_HISTORY_ENTRIES,
      select: { id: true },
    });

    if (oldest.length > 0) {
      await prisma.searchHistory.deleteMany({
        where: { id: { in: oldest.map((o) => o.id) } },
      });
    }
  }

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  await prisma.searchHistory.deleteMany({
    where: { userId: user.id },
  });

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
