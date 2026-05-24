"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CodeBlock,
  DataTable,
  EmptyState,
  Field,
  InlineCode,
  Notice,
  Page,
  PageHeader,
  SectionPanel,
  Select,
  Textarea,
} from "@/components/ui";
import { useAdmin } from "@/components/AdminContext";
import { validateThemePack } from "@/lib/marketplace";

type CustomizationManifest = {
  customization: {
    brand: Record<string, string>;
    features: Record<string, boolean>;
    integrations: Record<string, string>;
    limits: Record<string, number | string>;
    map: Record<string, boolean | string>;
    style: {
      colorThemeId: string;
      id: string;
      layoutId: string;
    };
    version: string;
  };
  options: { defaultValue: string; description: string; env: string; section: string }[];
  ui: {
    colorThemePresets: { id: string; name: string; description: string; themeAttribute: string }[];
    layoutPresets: { id: string; name: string; description: string; envValue: string; status: string }[];
    stylePresets: { id: string; name: string; description: string; themeAttribute: string }[];
    themePacks: { id: string; name: string; tokens: Record<string, string>; version: string }[];
    themePackSchema: Record<string, unknown>;
  };
};

type DraftConfig = {
  colorThemeId: string;
  layoutId: string;
  styleId: string;
};

function envValue(value: string | number | boolean) {
  return typeof value === "boolean" ? String(value) : JSON.stringify(String(value));
}

function buildEnvOutput(manifest: CustomizationManifest, draft: DraftConfig) {
  const current = manifest.customization;
  const values: Record<string, string | number | boolean> = {
    NEXT_PUBLIC_ARKIVEL_NAME: current.brand.name,
    NEXT_PUBLIC_ARKIVEL_TAGLINE: current.brand.tagline,
    NEXT_PUBLIC_ARKIVEL_DESCRIPTION: current.brand.description,
    NEXT_PUBLIC_ARKIVEL_WELCOME_TEXT: current.brand.welcomeText,
    NEXT_PUBLIC_ARKIVEL_FOOTER_TEXT: current.brand.footerText,
    NEXT_PUBLIC_ARKIVEL_LOGO: current.brand.logo,
    NEXT_PUBLIC_ARKIVEL_LOGO_MARK: current.brand.logoMark,
    NEXT_PUBLIC_ARKIVEL_APP_ICON: current.brand.appIcon,
    NEXT_PUBLIC_ARKIVEL_STYLE: draft.styleId,
    NEXT_PUBLIC_ARKIVEL_COLOR_THEME: draft.colorThemeId,
    NEXT_PUBLIC_ARKIVEL_LAYOUT: draft.layoutId,
    NEXT_PUBLIC_ENABLE_REGISTRATION: current.features.registrationEnabled,
    NEXT_PUBLIC_ENABLE_DISCUSSIONS: current.features.discussionsEnabled,
    NEXT_PUBLIC_DEFAULT_LOCALE: current.limits.defaultLocale,
    NEXT_PUBLIC_ARTICLES_PER_PAGE: current.limits.articlesPerPage,
    NEXT_PUBLIC_MAX_UPLOAD_SIZE: current.limits.maxUploadSize,
    NEXT_PUBLIC_MAP_ENABLED: current.map.enabled,
    NEXT_PUBLIC_MAP_LABEL: current.map.label,
    NEXT_PUBLIC_MAP_IMAGE: current.map.image,
    NEXT_PUBLIC_BASE_URL: current.integrations.baseUrl,
  };

  return Object.entries(values)
    .map(([key, value]) => `${key}=${envValue(value)}`)
    .join("\n");
}

export default function AdminCustomizationPage() {
  const isAdmin = useAdmin();
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<DraftConfig>({ colorThemeId: "", layoutId: "", styleId: "" });
  const [manifest, setManifest] = useState<CustomizationManifest | null>(null);
  const [error, setError] = useState("");
  const [themePackJson, setThemePackJson] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/customization");
        if (!res.ok) throw new Error("Customization manifest request failed");
        const data = await res.json();
        if (!cancelled) {
          setManifest(data);
          setDraft({
            colorThemeId: data.customization.style.colorThemeId,
            layoutId: data.customization.style.layoutId,
            styleId: data.customization.style.id,
          });
          setThemePackJson(JSON.stringify(data.ui.themePacks?.[0] ?? data.ui.themePackSchema, null, 2));
        }
      } catch {
        if (!cancelled) setError("Could not load the customization manifest.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const envOutput = useMemo(() => (manifest ? buildEnvOutput(manifest, draft) : ""), [draft, manifest]);
  const themePackValidation = useMemo(() => {
    if (!themePackJson.trim()) return { errors: ["Paste a theme pack JSON object to validate."], valid: false };
    try {
      return validateThemePack(JSON.parse(themePackJson));
    } catch {
      return { errors: ["Theme pack must be valid JSON."], valid: false };
    }
  }, [themePackJson]);

  if (!isAdmin) {
    return (
      <Page width="narrow">
        <EmptyState title="Admin access required" description="Log in as an admin to preview customization settings." />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Customization Studio"
        description="Preview self-host branding, styles, color themes, layouts, and env configuration without writing database overrides."
      />

      {error && <Notice className="mb-4 border-danger-border bg-danger-soft text-danger">{error}</Notice>}

      {!manifest ? (
        <p className="text-[13px] text-muted">Loading customization manifest...</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
          <div className="space-y-4">
            <SectionPanel title="Current instance">
              <DataTable>
                <tbody>
                  <tr><th>Version</th><td>{manifest.customization.version}</td></tr>
                  <tr><th>Name</th><td>{manifest.customization.brand.name}</td></tr>
                  <tr><th>Style</th><td><InlineCode>{manifest.customization.style.id}</InlineCode></td></tr>
                  <tr><th>Color theme</th><td><InlineCode>{manifest.customization.style.colorThemeId}</InlineCode></td></tr>
                  <tr><th>Layout</th><td><InlineCode>{manifest.customization.style.layoutId}</InlineCode></td></tr>
                  <tr><th>Registration</th><td>{manifest.customization.features.registrationEnabled ? "Enabled" : "Disabled"}</td></tr>
                  <tr><th>Discussions</th><td>{manifest.customization.features.discussionsEnabled ? "Enabled" : "Disabled"}</td></tr>
                </tbody>
              </DataTable>
            </SectionPanel>

            <SectionPanel title="Preview configuration" bodyClassName="grid gap-3 md:grid-cols-3">
              <Field htmlFor="preview-style" label="Style">
                <Select
                  id="preview-style"
                  value={draft.styleId}
                  onChange={(event) => setDraft((current) => ({ ...current, styleId: event.target.value }))}
                >
                  {manifest.ui.stylePresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.name}</option>
                  ))}
                </Select>
              </Field>
              <Field htmlFor="preview-color-theme" label="Color theme">
                <Select
                  id="preview-color-theme"
                  value={draft.colorThemeId}
                  onChange={(event) => setDraft((current) => ({ ...current, colorThemeId: event.target.value }))}
                >
                  {manifest.ui.colorThemePresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.name}</option>
                  ))}
                </Select>
              </Field>
              <Field htmlFor="preview-layout" label="Layout">
                <Select
                  id="preview-layout"
                  value={draft.layoutId}
                  onChange={(event) => setDraft((current) => ({ ...current, layoutId: event.target.value }))}
                >
                  {manifest.ui.layoutPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.name}</option>
                  ))}
                </Select>
              </Field>
              <div
                className="md:col-span-3 border border-border bg-background p-4"
                data-color-theme={draft.colorThemeId}
                data-layout={draft.layoutId}
                data-style={draft.styleId}
              >
                <p className="text-[12px] font-semibold text-heading">Preview target</p>
                <p className="mt-1 text-[12px] text-muted">
                  {draft.styleId} style, {draft.colorThemeId} palette, {draft.layoutId} layout.
                </p>
              </div>
            </SectionPanel>

            <SectionPanel title="Style presets" bodyClassName="grid gap-3 md:grid-cols-2">
              {manifest.ui.stylePresets.map((preset) => (
                <PreviewCard key={preset.id} title={preset.name} code={preset.id} description={preset.description} />
              ))}
            </SectionPanel>

            <SectionPanel title="Color themes" bodyClassName="grid gap-3 md:grid-cols-3">
              {manifest.ui.colorThemePresets.map((preset) => (
                <PreviewCard key={preset.id} title={preset.name} code={preset.id} description={preset.description} />
              ))}
            </SectionPanel>

            <SectionPanel title="Layout presets" bodyClassName="grid gap-3 md:grid-cols-2">
              {manifest.ui.layoutPresets.map((preset) => (
                <PreviewCard
                  key={preset.id}
                  title={`${preset.name} (${preset.status})`}
                  code={preset.envValue}
                  description={preset.description}
                />
              ))}
            </SectionPanel>
          </div>

          <div className="space-y-4">
            <SectionPanel
              title="Copy-ready .env"
              actions={
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(envOutput);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                  variant="primary"
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              }
            >
              <CodeBlock>{envOutput}</CodeBlock>
              <p className="mt-2 text-[12px] text-muted">
                This v1 studio is env-first. Change these values in deployment config, then rebuild or redeploy.
              </p>
            </SectionPanel>

            <SectionPanel title="Theme pack schema">
              <CodeBlock>{JSON.stringify(manifest.ui.themePackSchema, null, 2)}</CodeBlock>
            </SectionPanel>

            <SectionPanel title="Theme pack validator">
              <Textarea
                aria-label="Theme pack JSON"
                className="font-mono"
                rows={10}
                value={themePackJson}
                onChange={(event) => setThemePackJson(event.target.value)}
              />
              <Notice
                className={
                  themePackValidation.valid
                    ? "mt-3 border-success-border bg-success-soft text-success"
                    : "mt-3 border-warning-border bg-warning-soft text-warning"
                }
              >
                {themePackValidation.valid
                  ? "Theme pack is valid for preview."
                  : themePackValidation.errors.join(" ")}
              </Notice>
            </SectionPanel>
          </div>
        </div>
      )}
    </Page>
  );
}

function PreviewCard({ code, description, title }: { code: string; description: string; title: string }) {
  return (
    <div className="border border-border bg-surface p-3">
      <div className="mb-1 text-[13px] font-semibold text-heading">{title}</div>
      <InlineCode>{code}</InlineCode>
      <p className="mt-2 text-[12px] text-muted">{description}</p>
    </div>
  );
}
