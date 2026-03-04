import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Cursor format: base64("<name>|<id>")
function encodeCursor(name: string, id: string): string {
  return Buffer.from(`${name}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { name: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
    const pipeIndex = decoded.indexOf("|");
    if (pipeIndex === -1) return null;
    const name = decoded.slice(0, pipeIndex);
    const id = decoded.slice(pipeIndex + 1);
    if (!name || !id) return null;
    return { name, id };
  } catch {
    return null;
  }
}

// GET /api/v2/tags — no auth required
// Returns tags with article counts, cursor-paginated and sorted alphabetically
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursorParam = searchParams.get("cursor");
  const limitParam = parseInt(searchParams.get("limit") || "20");
  const limit = Math.min(200, Math.max(1, isNaN(limitParam) ? 20 : limitParam));

  const cursorData = cursorParam ? decodeCursor(cursorParam) : null;

  // Build cursor filter: alphabetical pagination using name + id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursorFilter: any = undefined;
  if (cursorData) {
    cursorFilter = {
      OR: [
        { name: { gt: cursorData.name } },
        { name: cursorData.name, id: { gt: cursorData.id } },
      ],
    };
  }

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where: cursorFilter,
      take: limit + 1,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        parentId: true,
        _count: { select: { articles: true } },
      },
    }),
    prisma.tag.count(),
  ]);

  const hasMore = tags.length > limit;
  const pageTags = hasMore ? tags.slice(0, limit) : tags;

  let nextCursor: string | null = null;
  if (hasMore && pageTags.length > 0) {
    const last = pageTags[pageTags.length - 1];
    nextCursor = encodeCursor(last.name, last.id);
  }

  const data = pageTags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    color: tag.color,
    parentId: tag.parentId,
    articleCount: tag._count.articles,
  }));

  return NextResponse.json({
    data,
    meta: {
      hasMore,
      nextCursor,
      total,
    },
  });
}

export const dynamic = "force-dynamic";
