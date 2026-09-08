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
  status: "built-in" | "planned" | "experimental" | "local-only" | "deprecated" | "blocked";
  tags: string[];
  slots?: string[];
  routes?: string[];
  permissions?: string[];
  hooks?: string[];
  settings?: string[];
  widgets?: string[];
  recommendedLayout?: string;
  components?: Array<{
    description: string;
    name: string;
    slot: string;
  }>;
  envValue?: string;
  version: string;
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
const allFilterValue = "all";

export default function AdminMarketplacePage() {
  const isAdmin = useAdmin();
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [importJson, setImportJson] = useState(() => JSON.stringify(marketplaceImportExamples["theme-pack"], null, 2));
  const [importPreview, setImportPreview] = useState<MarketplaceImportPreview | null>(null);
  const [selectedExample, setSelectedExample] = useState<MarketplaceImportKind>("theme-pack");
  const [manifest, setManifest] = useState<MarketplaceManifest | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    compatibility: allFilterValue,
    kind: allFilterValue,
    layout: allFilterValue,
    permission: allFilterValue,
    slot: allFilterValue,
    status: allFilterValue,
    style: allFilterValue,
    tag: allFilterValue,
  });
  const [selectedItemId, setSelectedItemId] = useState("");

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
      const matchesQuery = !normalizedQuery || [item.name, item.id, item.kind, item.status, item.description, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesKind = filters.kind === allFilterValue || item.kind === filters.kind;
      const matchesStatus = filters.status === allFilterValue || item.status === filters.status;
      const matchesSlot = filters.slot === allFilterValue || item.slots?.includes(filters.slot);
      const matchesPermission = filters.permission === allFilterValue || item.permissions?.includes(filters.permission);
      const matchesCompatibility = filters.compatibility === allFilterValue || item.compatibility === filters.compatibility;
      const matchesLayout = filters.layout === allFilterValue || item.envValue === filters.layout || item.recommendedLayout === filters.layout || item.tags.includes(filters.layout);
      const matchesStyle = filters.style === allFilterValue || item.id === filters.style || item.tags.includes(filters.style);
      const matchesTag = filters.tag === allFilterValue || item.tags.includes(filters.tag);
      return matchesQuery && matchesKind && matchesStatus && matchesSlot && matchesPermission && matchesCompatibility && matchesLayout && matchesStyle && matchesTag;
    });
    for (const item of items) {
      groups.set(item.kind, [...(groups.get(item.kind) ?? []), item]);
    }
    return order.map((kind) => [kind, groups.get(kind) ?? []] as const).filter(([, items]) => items.length > 0);
  }, [filters, manifest, query]);

  const filterOptions = useMemo(() => {
    const items = manifest?.marketplace.items ?? [];
    return {
      compatibility: unique(items.map((item) => item.compatibility)),
      kind: unique(items.map((item) => item.kind)),
      layout: unique([
        ...items.filter((item) => item.kind === "layout").map((item) => item.envValue ?? item.id),
        ...items.map((item) => item.recommendedLayout),
      ]),
      permission: unique(items.flatMap((item) => item.permissions ?? [])),
      slot: unique(items.flatMap((item) => item.slots ?? [])),
      status: unique(items.map((item) => item.status)),
      style: unique(items.filter((item) => item.kind === "style").map((item) => item.id)),
      tag: unique(items.flatMap((item) => item.tags)),
    };
  }, [manifest]);

  const selectedItem = useMemo(() => {
    const items = manifest?.marketplace.items ?? [];
    return items.find((item) => item.id === selectedItemId) ?? items[0];
  }, [manifest, selectedItemId]);

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
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FilterSelect id="marketplace-kind" label="Kind" value={filters.kind} values={filterOptions.kind} onChange={(kind) => setFilters((current) => ({ ...current, kind }))} />
                <FilterSelect id="marketplace-status" label="Status" value={filters.status} values={filterOptions.status} onChange={(status) => setFilters((current) => ({ ...current, status }))} />
                <FilterSelect id="marketplace-slot" label="Slot" value={filters.slot} values={filterOptions.slot} onChange={(slot) => setFilters((current) => ({ ...current, slot }))} />
                <FilterSelect id="marketplace-permission" label="Permission" value={filters.permission} values={filterOptions.permission} onChange={(permission) => setFilters((current) => ({ ...current, permission }))} />
                <FilterSelect id="marketplace-compatibility" label="Compatibility" value={filters.compatibility} values={filterOptions.compatibility} onChange={(compatibility) => setFilters((current) => ({ ...current, compatibility }))} />
                <FilterSelect id="marketplace-layout" label="Layout" value={filters.layout} values={filterOptions.layout} onChange={(layout) => setFilters((current) => ({ ...current, layout }))} />
                <FilterSelect id="marketplace-style" label="Style" value={filters.style} values={filterOptions.style} onChange={(style) => setFilters((current) => ({ ...current, style }))} />
                <FilterSelect id="marketplace-tag" label="Tag" value={filters.tag} values={filterOptions.tag} onChange={(tag) => setFilters((current) => ({ ...current, tag }))} />
              </div>
              <Button
                aria-label="Clear marketplace filters"
                onClick={() => {
                  setQuery("");
                  setFilters({
                    compatibility: allFilterValue,
                    kind: allFilterValue,
                    layout: allFilterValue,
                    permission: allFilterValue,
                    slot: allFilterValue,
                    status: allFilterValue,
                    style: allFilterValue,
                    tag: allFilterValue,
                  });
                }}
              >
                Clear filters
              </Button>
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
                      <div className="flex flex-wrap gap-2">
                      <Button
                        aria-label={`View details for ${item.name}`}
                        onClick={() => setSelectedItemId(item.id)}
                        variant={selectedItem?.id === item.id ? "primary" : "default"}
                      >
                        Details
                      </Button>
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
                    </div>
                  );
                })}
              </div>
            </SectionPanel>
          ))}

          {manifest && grouped.length === 0 && (
            <EmptyState
              title={manifest.marketplace.items.length === 0 ? "No local registry items" : "No marketplace items match"}
              description={
                manifest.marketplace.items.length === 0
                  ? "This self-host build can publish a custom local registry through the customization manifest; the marketplace UI will show detail pages and copy actions as soon as entries are available."
                  : "Try a different search term or clear the filters."
              }
            />
          )}

          {selectedItem && (
            <MarketplaceDetailPanel
              copied={copied}
              item={selectedItem}
              onCopied={(key) => {
                setCopied(key);
                setTimeout(() => setCopied(""), 1800);
              }}
            />
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

function FilterSelect({
  id,
  label,
  onChange,
  value,
  values,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
  values: string[];
}) {
  return (
    <Field htmlFor={id} label={label}>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value={allFilterValue}>All {label.toLowerCase()}</option>
        {values.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </Select>
    </Field>
  );
}

function MarketplaceDetailPanel({
  copied,
  item,
  onCopied,
}: {
  copied: string;
  item: MarketplaceItem;
  onCopied: (key: string) => void;
}) {
  const configLine = configFor(item);
  const packJson = JSON.stringify(item, null, 2);
  const pluginManifest = item.kind === "plugin" ? JSON.stringify({
    compatibility: item.compatibility,
    hooks: item.hooks ?? [],
    id: item.id,
    kind: item.kind,
    name: item.name,
    permissions: item.permissions ?? [],
    routes: item.routes ?? [],
    settings: item.settings ?? [],
    version: item.version,
    widgets: item.widgets ?? [],
  }, null, 2) : "";
  const installationNotes = createInstallationNotes(item);
  const docsLinks = docsLinksFor(item);

  return (
    <SectionPanel
      title={`Details: ${item.name}`}
      actions={<Chip tone={toneForStatus(item.status)}>{item.status}</Chip>}
      bodyClassName="space-y-4"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <div className="space-y-4">
          <div>
            <InlineCode>{item.id}</InlineCode>
            <p className="mt-2 text-[13px] text-muted">{item.description}</p>
          </div>
          <DataTable aria-label={`${item.name} marketplace details`}>
            <tbody>
              <DetailRow label="Kind" value={item.kind} />
              <DetailRow label="Version" value={item.version} />
              <DetailRow label="Compatibility" value={item.compatibility} />
              <DetailRow label="Author" value={item.author} />
              <DetailRow label="License" value={item.license} />
              <DetailRow label="Source" value={`${item.source.label} (${item.source.path})`} />
              <DetailRow label="Manifest checksum" value={item.checksums.manifest} />
              <DetailRow label="Permissions" value={(item.permissions ?? []).join(", ") || "none declared"} />
              <DetailRow label="Slots" value={(item.slots ?? []).join(", ") || "none declared"} />
              <DetailRow label="Routes" value={(item.routes ?? []).join(", ") || "none declared"} />
              <DetailRow label="Hooks" value={(item.hooks ?? []).join(", ") || "none declared"} />
              <DetailRow label="Recommended layout" value={item.recommendedLayout ?? "none declared"} />
            </tbody>
          </DataTable>
          {item.components?.length ? (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold text-heading">Pack components</h3>
              <DataTable aria-label={`${item.name} component list`}>
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {item.components.map((component) => (
                    <tr key={`${component.slot}-${component.name}`}>
                      <td><InlineCode>{component.slot}</InlineCode></td>
                      <td>{component.name}</td>
                      <td>{component.description}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
          ) : null}
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-heading">Screenshots</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {item.screenshots.map((path) => (
                <div key={path} className="border border-border bg-surface p-3 text-[12px] text-muted">
                  <div className="font-semibold text-heading">{path}</div>
                  <div>Checksum: {item.checksums.screenshots?.[path] ?? "not listed"}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-heading">Changelog</h3>
            <ul className="space-y-1 text-[12px] text-muted">
              <li>{item.version}: Registry detail metadata published for preview and self-host planning.</li>
              <li>Status: {item.status}.</li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-heading">Copy actions</h3>
            <div className="flex flex-wrap gap-2">
              {configLine && <CopyButton copied={copied} copyKey={`${item.id}:env`} label="Copy env var" value={configLine} onCopied={onCopied} />}
              <CopyButton copied={copied} copyKey={`${item.id}:pack`} label="Copy pack JSON" value={packJson} onCopied={onCopied} />
              {pluginManifest && <CopyButton copied={copied} copyKey={`${item.id}:plugin`} label="Copy plugin manifest" value={pluginManifest} onCopied={onCopied} />}
              <CopyButton copied={copied} copyKey={`${item.id}:notes`} label="Copy install notes" value={installationNotes} onCopied={onCopied} />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-heading">Installation notes</h3>
            <CodeBlock>{installationNotes}</CodeBlock>
          </div>
          <div>
            <h3 className="mb-2 text-[13px] font-semibold text-heading">Docs links</h3>
            <ul className="space-y-1 text-[12px] text-muted">
              {docsLinks.map((link) => (
                <li key={link.href}><a className="wiki-link" href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}

function CopyButton({
  copied,
  copyKey,
  label,
  onCopied,
  value,
}: {
  copied: string;
  copyKey: string;
  label: string;
  onCopied: (key: string) => void;
  value: string;
}) {
  return (
    <Button
      aria-label={label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        onCopied(copyKey);
      }}
    >
      {copied === copyKey ? "Copied" : label}
    </Button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="w-40 text-left">{label}</th>
      <td>{value}</td>
    </tr>
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
  if (status === "experimental" || status === "deprecated") return "warning";
  if (status === "blocked") return "danger";
  return "info";
}

function createInstallationNotes(item: MarketplaceItem) {
  const configLine = configFor(item);
  const lines = [
    `${item.name} (${item.id})`,
    `Kind: ${item.kind}`,
    `Status: ${item.status}`,
    `Compatibility: ${item.compatibility}`,
    `Source: ${item.source.path}`,
  ];
  if (configLine) {
    lines.push("", "Set this public env var, then rebuild or redeploy:", configLine);
  } else {
    lines.push("", "This listing is preview-only until the trusted local install flow ships.");
  }
  if (item.permissions?.length) lines.push("", `Review permissions: ${item.permissions.join(", ")}`);
  return lines.join("\n");
}

function docsLinksFor(item: MarketplaceItem) {
  const links = [
    { href: "/help", label: "Help" },
    { href: "/features", label: "Features" },
    { href: "/api-docs", label: "Customization API" },
  ];
  if (item.kind === "plugin") links.push({ href: "/admin/plugins", label: "Plugin admin" });
  if (item.kind === "style" || item.kind === "color-theme" || item.kind === "layout") {
    links.push({ href: "/admin/customization", label: "Customization Studio" });
  }
  return links;
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));
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
    item.recommendedLayout ? `layout: ${item.recommendedLayout}` : "",
    item.components?.length ? `components: ${item.components.length}` : "",
  ].filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <ul className="mb-3 space-y-1 text-[11px] text-muted">
      {rows.map((row) => <li key={row}>{row}</li>)}
    </ul>
  );
}
