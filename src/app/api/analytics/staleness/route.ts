import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") ?? "180", 10);
  const cutoff = new Date(Date.now() - days * 86400000);

  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      updatedAt: { lt: cutoff },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      categoryId: true,
      category: { select: { name: true, slug: true } },
    },
    orderBy: { updatedAt: "asc" },
    take: 100,
  });

  const staleDays = articles.map((a) => ({
    ...a,
    daysStale: Math.floor((Date.now() - a.updatedAt.getTime()) / 86400000),
  }));

  return NextResponse.json(staleDays);
}

export const dynamic = "force-dynamic";
