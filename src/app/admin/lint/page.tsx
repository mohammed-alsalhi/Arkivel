"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";

type LintResult = {
  level: "error" | "warning" | "info";
  message: string;
  rule: string;
};

type ArticleLintReport = {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  results: LintResult[];
};

type LintSummary = {
  totalArticles: number;
  errors: number;
  warnings: number;
  info: number;
  total: number;
};

type LintResponse = {
  reports: ArticleLintReport[];
  summary: LintSummary;
};

type FilterLevel = "all" | "error" | "warning" | "info";

const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  error: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Error" },
  warning: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Warning" },
  info: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Info" },
};

export default function LintPage() {
  const isAdmin = useAdmin();
  const [data, setData] = useState<LintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterLevel>("all");

  const fetchLintResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/articles/lint");
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Unauthorized" : "Failed to fetch lint results");
      }
      const json: LintResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchLintResults();
    } else {
      setLoading(false);
    }
  }, [isAdmin, fetchLintResults]);

  if (!isAdmin) {
    return (
      <div>
        <h1
          className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Content Linting
        </h1>
        <div className="wiki-notice">
          You must be <Link href="/admin">logged in as admin</Link> to view lint results.
        </div>
      </div>
    );
  }

  // Filter reports based on selected level
  const filteredReports = data?.reports
    .map((report) => ({
      ...report,
      results:
        filter === "all"
          ? report.results
          : report.results.filter((r) => r.level === filter),
    }))
    .filter((report) => report.results.length > 0) ?? [];

  const filteredTotal = filteredReports.reduce((sum, r) => sum + r.results.length, 0);

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Content Linting
      </h1>

      <p className="text-[13px] text-muted mb-4">
        Automated content quality checks across all wiki articles.
      </p>

      {loading ? (
        <p className="text-[13px] text-muted italic">Analyzing articles...</p>
      ) : error ? (
        <div className="wiki-notice text-red-600">{error}</div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="border border-border bg-surface p-3 text-center">
              <div className="text-[22px] font-bold text-heading">{data.summary.total}</div>
              <div className="text-[12px] text-muted">Total Issues</div>
            </div>
            <div className="border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-center">
              <div className="text-[22px] font-bold text-red-700 dark:text-red-400">{data.summary.errors}</div>
              <div className="text-[12px] text-red-600 dark:text-red-400">Errors</div>
            </div>
            <div className="border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-3 text-center">
              <div className="text-[22px] font-bold text-yellow-700 dark:text-yellow-400">{data.summary.warnings}</div>
              <div className="text-[12px] text-yellow-600 dark:text-yellow-400">Warnings</div>
            </div>
            <div className="border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-3 text-center">
              <div className="text-[22px] font-bold text-blue-700 dark:text-blue-400">{data.summary.info}</div>
              <div className="text-[12px] text-blue-600 dark:text-blue-400">Info</div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[12px] font-semibold text-muted">Filter:</span>
            {(["all", "error", "warning", "info"] as FilterLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1 text-[12px] border transition-colors ${
                  filter === level
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface-hover text-foreground hover:bg-surface"
                }`}
              >
                {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
            <button
              onClick={fetchLintResults}
              className="ml-auto px-3 py-1 text-[12px] border border-border bg-surface-hover text-foreground hover:bg-surface transition-colors"
            >
              Re-scan
            </button>
          </div>

          {/* Results */}
          {filteredReports.length === 0 ? (
            <div className="wiki-notice">
              {data.summary.total === 0
                ? "All articles pass content linting checks."
                : "No issues match the current filter."}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[12px] text-muted mb-2">
                Showing {filteredTotal} issue{filteredTotal !== 1 ? "s" : ""} across{" "}
                {filteredReports.length} article{filteredReports.length !== 1 ? "s" : ""}
              </p>
              <table className="w-full border-collapse border border-border bg-surface text-[13px]">
                <thead>
                  <tr className="bg-surface-hover">
                    <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-16">
                      Level
                    </th>
                    <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">
                      Article
                    </th>
                    <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-36">
                      Rule
                    </th>
                    <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.flatMap((report) =>
                    report.results.map((result, idx) => {
                      const style = LEVEL_STYLES[result.level];
                      return (
                        <tr key={`${report.articleId}-${idx}`} className="hover:bg-surface-hover">
                          <td className="border border-border px-3 py-1.5">
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[11px] font-semibold ${style.bg} ${style.text}`}
                            >
                              {style.label}
                            </span>
                          </td>
                          <td className="border border-border px-3 py-1.5">
                            <Link
                              href={`/articles/${report.articleSlug}`}
                              className="text-wiki-link hover:underline font-medium"
                            >
                              {report.articleTitle}
                            </Link>
                          </td>
                          <td className="border border-border px-3 py-1.5">
                            <code className="text-[11px] bg-surface-hover px-1 py-0.5">
                              {result.rule}
                            </code>
                          </td>
                          <td className="border border-border px-3 py-1.5 text-muted">
                            {result.message}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
