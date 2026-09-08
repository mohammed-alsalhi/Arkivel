import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const tagId = searchParams.get("tagId") ?? undefined;

  const admin = await isAdmin();
  const session = await getSession();

  const where: Record<string, unknown> = {
    ...(categoryId ? { categoryId } : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
    ...(!admin && !session ? { status: "published" } : {}),
  };

  const articles = await prisma.article.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  return NextResponse.json(articles);
}

export const dynamic = "force-dynamic";
