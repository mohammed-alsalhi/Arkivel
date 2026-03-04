import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  if (!title) {
    return NextResponse.json([]);
  }

  // Search for articles whose title contains any significant word (4+ chars)
  const words = title.split(/\s+/).filter((w) => w.length >= 4);
  if (words.length === 0) {
    return NextResponse.json([]);
  }

  const articles = await prisma.article.findMany({
    where: {
      OR: words.map((word) => ({
        title: { contains: word, mode: "insensitive" as const },
      })),
    },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      isDisambiguation: true,
    },
  });

  return NextResponse.json(articles);
}

export const dynamic = "force-dynamic";
