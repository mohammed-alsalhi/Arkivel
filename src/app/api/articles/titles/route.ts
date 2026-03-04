import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { title: true, slug: true },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(articles);
}

export const dynamic = "force-dynamic";
