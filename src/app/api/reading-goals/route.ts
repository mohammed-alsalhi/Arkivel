import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [pref, thisWeekCount] = await Promise.all([
    prisma.userPreference.findUnique({ where: { userId: session.id } }),
    prisma.articleRead.count({
      where: { userId: session.id, readAt: { gte: weekAgo } },
    }),
  ]);

  const data = (pref?.data as Record<string, unknown>) ?? {};
  const goal = (data.readingGoal as number) ?? 0;
  const streak = (data.readingStreak as number) ?? 0;

  return NextResponse.json({ goal, thisWeek: thisWeekCount, streak });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goal } = await request.json();

  const existing = await prisma.userPreference.findUnique({
    where: { userId: session.id },
  });
  const currentData = (existing?.data as Record<string, unknown>) ?? {};

  await prisma.userPreference.upsert({
    where: { userId: session.id },
    create: { userId: session.id, data: { ...currentData, readingGoal: goal } },
    update: { data: { ...currentData, readingGoal: goal } },
  });

  return NextResponse.json({ goal });
}
