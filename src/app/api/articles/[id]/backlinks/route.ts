import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { slug: true, title: true },
  });

  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const backlinks = await prisma.article.findMany({
    where: {
      content: { contains: article.slug },
      id: { not: id },
      published: true,
    },
    select: { id: true, title: true, slug: true, excerpt: true },
    take: 50,
  });

  return NextResponse.json(backlinks);
}

export const dynamic = "force-dynamic";
