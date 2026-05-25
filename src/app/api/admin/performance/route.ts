import { NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import {
  evaluatePerformanceBudget,
  largeWikiFixtures,
  matchBudgetForPath,
  performanceBudgets,
  performanceBudgetsContract,
  slowQueryDiagnostics,
} from "@/lib/performance-budgets";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const metrics = await prisma.metricLog.findMany({
    orderBy: { duration: "desc" },
    select: { duration: true, path: true, type: true },
    take: 500,
    where: {
      createdAt: { gte: since },
      duration: { gt: 0 },
    },
  }).catch(() => []);

  const grouped = new Map<string, number[]>();
  for (const metric of metrics) {
    const budget = matchBudgetForPath(metric.path) ?? (metric.type === "search_response_time" ? matchBudgetForPath("/search") : null);
    if (!budget) continue;
    const durations = grouped.get(budget.id) ?? [];
    durations.push(metric.duration);
    grouped.set(budget.id, durations);
  }

  const budgetResults = performanceBudgets.map((budget) =>
    evaluatePerformanceBudget(budget, percentile(grouped.get(budget.id) ?? [], 95)),
  );
  const slowestRoutes = metrics.slice(0, 25).map((metric) => ({
    budgetId: matchBudgetForPath(metric.path)?.id ?? null,
    duration: metric.duration,
    path: metric.path,
    type: metric.type,
  }));

  return NextResponse.json({
    budgetResults,
    contract: performanceBudgetsContract,
    fixtures: largeWikiFixtures,
    generatedAt: new Date().toISOString(),
    slowQueries: slowQueryDiagnostics,
    slowestRoutes,
  });
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? null;
}
