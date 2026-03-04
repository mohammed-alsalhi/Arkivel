import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ mapId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { mapId } = await params;

  const levels = await prisma.mapDetailLevel.findMany({
    where: { mapId },
    orderBy: { minZoom: "asc" },
  });

  return NextResponse.json(levels);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { mapId } = await params;
  const body = await request.json();
  const { minZoom, maxZoom, imageUrl, bounds } = body;

  if (minZoom === undefined || maxZoom === undefined || !imageUrl || !bounds) {
    return NextResponse.json(
      { error: "minZoom, maxZoom, imageUrl, and bounds are required" },
      { status: 400 }
    );
  }

  const level = await prisma.mapDetailLevel.create({
    data: {
      mapId,
      minZoom,
      maxZoom,
      imageUrl,
      bounds,
    },
  });

  return NextResponse.json(level, { status: 201 });
}

export const dynamic = "force-dynamic";
