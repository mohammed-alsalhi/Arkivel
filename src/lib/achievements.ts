import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const BADGES = [
  { id: "first_edit", label: "First Edit" },
  { id: "edits_10", label: "10 Edits" },
  { id: "edits_100", label: "100 Edits" },
  { id: "streak_7", label: "7-Day Streak" },
  { id: "streak_30", label: "30-Day Streak" },
] as const;

type BadgeId = (typeof BADGES)[number]["id"];

async function award(userId: string, badge: BadgeId, metadata?: Record<string, number | string>) {
  await prisma.contributorAchievement.upsert({
    where: { userId_badge: { userId, badge } },
    create: { userId, badge, metadata: metadata as Prisma.InputJsonValue | undefined },
    update: {},
  });
}

export async function checkAndAwardAchievements(userId: string): Promise<void> {
  try {
    const totalEdits = await prisma.articleRevision.count({ where: { userId } });

    if (totalEdits >= 1) await award(userId, "first_edit");
    if (totalEdits >= 10) await award(userId, "edits_10");
    if (totalEdits >= 100) await award(userId, "edits_100");

    // Streak: check consecutive days with at least one revision
    const recent = await prisma.articleRevision.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 90,
    });

    const days = new Set(recent.map((r) => r.createdAt.toISOString().slice(0, 10)));
    let streak = 0;
    let date = new Date();
    for (let i = 0; i < 90; i++) {
      const key = date.toISOString().slice(0, 10);
      if (days.has(key)) {
        streak++;
        date = new Date(date.getTime() - 86400000);
      } else {
        break;
      }
    }

    if (streak >= 7) await award(userId, "streak_7", { streak });
    if (streak >= 30) await award(userId, "streak_30", { streak });
  } catch {
    // Ignore errors — achievement awarding is non-critical
  }
}
