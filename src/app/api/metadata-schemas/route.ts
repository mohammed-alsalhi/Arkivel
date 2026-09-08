import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

/** GET all schemas (with category name) */
export async function GET() {
  const schemas = await prisma.metadataSchema.findMany({
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { category: { name: "asc" } },
  });
  return NextResponse.json(schemas);
}

/** POST — create or update schema for a category */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { categoryId, fields } = await request.json();
  if (!categoryId || !Array.isArray(fields)) {
    return NextResponse.json({ error: "categoryId and fields required" }, { status: 400 });
  }
  const schema = await prisma.metadataSchema.upsert({
    where: { categoryId },
    update: { fields },
    create: { categoryId, fields },
  });
  return NextResponse.json(schema);
}

export const dynamic = "force-dynamic";
