import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          articles: true,
          revisions: true,
          discussions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export const dynamic = "force-dynamic";
