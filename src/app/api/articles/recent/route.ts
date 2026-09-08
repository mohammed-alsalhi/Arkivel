import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

  const articles = await prisma.article.findMany({
    where: { published: true, status: "published" },
    orderBy: { updatedAt: "desc" },
    take: Math.min(limit, 50),
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json(articles);
}

export const dynamic = "force-dynamic";
