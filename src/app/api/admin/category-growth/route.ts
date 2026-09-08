import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  // Get articles grouped by category and creation month (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const articles = await prisma.article.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: {
      createdAt: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Build month labels for the last 12 months
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  // Group by category → month → count
  const categoryMap = new Map<string, Map<string, number>>();
  for (const a of articles) {
    const catName = a.category?.name ?? "Uncategorized";
    const month = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!categoryMap.has(catName)) categoryMap.set(catName, new Map());
    const monthMap = categoryMap.get(catName)!;
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
  }

  // Sort categories by total articles descending, take top 8
  const categories = Array.from(categoryMap.entries())
    .map(([name, monthMap]) => ({
      name,
      total: Array.from(monthMap.values()).reduce((s, v) => s + v, 0),
      months: months.map((m) => monthMap.get(m) ?? 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return NextResponse.json({ months, categories });
}
