import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const type = searchParams.get("type");
  const userId = searchParams.get("userId");
  const articleId = searchParams.get("articleId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);
  const cursor = searchParams.get("cursor"); // ISO date string

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (userId) where.userId = userId;
  if (articleId) where.articleId = articleId;

  if (cursor) {
    where.createdAt = { lt: new Date(cursor) };
  }

  try {
    const events = await prisma.activityEvent.findMany({
      where,
      take: limit + 1, // fetch one extra to determine if there's a next page
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (events.length > limit) {
      const lastEvent = events.pop()!;
      nextCursor = lastEvent.createdAt.toISOString();
    }

    return NextResponse.json({ events, nextCursor });
  } catch (error) {
    console.error("Failed to fetch activity events:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity events" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
