import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await request.json();

  if (!["draft", "review", "published"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      status,
      published: status === "published",
    },
    select: { id: true, title: true, slug: true, status: true },
  });

  return NextResponse.json(article);
}

export const dynamic = "force-dynamic";
