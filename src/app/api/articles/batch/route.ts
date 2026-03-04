import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { ids, action, categoryId } = body;

  if (!ids?.length) {
    return NextResponse.json({ error: "No articles selected" }, { status: 400 });
  }

  switch (action) {
    case "setCategory":
      await prisma.article.updateMany({
        where: { id: { in: ids } },
        data: { categoryId: categoryId || null },
      });
      break;
    case "publish":
      await prisma.article.updateMany({
        where: { id: { in: ids } },
        data: { published: true },
      });
      break;
    case "unpublish":
      await prisma.article.updateMany({
        where: { id: { in: ids } },
        data: { published: false },
      });
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ success: true, count: ids.length });
}

export async function DELETE(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { ids } = body;

  if (!ids?.length) {
    return NextResponse.json({ error: "No articles selected" }, { status: 400 });
  }

  await prisma.article.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ success: true, count: ids.length });
}

export const dynamic = "force-dynamic";
