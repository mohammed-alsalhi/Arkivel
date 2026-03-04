import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return NextResponse.json(notifications);
}

export async function PUT(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: ids },
      userId: user.id, // Security: only mark own notifications
    },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
