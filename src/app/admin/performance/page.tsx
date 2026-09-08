"use client";

import { useEffect, useState } from "react";
import {
  Chip,
  DataTable,
  LinkButton,
  Notice,
  Page,
  PageHeader,
  Section,
  StatCard,
  StatGrid,
} from "@/components/ui";
import type {
  LargeWikiFixture,
  PerformanceBudgetResult,
  SlowQueryDiagnostic,
} from "@/lib/performance-budgets";

type PerformancePayload = {
  budgetResults: PerformanceBudgetResult[];
  fixtures: LargeWikiFixture[];
  generatedAt: string;
  slowQueries: SlowQueryDiagnostic[];
  slowestRoutes: {
    budgetId: string | null;
    duration: number;
    path: string;
    type: string;
  }[];
};

export default function PerformancePage() {
  const [payload, setPayload] = useState<PerformancePayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      fetch("/api/admin/performance")
        .then((response) => {
          if (!response.ok) throw new Error("Performance report request failed");
          return response.json();
        })
        .then((data) => {
          setPayload(data);
          setError("");
        })
        .catch(() => setError("Could not load performance budgets."))
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) return <p className="p-4 text-[13px] text-muted">Loading performance...</p>;

  const failing = payload?.budgetResults.filter((budget) => budget.status === "fail").length ?? 0;
  const warning = payload?.budgetResults.filter((budget) => budget.status === "warning").length ?? 0;
  const unknown = payload?.budgetResults.filter((budget) => budget.status === "unknown").length ?? 0;

  return (
    <Page width="wide">
      <PageHeader
        title="Performance"
        description="Route budgets, bundle targets, large-wiki fixtures, and slow-query review guidance."
        actions={
          <>
            <LinkButton href="/admin/observability">Observability</LinkButton>
            <LinkButton href="/admin/operations">Operations</LinkButton>
          </>
        }
      />

      {error && <Notice className="mb-4 border-danger-border bg-danger-soft text-danger">{error}</Notice>}

      {payload && (
        <>
          <StatGrid>
            <StatCard label="Failing budgets" value={failing} />
            <StatCard label="Warnings" value={warning} />
            <StatCard label="No samples" value={unknown} />
            <StatCard label="Slow samples" value={payload.slowestRoutes.length} detail={`Generated ${new Date(payload.generatedAt).toLocaleTimeString()}`} />
          </StatGrid>

          <Section title="Route budgets">
            <DataTable>
              <thead>
                <tr>
                  <th>Surface</th>
                  <th>Status</th>
                  <th>Observed p95</th>
                  <th>Budget</th>
                  <th>Bundle</th>
                </tr>
              </thead>
              <tbody>
                {payload.budgetResults.map((budget) => (
                  <tr key={budget.id}>
                    <td>
                      <div className="font-medium text-heading">{budget.title}</div>
                      <div className="font-mono text-[12px] text-muted">{budget.route}</div>
                    </td>
                    <td><StatusChip status={budget.status} /></td>
                    <td>{budget.observedP95Ms == null ? "No samples" : `${budget.observedP95Ms}ms`}</td>
                    <td>{budget.p95Ms}ms p95 / {budget.interactionMs}ms interaction</td>
                    <td>{budget.bundleKb}KB</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Section>

          <Section title="Large-wiki fixtures">
            <DataTable>
              <thead>
                <tr>
                  <th>Fixture</th>
                  <th>Articles</th>
                  <th>Links</th>
                  <th>Revisions</th>
                  <th>Taxonomy</th>
                </tr>
              </thead>
              <tbody>
                {payload.fixtures.map((fixture) => (
                  <tr key={fixture.id}>
                    <td className="font-medium text-heading">{fixture.title}</td>
                    <td>{fixture.articles.toLocaleString()}</td>
                    <td>{fixture.links.toLocaleString()}</td>
                    <td>{fixture.revisions.toLocaleString()}</td>
                    <td>{fixture.categories} categories / {fixture.tags} tags</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Section>

          <Section title="Slow-query review">
            <DataTable>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Threshold</th>
                  <th>Pattern</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {payload.slowQueries.map((query) => (
                  <tr key={query.id}>
                    <td>{query.category}</td>
                    <td>{query.thresholdMs}ms</td>
                    <td className="font-mono text-[12px]">{query.queryPattern}</td>
                    <td className="text-muted">{query.review}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Section>
        </>
      )}
    </Page>
  );
}

function StatusChip({ status }: { status: PerformanceBudgetResult["status"] }) {
  const tone = status === "pass" ? "success" : status === "fail" ? "danger" : status === "warning" ? "warning" : "info";
  return <Chip tone={tone}>{status}</Chip>;
}
