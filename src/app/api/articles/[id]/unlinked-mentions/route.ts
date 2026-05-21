import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUnlinkedMentions } from "@/lib/wikilinks";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { slug: true, title: true },
  });
  if (!article) return NextResponse.json([], { status: 404 });
  const mentions = await getUnlinkedMentions(article.slug, article.title);
  return NextResponse.json(mentions);
}
