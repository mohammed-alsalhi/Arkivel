import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20");

  const revisions = await prisma.articleRevision.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
    select: {
      id: true,
      articleId: true,
      createdAt: true,
      editSummary: true,
      article: { select: { title: true, slug: true } },
      user: { select: { username: true, displayName: true } },
    },
  });

  return NextResponse.json(revisions);
}

export const dynamic = "force-dynamic";
