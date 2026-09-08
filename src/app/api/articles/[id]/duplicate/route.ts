import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { generateSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const { id } = await params;
  const source = await prisma.article.findUnique({
    where: { id },
    include: { tags: true },
  });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const baseTitle = `${source.title} (copy)`;
  let slug = generateSlug(baseTitle);

  // Ensure slug uniqueness
  let attempt = 0;
  while (await prisma.article.findUnique({ where: { slug } })) {
    attempt++;
    slug = generateSlug(`${baseTitle} ${attempt}`);
  }

  const duplicate = await prisma.article.create({
    data: {
      title: baseTitle,
      slug,
      content: source.content,
      contentRaw: source.contentRaw,
      excerpt: source.excerpt,
      coverImage: source.coverImage,
      categoryId: source.categoryId,
      status: "draft",
      infobox: source.infobox ?? undefined,
      dir: source.dir,
      tags: {
        create: source.tags.map((t) => ({ tagId: t.tagId })),
      },
    },
  });

  return NextResponse.json({ id: duplicate.id, slug: duplicate.slug });
}
