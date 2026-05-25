"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  CodeBlock,
  DataTable,
  EmptyState,
  Field,
  InlineCode,
  Input,
  Notice,
  Page,
  PageHeader,
  SectionPanel,
  Select,
  StatCard,
  StatGrid,
  Textarea,
} from "@/components/ui";
import { useAdmin } from "@/components/AdminContext";
import {
  SUPPORTED_MARKETPLACE_IMPORT_KINDS,
  createMarketplaceImportPreview,
  marketplaceImportExamples,
  type MarketplaceImportKind,
  type MarketplaceImportPreview,
} from "@/lib/marketplace-import";

type MarketplaceItemSource = {
  label: string;
  path: string;
  remote: boolean;
  type: "built-in" | "local";
};

type MarketplaceItem = {
  author: string;
  compatibility: string;
  checksums: {
    manifest: string;
    screenshots?: Record<string, string>;
  };
  description: string;
  id: string;
  kind: string;
  license: string;
  name: string;
  screenshots: string[];
  source: MarketplaceItemSource;
  status: "built-in" | "planned" | "experimental";
  tags: string[];
  slots?: string[];
  routes?: string[];
  permissions?: string[];
  hooks?: string[];
  envValue?: string;
  version?: string;
};

type MarketplaceValidationIssue = {
  code: string;
  itemId?: string;
  kind?: string;
  message: string;
  severity: "error" | "warning";
};

type MarketplaceValidation = {
  errors: string[];
  issues?: MarketplaceValidationIssue[];
  summary?: {
    errorCount: number;
    itemCount: number;
    kindCounts: Record<string, number>;
    schemaVersion: string;
    source: MarketplaceItemSource;
    status: "healthy" | "warnings" | "errors";
    statusCounts: Record<string, number>;
    version: string;
    warningCount: number;
  };
  valid: boolean;
  warnings?: string[];
};

type MarketplaceManifest = {
  marketplace: {
    contract: Record<string, unknown>;
    catalogSource: MarketplaceItemSource;
    items: MarketplaceItem[];
    registry: {
      contract: Record<string, unknown>;
      id: string;
      items: MarketplaceItem[];
      schemaVersion: string;
      source: MarketplaceItemSource;
      supportedKinds: string[];
      supportedLicenses: string[];
      validation: MarketplaceValidation;
      version: string;
    };
    registryVersion: string;
    schemaVersion: string;
    validation: MarketplaceValidation;
  };
};

const order = ["style", "color-theme", "layout", "component-pack", "plugin", "theme-pack"];

export default function AdminMarketplacePage() {
  const isAdmin = useAdmin();
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [importJson, setImportJson] = useState(() => JSON.stringify(marketplaceImportExamples["theme-pack"], null, 2));
  const [importPreview, setImportPreview] = useState<MarketplaceImportPreview | null>(null);
  const [selectedExample, setSelectedExample] = useState<MarketplaceImportKind>("theme-pack");
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
    const validation = manifest?.marketplace.registry?.validation ?? manifest?.marketplace.validation;
    return {
      builtIn: items.filter((item) => item.status === "built-in").length,
      errors: validation?.summary?.errorCount ?? validation?.errors.length ?? 0,
      experimental: items.filter((item) => item.status === "experimental").length,
      planned: items.filter((item) => item.status === "planned").length,
      total: items.length,
      warnings: validation?.summary?.warningCount ?? validation?.warnings?.length ?? 0,
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
            <SectionPanel title="Registry health" bodyClassName="space-y-4">
              <StatGrid>
                <StatCard
                  label="Registry version"
                  value={manifest.marketplace.registryVersion}
                  detail={manifest.marketplace.schemaVersion}
                />
                <StatCard
                  label="Catalog items"
                  value={totals.total}
                  detail={`${totals.builtIn} built in / ${totals.planned} planned / ${totals.experimental} experimental`}
                />
                <StatCard
                  label="Validation"
                  value={manifest.marketplace.validation.valid ? "Healthy" : "Needs review"}
                  detail={`${totals.errors} errors / ${totals.warnings} warnings`}
                />
                <StatCard
                  label="Source"
                  value={manifest.marketplace.catalogSource.type}
                  detail={manifest.marketplace.catalogSource.path}
                />
              </StatGrid>
              <Notice
                role={manifest.marketplace.validation.valid ? "status" : "alert"}
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
              {manifest.marketplace.validation.summary && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(manifest.marketplace.validation.summary.kindCounts).map(([kind, count]) => (
                    <Chip key={kind}>{kind}: {count}</Chip>
                  ))}
                </div>
              )}
              {manifest.marketplace.validation.issues?.length ? (
                <ul className="space-y-1 text-[12px] text-muted">
                  {manifest.marketplace.validation.issues.slice(0, 8).map((issue) => (
                    <li key={`${issue.code}-${issue.itemId ?? issue.kind}`}>
                      <strong className={issue.severity === "error" ? "text-danger" : "text-warning"}>
                        {issue.severity}
                      </strong>
                      {": "}
                      {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
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

          <SectionPanel title="Import preview" bodyClassName="space-y-4">
            <Notice className="border-info-border bg-info-soft text-info" role="status">
              Imports are preview-only in v1. Arkivel parses metadata and safety checks here, but it does not install packs, execute code, write files, or change runtime config.
            </Notice>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
              <Field htmlFor="marketplace-import-json" label="Paste pack JSON">
                <Textarea
                  id="marketplace-import-json"
                  value={importJson}
                  onChange={(event) => {
                    setImportJson(event.target.value);
                    setImportPreview(null);
                  }}
                  rows={14}
                  spellCheck={false}
                />
              </Field>
              <div className="space-y-3">
                <Field htmlFor="marketplace-import-example" label="Sample contract">
                  <Select
                    id="marketplace-import-example"
                    value={selectedExample}
                    onChange={(event) => setSelectedExample(event.target.value as MarketplaceImportKind)}
                  >
                    {SUPPORTED_MARKETPLACE_IMPORT_KINDS.map((kind) => (
                      <option key={kind} value={kind}>{kind}</option>
                    ))}
                  </Select>
                </Field>
                <Button
                  aria-label={`Load ${selectedExample} import sample`}
                  onClick={() => {
                    setImportJson(JSON.stringify(marketplaceImportExamples[selectedExample], null, 2));
                    setImportPreview(null);
                  }}
                >
                  Load sample
                </Button>
                <Field htmlFor="marketplace-import-file" label="Upload JSON">
                  <Input
                    accept="application/json,.json"
                    id="marketplace-import-file"
                    type="file"
                    onChange={async (event) => {
                      const file = event.currentTarget.files?.[0];
                      if (!file) return;
                      setImportJson(await file.text());
                      setImportPreview(null);
                    }}
                  />
                </Field>
                <Button
                  aria-label="Preview marketplace import JSON"
                  variant="primary"
                  onClick={() => setImportPreview(createMarketplaceImportPreview(importJson))}
                >
                  Preview import
                </Button>
              </div>
            </div>
            {importPreview && <ImportPreviewPanel preview={importPreview} />}
          </SectionPanel>

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
                          aria-label={`Copy config for ${item.name}`}
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

          {manifest && <SectionPanel title="Registry contract">
            <CodeBlock>{JSON.stringify(manifest.marketplace.registry.contract, null, 2)}</CodeBlock>
          </SectionPanel>}
        </div>
      )}
    </Page>
  );
}

function ImportPreviewPanel({ preview }: { preview: MarketplaceImportPreview }) {
  const issueCount = preview.validationErrors.length + preview.securityErrors.length;
  const metadataRows = [
    ["id", preview.metadata.id],
    ["kind", preview.metadata.kind ?? preview.rawKind],
    ["name", preview.metadata.name],
    ["version", preview.metadata.version],
    ["compatibility", preview.metadata.compatibility],
    ["author", preview.metadata.author],
    ["license", preview.metadata.license],
    ["schema", preview.metadata.schemaVersion],
  ].filter(([, value]) => value);

  return (
    <div className="space-y-4">
      <Notice
        role={preview.valid ? "status" : "alert"}
        className={
          preview.valid
            ? "border-success-border bg-success-soft text-success"
            : "border-danger-border bg-danger-soft text-danger"
        }
      >
        {preview.valid
          ? "Import preview accepted. No files were installed and runtime config was not changed."
          : `Import preview blocked with ${issueCount} issue${issueCount === 1 ? "" : "s"}.`}
      </Notice>

      <StatGrid>
        <StatCard label="Status" value={preview.status} detail={preview.previewOnly ? "preview only" : ""} />
        <StatCard label="Required files" value={preview.requiredFiles.length} />
        <StatCard label="Required env vars" value={preview.requiredEnvVars.length} />
        <StatCard label="Security issues" value={preview.securityErrors.length} />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[13px] font-semibold text-heading">Parsed metadata</h3>
          <DataTable aria-label="Parsed import metadata">
            <tbody>
              {metadataRows.map(([label, value]) => (
                <tr key={label}>
                  <th className="w-32 text-left">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
        <div className="space-y-3">
          <ImportList title="Required files" values={preview.requiredFiles} />
          <ImportList title="Required env vars" values={preview.requiredEnvVars} />
          <ImportList title="Permissions" values={preview.permissions} />
          <ImportList title="Routes" values={preview.routes} />
          <ImportList title="Settings" values={preview.settings} />
          <ImportList title="Slots" values={preview.slots} />
          <ImportList title="Widgets" values={preview.widgets} />
          <ImportList title="Hooks" values={preview.hooks} />
        </div>
      </div>

      {(preview.validationErrors.length > 0 || preview.securityErrors.length > 0 || preview.compatibilityWarnings.length > 0) && (
        <div className="grid gap-3 md:grid-cols-3">
          <IssueList title="Validation" tone="danger" values={preview.validationErrors} />
          <IssueList title="Security" tone="danger" values={preview.securityErrors} />
          <IssueList title="Compatibility" tone="warning" values={preview.compatibilityWarnings} />
        </div>
      )}

      {preview.tokenDiff.length > 0 && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold text-heading">Theme token diff</h3>
          <DataTable aria-label="Theme token diff">
            <thead>
              <tr>
                <th>Token</th>
                <th>Built in</th>
                <th>Imported</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {preview.tokenDiff.map((row) => (
                <tr key={row.token}>
                  <td><InlineCode>{row.token}</InlineCode></td>
                  <td>{row.builtInValue ?? "-"}</td>
                  <td>{row.importedValue ?? "-"}</td>
                  <td><Chip tone={row.status === "changed" || row.status === "added" ? "warning" : "default"}>{row.status}</Chip></td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      )}
    </div>
  );
}

function ImportList({ title, values }: { title: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div>
      <h3 className="mb-1 text-[12px] font-semibold text-heading">{title}</h3>
      <div className="flex flex-wrap gap-1">
        {values.map((value) => <Chip key={value}>{value}</Chip>)}
      </div>
    </div>
  );
}

function IssueList({ title, tone, values }: { title: string; tone: "danger" | "warning"; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="border border-border bg-background p-3">
      <h3 className={`mb-2 text-[12px] font-semibold ${tone === "danger" ? "text-danger" : "text-warning"}`}>
        {title}
      </h3>
      <ul className="space-y-1 text-[12px] text-muted">
        {values.map((value) => <li key={value}>{value}</li>)}
      </ul>
    </div>
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

function Metadata({ item }: { item: MarketplaceItem }) {
  const rows = [
    item.version && `version: ${item.version}`,
    item.author && `author: ${item.author}`,
    item.license && `license: ${item.license}`,
    item.source?.type && `source: ${item.source.type}`,
    item.checksums?.manifest && `checksum: ${item.checksums.manifest}`,
    item.screenshots?.length ? `screenshots: ${item.screenshots.length}` : "",
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
