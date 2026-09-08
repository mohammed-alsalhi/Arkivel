import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const series = await prisma.articleSeries.findMany({
    orderBy: { name: "asc" },
    include: {
      members: {
        orderBy: { position: "asc" },
        include: { article: { select: { id: true, title: true, slug: true } } },
      },
    },
  });
  return NextResponse.json(series);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { name, description } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = generateSlug(name);
  const series = await prisma.articleSeries.create({
    data: { name: name.trim(), slug, description: description?.trim() || null },
  });
  return NextResponse.json(series);
}
