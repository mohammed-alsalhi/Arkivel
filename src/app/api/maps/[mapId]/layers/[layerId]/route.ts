import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

type RouteParams = { params: Promise<{ mapId: string; layerId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { layerId } = await params;
  const body = await request.json();
  const { name, imageUrl, opacity, visible, sortOrder } = body;

  const existing = await prisma.mapLayer.findUnique({ where: { id: layerId } });
  if (!existing) {
    return NextResponse.json({ error: "Layer not found" }, { status: 404 });
  }

  const updated = await prisma.mapLayer.update({
    where: { id: layerId },
    data: {
      ...(name !== undefined && { name }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(opacity !== undefined && { opacity }),
      ...(visible !== undefined && { visible }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { layerId } = await params;

  const existing = await prisma.mapLayer.findUnique({ where: { id: layerId } });
  if (!existing) {
    return NextResponse.json({ error: "Layer not found" }, { status: 404 });
  }

  await prisma.mapLayer.delete({ where: { id: layerId } });
  return NextResponse.json({ success: true });
}
