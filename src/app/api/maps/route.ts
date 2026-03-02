import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function GET() {
  const maps = await prisma.mapConfig.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(maps);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { mapId, name, description, imageUrl } = body;

  if (!mapId || !name || !imageUrl) {
    return NextResponse.json(
      { error: "mapId, name, and imageUrl are required" },
      { status: 400 }
    );
  }

  // Check uniqueness of mapId
  const existing = await prisma.mapConfig.findUnique({ where: { mapId } });
  if (existing) {
    return NextResponse.json(
      { error: "A map with this ID already exists" },
      { status: 409 }
    );
  }

  const maxSort = await prisma.mapConfig.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxSort._max.sortOrder ?? 0) + 1;

  const map = await prisma.mapConfig.create({
    data: {
      mapId,
      name,
      description: description || null,
      imageUrl,
      sortOrder,
    },
  });

  return NextResponse.json(map, { status: 201 });
}
