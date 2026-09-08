import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Record today's read and return current streak length. */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);

  // Upsert today's entry
  await prisma.readingStreakLog.upsert({
    where: { userId_date: { userId: session.id, date: today } },
    update: {},
    create: { userId: session.id, date: today },
  });

  const streak = await computeStreak(session.id, today);
  return NextResponse.json({ streak, today });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ streak: 0 });

  const today = new Date().toISOString().slice(0, 10);
  const streak = await computeStreak(session.id, today);
  return NextResponse.json({ streak, today });
}

async function computeStreak(userId: string, today: string): Promise<number> {
  // Fetch all dates for this user, sorted descending
  const logs = await prisma.readingStreakLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (logs.length === 0) return 0;

  // Walk backwards from today counting consecutive days
  let streak = 0;
  let expected = today;
  for (const { date } of logs) {
    if (date === expected) {
      streak++;
      // Move expected to previous day
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else if (date < expected) {
      // Gap — streak broken
      break;
    }
  }
  return streak;
}
