import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ mapId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { mapId } = await params;
  const body = await request.json();
  const { name, description, imageUrl, sortOrder } = body;

  const existing = await prisma.mapConfig.findUnique({ where: { mapId } });
  if (!existing) {
    return NextResponse.json({ error: "Map not found" }, { status: 404 });
  }

  const updated = await prisma.mapConfig.update({
    where: { mapId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { mapId } = await params;

  const existing = await prisma.mapConfig.findUnique({ where: { mapId } });
  if (!existing) {
    return NextResponse.json({ error: "Map not found" }, { status: 404 });
  }

  // Delete associated layers and detail levels
  await prisma.mapLayer.deleteMany({ where: { mapId } });
  await prisma.mapDetailLevel.deleteMany({ where: { mapId } });
  // Delete markers associated with this map
  await prisma.mapMarker.deleteMany({ where: { mapId } });

  await prisma.mapConfig.delete({ where: { mapId } });

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
