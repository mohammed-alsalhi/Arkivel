import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { isAdmin, requireAdmin } from "@/lib/auth";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { articles: true } },
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { articles: true } },
          children: {
            orderBy: { name: "asc" },
            include: { _count: { select: { articles: true } } },
          },
        },
      },
    },
  });

  // Return flat list with hierarchy info — consumers can build trees from parentId
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { name, color, parentId } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Validate parentId if provided
  if (parentId) {
    const parentTag = await prisma.tag.findUnique({ where: { id: parentId } });
    if (!parentTag) {
      return NextResponse.json({ error: "Parent tag not found" }, { status: 400 });
    }
  }

  const slug = generateSlug(name);
  const tag = await prisma.tag.upsert({
    where: { slug },
    update: {},
    create: {
      name,
      slug,
      color: color || null,
      parentId: parentId || null,
    },
  });

  return NextResponse.json(tag, { status: 201 });
}

export const dynamic = "force-dynamic";
