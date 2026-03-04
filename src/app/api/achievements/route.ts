import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/achievements";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const achievements = await prisma.contributorAchievement.findMany({
    where: { userId: user.id },
    orderBy: { earnedAt: "desc" },
  });

  return NextResponse.json(achievements);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const targetUserId = body.userId ?? user.id;

  await checkAndAwardAchievements(targetUserId);

  const achievements = await prisma.contributorAchievement.findMany({
    where: { userId: targetUserId },
    orderBy: { earnedAt: "desc" },
  });

  return NextResponse.json(achievements);
}

export const dynamic = "force-dynamic";
