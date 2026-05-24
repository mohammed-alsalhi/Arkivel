"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Chip, CodeBlock, EmptyState, InlineCode, Page, PageHeader, SectionPanel } from "@/components/ui";
import { useAdmin } from "@/components/AdminContext";

type MarketplaceItem = {
  compatibility: string;
  description: string;
  id: string;
  kind: string;
  name: string;
  status: "built-in" | "planned" | "experimental";
  tags: string[];
};

type MarketplaceManifest = {
  marketplace: {
    contract: Record<string, string>;
    items: MarketplaceItem[];
  };
};

const order = ["style", "color-theme", "layout", "component-pack", "plugin", "theme-pack"];

export default function AdminMarketplacePage() {
  const isAdmin = useAdmin();
  const [copied, setCopied] = useState("");
  const [manifest, setManifest] = useState<MarketplaceManifest | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/customization");
      const data = await res.json();
      if (!cancelled) setManifest(data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const groups = new Map<string, MarketplaceItem[]>();
    for (const item of manifest?.marketplace.items ?? []) {
      groups.set(item.kind, [...(groups.get(item.kind) ?? []), item]);
    }
    return order.map((kind) => [kind, groups.get(kind) ?? []] as const).filter(([, items]) => items.length > 0);
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

      {!manifest ? (
        <p className="text-[13px] text-muted">Loading marketplace catalog...</p>
      ) : (
        <div className="space-y-5">
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
                        <Chip>{item.status}</Chip>
                      </div>
                      <p className="mb-3 text-[12px] text-muted">{item.description}</p>
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

          <SectionPanel title="Catalog contract">
            <CodeBlock>{JSON.stringify(manifest.marketplace.contract, null, 2)}</CodeBlock>
          </SectionPanel>
        </div>
      )}
    </Page>
  );
}

function configFor(item: MarketplaceItem) {
  if (item.kind === "style") return `NEXT_PUBLIC_ARKIVEL_STYLE="${item.id}"`;
  if (item.kind === "color-theme") return `NEXT_PUBLIC_ARKIVEL_COLOR_THEME="${item.id}"`;
  if (item.kind === "layout") return `NEXT_PUBLIC_ARKIVEL_LAYOUT="${item.id}"`;
  return "";
}
