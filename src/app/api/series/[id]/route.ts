import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const series = await prisma.articleSeries.findUnique({
    where: { id },
    include: {
      members: {
        orderBy: { position: "asc" },
        include: { article: { select: { id: true, title: true, slug: true, excerpt: true } } },
      },
    },
  });
  if (!series) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(series);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const { name, description, members } = await request.json();

  const series = await prisma.articleSeries.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
    },
  });

  // Replace members if provided
  if (Array.isArray(members)) {
    await prisma.articleSeriesMember.deleteMany({ where: { seriesId: id } });
    if (members.length > 0) {
      await prisma.articleSeriesMember.createMany({
        data: members.map((m: { articleId: string }, i: number) => ({
          seriesId: id,
          articleId: m.articleId,
          position: i,
        })),
      });
    }
  }

  return NextResponse.json(series);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  await prisma.articleSeries.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
