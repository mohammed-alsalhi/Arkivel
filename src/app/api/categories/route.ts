import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { articles: true } },
      children: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { articles: true } },
          children: {
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { articles: true } } },
          },
        },
      },
      parent: true,
    },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { name, description, parentId } = body;

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
      parentId: parentId || null,
    },
    include: {
      _count: { select: { articles: true } },
      parent: true,
    },
  });

  return NextResponse.json(category, { status: 201 });
}

export const dynamic = "force-dynamic";
