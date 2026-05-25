"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Button,
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
import type { CacheInvalidationRule } from "@/lib/cache-strategy";

type CachePayload = {
  generatedAt: string;
  redisConfigured: boolean;
  recipes: { id: string; label: string; summary: string }[];
  rules: CacheInvalidationRule[];
  staleWarnings: { message: string; surface: string }[];
};

export default function CachePage() {
  const [payload, setPayload] = useState<CachePayload | null>(null);
  const [error, setError] = useState("");
  const [lastInvalidation, setLastInvalidation] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingEvent, setSavingEvent] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cache");
      if (!res.ok) throw new Error("Cache report request failed");
      setPayload(await res.json());
      setError("");
    } catch {
      setError("Could not load cache status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  async function invalidate(event: string) {
    setSavingEvent(event);
    try {
      const res = await fetch("/api/admin/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });
      if (!res.ok) throw new Error("Cache invalidation failed");
      const data = await res.json();
      setLastInvalidation(`${data.event} at ${new Date(data.invalidatedAt).toLocaleTimeString()}`);
      await load();
    } catch {
      setError("Could not invalidate cache.");
    } finally {
      setSavingEvent("");
    }
  }

  if (loading) return <p className="p-4 text-[13px] text-muted">Loading cache status...</p>;

  return (
    <Page width="wide">
      <PageHeader
        title="Cache"
        description="Invalidation rules, cache status, stale warnings, and deployment recipes."
        actions={
          <>
            <LinkButton href="/admin/performance">Performance</LinkButton>
            <LinkButton href="/admin/operations">Operations</LinkButton>
          </>
        }
      />

      {error && <Notice className="mb-4 border-danger-border bg-danger-soft text-danger">{error}</Notice>}
      {lastInvalidation && <Notice className="mb-4">Last invalidation: {lastInvalidation}</Notice>}

      {payload && (
        <>
          <StatGrid>
            <StatCard label="Redis" value={<Chip tone={payload.redisConfigured ? "success" : "info"}>{payload.redisConfigured ? "configured" : "optional"}</Chip>} />
            <StatCard label="Rules" value={payload.rules.length} />
            <StatCard label="Recipes" value={payload.recipes.length} />
            <StatCard label="Generated" value={new Date(payload.generatedAt).toLocaleTimeString()} />
          </StatGrid>

          <Section title="Invalidation rules">
            <DataTable>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Surfaces</th>
                  <th>Keys</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payload.rules.map((rule) => (
                  <tr key={rule.event}>
                    <td>
                      <div className="font-medium text-heading">{rule.event}</div>
                      <div className="text-[12px] text-muted">{rule.description}</div>
                    </td>
                    <td>{rule.surfaces.join(", ")}</td>
                    <td className="font-mono text-[12px]">{rule.keys.join(", ")}</td>
                    <td>
                      <Button disabled={Boolean(savingEvent)} onClick={() => invalidate(rule.event)}>
                        {savingEvent === rule.event ? "Invalidating..." : "Invalidate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </Section>

          <Section title="Deployment recipes">
            <DataTable>
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Recipe</th>
                </tr>
              </thead>
              <tbody>
                {payload.recipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td className="font-medium text-heading">{recipe.label}</td>
                    <td className="text-muted">{recipe.summary}</td>
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
