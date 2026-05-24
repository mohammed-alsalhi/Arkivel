"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  CodeBlock,
  EmptyState,
  Field,
  InlineCode,
  Input,
  Notice,
  Page,
  PageHeader,
  SectionPanel,
} from "@/components/ui";
import { useAdmin } from "@/components/AdminContext";

type MarketplaceItem = {
  compatibility: string;
  description: string;
  id: string;
  kind: string;
  name: string;
  status: "built-in" | "planned" | "experimental";
  tags: string[];
  slots?: string[];
  routes?: string[];
  permissions?: string[];
  hooks?: string[];
  envValue?: string;
  version?: string;
};

type MarketplaceManifest = {
  marketplace: {
    contract: Record<string, string>;
    items: MarketplaceItem[];
    validation: { errors: string[]; valid: boolean };
  };
};

const order = ["style", "color-theme", "layout", "component-pack", "plugin", "theme-pack"];

export default function AdminMarketplacePage() {
  const isAdmin = useAdmin();
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [manifest, setManifest] = useState<MarketplaceManifest | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/customization");
        if (!res.ok) throw new Error("Marketplace manifest request failed");
        const data = await res.json();
        if (!cancelled) setManifest(data);
      } catch {
        if (!cancelled) setError("Could not load the built-in marketplace catalog.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const groups = new Map<string, MarketplaceItem[]>();
    const normalizedQuery = query.trim().toLowerCase();
    const items = (manifest?.marketplace.items ?? []).filter((item) => {
      if (!normalizedQuery) return true;
      return [item.name, item.id, item.kind, item.status, item.description, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
    for (const item of items) {
      groups.set(item.kind, [...(groups.get(item.kind) ?? []), item]);
    }
    return order.map((kind) => [kind, groups.get(kind) ?? []] as const).filter(([, items]) => items.length > 0);
  }, [manifest, query]);

  const totals = useMemo(() => {
    const items = manifest?.marketplace.items ?? [];
    return {
      builtIn: items.filter((item) => item.status === "built-in").length,
      planned: items.filter((item) => item.status === "planned").length,
      total: items.length,
    };
  }, [manifest]);

  if (!isAdmin) {
    return (
      <Page width="narrow">
        <EmptyState title="Admin access required" description="Log in as an admin to browse the built-in marketplace catalog." />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Marketplace"
        description="Browse built-in and planned styles, themes, layouts, component packs, plugins, and theme packs. Remote install is intentionally disabled in v1."
      />

      {error && <Notice className="mb-4 border-danger-border bg-danger-soft text-danger">{error}</Notice>}

      {!manifest && !error ? (
        <p className="text-[13px] text-muted">Loading marketplace catalog...</p>
      ) : (
        <div className="space-y-5">
          {manifest && (
            <SectionPanel title="Catalog health" bodyClassName="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric label="Total items" value={totals.total} />
                <Metric label="Built in" value={totals.builtIn} />
                <Metric label="Planned" value={totals.planned} />
              </div>
              <Notice
                className={
                  manifest.marketplace.validation.valid
                    ? "border-success-border bg-success-soft text-success"
                    : "border-danger-border bg-danger-soft text-danger"
                }
              >
                {manifest.marketplace.validation.valid
                  ? "Catalog integrity checks passed."
                  : manifest.marketplace.validation.errors.join(" ")}
              </Notice>
              <Field htmlFor="marketplace-search" label="Filter catalog">
                <Input
                  id="marketplace-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by kind, name, tag, status, or id"
                />
              </Field>
            </SectionPanel>
          )}

          {grouped.map(([kind, items]) => (
            <SectionPanel key={kind} title={kind.replaceAll("-", " ")}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const configLine = configFor(item);
                  return (
                    <div key={item.id} className="border border-border bg-background p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[13px] font-semibold text-heading">{item.name}</div>
                          <InlineCode>{item.id}</InlineCode>
                        </div>
                        <Chip tone={toneForStatus(item.status)}>{item.status}</Chip>
                      </div>
                      <p className="mb-3 text-[12px] text-muted">{item.description}</p>
                      <Metadata item={item} />
                      <div className="mb-3 flex flex-wrap gap-1">
                        {item.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
                      </div>
                      <p className="mb-3 text-[11px] text-muted">Compatibility: {item.compatibility}</p>
                      {configLine && (
                        <Button
                          onClick={async () => {
                            await navigator.clipboard.writeText(configLine);
                            setCopied(item.id);
                            setTimeout(() => setCopied(""), 1800);
                          }}
                        >
                          {copied === item.id ? "Copied" : "Copy config"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionPanel>
          ))}

          {manifest && grouped.length === 0 && (
            <EmptyState title="No marketplace items match" description="Try a different search term or clear the filter." />
          )}

          {manifest && <SectionPanel title="Catalog contract">
            <CodeBlock>{JSON.stringify(manifest.marketplace.contract, null, 2)}</CodeBlock>
          </SectionPanel>}
        </div>
      )}
    </Page>
  );
}

function configFor(item: MarketplaceItem) {
  if (item.kind === "style") return `NEXT_PUBLIC_ARKIVEL_STYLE="${item.id}"`;
  if (item.kind === "color-theme") return `NEXT_PUBLIC_ARKIVEL_COLOR_THEME="${item.id}"`;
  if (item.kind === "layout") return `NEXT_PUBLIC_ARKIVEL_LAYOUT="${item.envValue ?? item.id}"`;
  return "";
}

function toneForStatus(status: MarketplaceItem["status"]) {
  if (status === "built-in") return "success";
  if (status === "experimental") return "warning";
  return "info";
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-background p-3">
      <div className="text-[11px] uppercase text-muted">{label}</div>
      <div className="text-lg font-semibold text-heading">{value}</div>
    </div>
  );
}

function Metadata({ item }: { item: MarketplaceItem }) {
  const rows = [
    item.version && `version: ${item.version}`,
    item.slots?.length ? `slots: ${item.slots.join(", ")}` : "",
    item.routes?.length ? `routes: ${item.routes.join(", ")}` : "",
    item.permissions?.length ? `permissions: ${item.permissions.join(", ")}` : "",
    item.hooks?.length ? `hooks: ${item.hooks.join(", ")}` : "",
  ].filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <ul className="mb-3 space-y-1 text-[11px] text-muted">
      {rows.map((row) => <li key={row}>{row}</li>)}
    </ul>
  );
}
