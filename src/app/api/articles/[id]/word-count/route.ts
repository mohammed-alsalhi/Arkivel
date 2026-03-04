import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { content: true },
  });

  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const text = article.content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const characters = text.length;

  return NextResponse.json({ words, characters, readingTime });
}

export const dynamic = "force-dynamic";
