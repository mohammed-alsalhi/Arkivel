import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId");

  const badges = await prisma.expertBadge.findMany({
    where: categoryId ? { categoryId } : {},
    include: {
      user: { select: { id: true, username: true, displayName: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(badges);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, categoryId } = await request.json();
  if (!userId || !categoryId) return NextResponse.json({ error: "userId and categoryId required" }, { status: 400 });

  const badge = await prisma.expertBadge.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    create: { userId, categoryId, grantedBy: user.id },
    update: { grantedBy: user.id },
  });

  return NextResponse.json(badge, { status: 201 });
}

export const dynamic = "force-dynamic";
