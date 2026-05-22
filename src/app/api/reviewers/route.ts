import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  const denied = requireRole(session, "editor");
  if (denied) return denied;

  const reviewers = await prisma.user.findMany({
    where: {
      role: { in: ["admin", "editor"] },
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
    },
    orderBy: [
      { displayName: "asc" },
      { username: "asc" },
    ],
  });

  return NextResponse.json(reviewers);
}

export const dynamic = "force-dynamic";
