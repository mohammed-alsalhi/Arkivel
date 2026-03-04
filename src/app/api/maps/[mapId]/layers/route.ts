import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ mapId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { mapId } = await params;

  const layers = await prisma.mapLayer.findMany({
    where: { mapId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(layers);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { mapId } = await params;
  const body = await request.json();
  const { name, imageUrl, opacity, visible } = body;

  if (!name || !imageUrl) {
    return NextResponse.json(
      { error: "name and imageUrl are required" },
      { status: 400 }
    );
  }

  const maxSort = await prisma.mapLayer.aggregate({
    where: { mapId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? 0) + 1;

  const layer = await prisma.mapLayer.create({
    data: {
      mapId,
      name,
      imageUrl,
      opacity: opacity ?? 0.7,
      visible: visible ?? true,
      sortOrder,
    },
  });

  return NextResponse.json(layer, { status: 201 });
}

export const dynamic = "force-dynamic";
