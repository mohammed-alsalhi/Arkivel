import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const MAX_SAVED_SEARCHES = 50;

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      query: true,
      filters: true,
      createdAt: true,
    },
  });

  return NextResponse.json(savedSearches);
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { name?: string; query?: string; filters?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, query, filters } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  // Check user hasn't exceeded the limit
  const count = await prisma.savedSearch.count({
    where: { userId: user.id },
  });

  if (count >= MAX_SAVED_SEARCHES) {
    return NextResponse.json(
      { error: `Maximum of ${MAX_SAVED_SEARCHES} saved searches reached` },
      { status: 400 }
    );
  }

  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: name.trim(),
      query: query.trim(),
      filters: filters ?? undefined,
    },
    select: {
      id: true,
      name: true,
      query: true,
      filters: true,
      createdAt: true,
    },
  });

  return NextResponse.json(savedSearch, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
  }

  // Verify ownership before deleting
  const savedSearch = await prisma.savedSearch.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!savedSearch) {
    return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
  }

  if (savedSearch.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.savedSearch.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
