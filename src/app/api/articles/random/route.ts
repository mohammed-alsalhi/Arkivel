import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const count = await prisma.article.count({ where: { status: "published" } });
  if (count === 0) return NextResponse.json(null);

  const skip = Math.floor(Math.random() * count);
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: { title: true, slug: true, excerpt: true },
    skip,
    take: 1,
  });

  return NextResponse.json(articles[0] ?? null);
}

export const dynamic = "force-dynamic";
