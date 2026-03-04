import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.metricLog.create({
    data: {
      type: "page_view",
      path: `/articles/${id}`,
      duration: 0,
      metadata: { articleId: id },
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const count = await prisma.metricLog.count({
    where: {
      type: "page_view",
      path: `/articles/${id}`,
    },
  });

  return NextResponse.json({ views: count });
}

export const dynamic = "force-dynamic";
