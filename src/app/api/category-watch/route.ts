import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET ?categoryId=... — returns { watching: boolean } */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ watching: false });

  const categoryId = request.nextUrl.searchParams.get("categoryId");
  if (!categoryId) return NextResponse.json({ watching: false });

  const existing = await prisma.categoryWatch.findUnique({
    where: { userId_categoryId: { userId: session.id, categoryId } },
  });
  return NextResponse.json({ watching: !!existing });
}

/** POST { categoryId } — toggle watch */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { categoryId } = await request.json();
  if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });

  const existing = await prisma.categoryWatch.findUnique({
    where: { userId_categoryId: { userId: session.id, categoryId } },
  });

  if (existing) {
    await prisma.categoryWatch.delete({
      where: { userId_categoryId: { userId: session.id, categoryId } },
    });
    return NextResponse.json({ watching: false });
  } else {
    await prisma.categoryWatch.create({ data: { userId: session.id, categoryId } });
    return NextResponse.json({ watching: true });
  }
}
