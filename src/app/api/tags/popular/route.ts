import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { articles: { _count: "desc" } },
    take: Math.min(limit, 100),
  });

  return NextResponse.json(
    tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: t.color,
      count: t._count.articles,
    }))
  );
}

export const dynamic = "force-dynamic";
