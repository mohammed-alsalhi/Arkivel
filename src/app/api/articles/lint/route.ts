import { NextResponse } from "next/server";
import { isAdmin, requireAdmin } from "@/lib/auth";
import { lintAllArticles } from "@/lib/linting";

export async function GET() {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const reports = await lintAllArticles();

  // Compute summary stats
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  for (const report of reports) {
    for (const result of report.results) {
      if (result.level === "error") errorCount++;
      else if (result.level === "warning") warningCount++;
      else infoCount++;
    }
  }

  return NextResponse.json({
    reports,
    summary: {
      totalArticles: reports.length,
      errors: errorCount,
      warnings: warningCount,
      info: infoCount,
      total: errorCount + warningCount + infoCount,
    },
  });
}
