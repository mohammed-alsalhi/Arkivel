import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";
import { createWorkspaceArticleWhere, getWorkspaceIdFromRequestLike } from "@/lib/workspaces";
import { invalidateCacheForEvent } from "@/lib/cache-strategy";

export async function GET(request: NextRequest) {
  const workspaceId = getWorkspaceIdFromRequestLike({
    searchParams: request.nextUrl.searchParams,
    headers: request.headers,
  });
  const includeGlobal = request.nextUrl.searchParams.get("includeGlobal") === "1";
  const articleWhere = createWorkspaceArticleWhere({ workspaceId, includeGlobal: workspaceId ? includeGlobal : true });
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { articles: { where: articleWhere } } },
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { articles: { where: articleWhere } } },
            children: {
              orderBy: { sortOrder: "asc" },
              include: { _count: { select: { articles: { where: articleWhere } } } },
            },
          },
        },
        parent: true,
      },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { name, description, coverImage, parentId } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = generateSlug(name.trim());

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description || null,
      coverImage: coverImage || null,
      parentId: parentId || null,
    },
    include: {
      _count: { select: { articles: true } },
      parent: true,
    },
  });

  await invalidateCacheForEvent("category.write");

  return NextResponse.json(category, { status: 201 });
}

export const dynamic = "force-dynamic";
