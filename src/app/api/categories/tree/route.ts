import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    },
  });

  const tree = categories.filter((c) => !c.parentId);
  return NextResponse.json(tree);
}

export const dynamic = "force-dynamic";
