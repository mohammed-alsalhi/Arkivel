import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const { ids, operation, value } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }
  if (!operation || !value) {
    return NextResponse.json({ error: "operation and value are required" }, { status: 400 });
  }

  let updated = 0;

  if (operation === "setStatus") {
    const result = await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: { status: value },
    });
    updated = result.count;
  } else if (operation === "setCategory") {
    const result = await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: { categoryId: value || null },
    });
    updated = result.count;
  } else if (operation === "addTag") {
    // Find or create tag by name
    let tag = await prisma.tag.findFirst({ where: { name: value } });
    if (!tag) {
      const slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      tag = await prisma.tag.create({ data: { name: value, slug } });
    }
    for (const articleId of ids) {
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId, tagId: tag.id } },
        create: { articleId, tagId: tag.id },
        update: {},
      });
      updated++;
    }
  } else if (operation === "removeTag") {
    const tag = await prisma.tag.findFirst({ where: { name: value } });
    if (tag) {
      const result = await prisma.articleTag.deleteMany({
        where: { tagId: tag.id, articleId: { in: ids } },
      });
      updated = result.count;
    }
  } else {
    return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
  }

  return NextResponse.json({ updated });
}
