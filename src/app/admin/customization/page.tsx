"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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
  ScreenReaderOnly,
  SectionPanel,
  Select,
  StatCard,
  StatGrid,
  TabButton,
  Tabs,
  Textarea,
  Toolbar,
  ToolbarGroup,
} from "@/components/ui";
import { useAdmin } from "@/components/AdminContext";
import {
  applyCustomizationDraftPreset,
  createCustomizationDraftDiff,
  createSavedCustomizationDraft,
  CUSTOMIZATION_DRAFT_PRESETS,
  CUSTOMIZATION_DRAFT_STORAGE_KEY,
  DEFAULT_CUSTOMIZATION_DRAFT,
  parseSavedCustomizationDrafts,
  type CustomizationDraft,
  type SavedCustomizationDraft,
} from "@/lib/customization-drafts";
import {
  analyzeCustomizationDraft,
  type CustomizationDiagnosticsReport,
  type DiagnosticSeverity,
} from "@/lib/customization-diagnostics";
import {
  createCustomizationStudioSummary,
  CUSTOMIZATION_STUDIO_TABS,
  CUSTOMIZATION_STUDIO_VIEWPORTS,
  getNextCustomizationStudioTab,
  type CustomizationStudioTabId,
} from "@/lib/customization-studio";
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

type EnvEntry = {
  key: string;
  source: "default" | "env" | "draft";
  value: string | number | boolean;
};

type StudioTab = CustomizationStudioTabId;
type OutputMode = "env" | "local" | "vercel" | "docker";

const outputModes: { id: OutputMode; label: string }[] = [
  { id: "env", label: ".env" },
  { id: "local", label: ".env.local" },
  { id: "vercel", label: "Vercel" },
  { id: "docker", label: "Docker" },
];

function envValue(value: string | number | boolean) {
  return typeof value === "boolean" ? String(value) : JSON.stringify(String(value));
}

function unquotedValue(value: string | number | boolean) {
  return typeof value === "boolean" ? String(value) : String(value);
}

function optionDefaults(manifest: CustomizationManifest) {
  return new Map(manifest.options.map((option) => [option.env, option.defaultValue]));
}

function sourceFor(defaults: Map<string, string>, key: string, value: string | number | boolean, draftValue: string | number | boolean) {
  if (String(value) !== String(draftValue)) return "draft";
  return String(value) === defaults.get(key) ? "default" : "env";
}

function createDraft(manifest: CustomizationManifest): CustomizationDraft {
  const current = manifest.customization;

  return {
    appIcon: current.brand.appIcon,
    baseUrl: current.integrations.baseUrl,
    colorThemeId: current.style.colorThemeId,
    description: current.brand.description,
    discussionsEnabled: current.features.discussionsEnabled,
    footerText: current.brand.footerText,
    layoutId: current.style.layoutId,
    logo: current.brand.logo,
    logoMark: current.brand.logoMark,
    mapEnabled: Boolean(current.map.enabled),
    name: current.brand.name,
    registrationEnabled: current.features.registrationEnabled,
    styleId: current.style.id,
    tagline: current.brand.tagline,
    welcomeText: current.brand.welcomeText,
  };
}

function buildEnvEntries(manifest: CustomizationManifest, draft: CustomizationDraft): EnvEntry[] {
  const current = manifest.customization;
  const defaults = optionDefaults(manifest);
  const rows: [string, string | number | boolean, string | number | boolean][] = [
    ["NEXT_PUBLIC_ARKIVEL_NAME", current.brand.name, draft.name],
    ["NEXT_PUBLIC_ARKIVEL_TAGLINE", current.brand.tagline, draft.tagline],
    ["NEXT_PUBLIC_ARKIVEL_DESCRIPTION", current.brand.description, draft.description],
    ["NEXT_PUBLIC_ARKIVEL_WELCOME_TEXT", current.brand.welcomeText, draft.welcomeText],
    ["NEXT_PUBLIC_ARKIVEL_FOOTER_TEXT", current.brand.footerText, draft.footerText],
    ["NEXT_PUBLIC_ARKIVEL_LOGO", current.brand.logo, draft.logo],
    ["NEXT_PUBLIC_ARKIVEL_LOGO_MARK", current.brand.logoMark, draft.logoMark],
    ["NEXT_PUBLIC_ARKIVEL_APP_ICON", current.brand.appIcon, draft.appIcon],
    ["NEXT_PUBLIC_ARKIVEL_STYLE", current.style.id, draft.styleId],
    ["NEXT_PUBLIC_ARKIVEL_COLOR_THEME", current.style.colorThemeId, draft.colorThemeId],
    ["NEXT_PUBLIC_ARKIVEL_LAYOUT", current.style.layoutId, draft.layoutId],
    ["NEXT_PUBLIC_ENABLE_REGISTRATION", current.features.registrationEnabled, draft.registrationEnabled],
    ["NEXT_PUBLIC_ENABLE_DISCUSSIONS", current.features.discussionsEnabled, draft.discussionsEnabled],
    ["NEXT_PUBLIC_MAP_ENABLED", current.map.enabled, draft.mapEnabled],
    ["NEXT_PUBLIC_MAP_LABEL", current.map.label, current.map.label],
    ["NEXT_PUBLIC_MAP_IMAGE", current.map.image, current.map.image],
    ["NEXT_PUBLIC_DEFAULT_LOCALE", current.limits.defaultLocale, current.limits.defaultLocale],
    ["NEXT_PUBLIC_ARTICLES_PER_PAGE", current.limits.articlesPerPage, current.limits.articlesPerPage],
    ["NEXT_PUBLIC_MAX_UPLOAD_SIZE", current.limits.maxUploadSize, current.limits.maxUploadSize],
    ["NEXT_PUBLIC_BASE_URL", current.integrations.baseUrl, draft.baseUrl],
  ];

  return rows.map(([key, currentValue, draftValue]) => ({
    key,
    source: sourceFor(defaults, key, currentValue, draftValue),
    value: draftValue,
  }));
}

function buildOutput(entries: EnvEntry[], mode: OutputMode) {
  if (mode === "vercel") {
    return entries
      .map((entry) => `vercel env add ${entry.key} production # ${unquotedValue(entry.value)}`)
      .join("\n");
  }

  if (mode === "docker") {
    return entries.map((entry) => `      - ${entry.key}=${unquotedValue(entry.value)}`).join("\n");
  }

  const lines = entries.map((entry) => `${entry.key}=${envValue(entry.value)}`);
  if (mode === "local") {
    return ["# .env.local - restart the dev server after editing", ...lines].join("\n");
  }

  return lines.join("\n");
}

function sourceTone(source: EnvEntry["source"]) {
  if (source === "draft") return "warning";
  if (source === "env") return "info";
  return "default";
}

function diagnosticTone(severity: DiagnosticSeverity) {
  if (severity === "error") return "danger";
  if (severity === "warning") return "warning";
  return "success";
}

function downloadDiagnostics(report: CustomizationDiagnosticsReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `arkivel-customization-diagnostics-${report.version}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function tabButtonId(tabId: StudioTab) {
  return `customization-tab-${tabId}`;
}

function tabPanelId(tabId: StudioTab) {
  return `customization-panel-${tabId}`;
}

export default function AdminCustomizationPage() {
  const isAdmin = useAdmin();
  const tabRefs = useRef(new Map<StudioTab, HTMLButtonElement>());
  const [activeTab, setActiveTab] = useState<StudioTab>("brand");
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState<"" | "active" | "default">("");
  const [draft, setDraft] = useState<CustomizationDraft | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [manifest, setManifest] = useState<CustomizationManifest | null>(null);
  const [outputMode, setOutputMode] = useState<OutputMode>("env");
  const [savedDrafts, setSavedDrafts] = useState<SavedCustomizationDraft[]>([]);
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
          setDraft(createDraft(data));
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

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSavedDrafts(parseSavedCustomizationDrafts(window.localStorage.getItem(CUSTOMIZATION_DRAFT_STORAGE_KEY)));
      setDraftsLoaded(true);
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (!draftsLoaded) return;
    window.localStorage.setItem(CUSTOMIZATION_DRAFT_STORAGE_KEY, JSON.stringify(savedDrafts));
  }, [draftsLoaded, savedDrafts]);

  const activeDraft = useMemo(() => (manifest ? createDraft(manifest) : null), [manifest]);
  const envEntries = useMemo(() => (manifest && draft ? buildEnvEntries(manifest, draft) : []), [draft, manifest]);
  const output = useMemo(() => buildOutput(envEntries, outputMode), [envEntries, outputMode]);
  const draftDiff = useMemo(
    () => (activeDraft && draft ? createCustomizationDraftDiff(activeDraft, draft) : []),
    [activeDraft, draft],
  );
  const diagnostics = useMemo(
    () => (
      manifest && draft
        ? analyzeCustomizationDraft(draft, {
          colorThemePresets: manifest.ui.colorThemePresets,
          layoutPresets: manifest.ui.layoutPresets,
          stylePresets: manifest.ui.stylePresets,
          version: manifest.customization.version,
        })
        : null
    ),
    [draft, manifest],
  );
  const changedCount = draftDiff.length;
  const themePackValidation = useMemo(() => {
    if (!themePackJson.trim()) return { errors: ["Paste a theme pack JSON object to validate."], valid: false };
    try {
      return validateThemePack(JSON.parse(themePackJson));
    } catch {
      return { errors: ["Theme pack must be valid JSON."], valid: false };
    }
  }, [themePackJson]);
  const studioSummary = useMemo(
    () => (
      manifest && draft
        ? createCustomizationStudioSummary({
          activeTab,
          changedCount,
          diagnostics,
          draft,
          themePackValid: themePackValidation.valid,
          version: manifest.customization.version,
        })
        : "Customization Studio is loading its manifest."
    ),
    [activeTab, changedCount, diagnostics, draft, manifest, themePackValidation.valid],
  );

  function selectTab(tabId: StudioTab, focus = false) {
    setActiveTab(tabId);
    if (focus) {
      window.requestAnimationFrame(() => tabRefs.current.get(tabId)?.focus());
    }
  }

  function setTabRef(tabId: StudioTab) {
    return (node: HTMLButtonElement | null) => {
      if (node) {
        tabRefs.current.set(tabId, node);
      } else {
        tabRefs.current.delete(tabId);
      }
    };
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLElement>) {
    const nextTab = getNextCustomizationStudioTab(activeTab, event.key);
    if (nextTab === activeTab) return;
    event.preventDefault();
    selectTab(nextTab, true);
  }

  function saveDraft() {
    if (!draft) return;
    const saved = createSavedCustomizationDraft(draftName || `${draft.name} draft`, draft);
    setSavedDrafts((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 12));
    setDraftName(saved.name);
    setDraftNotice(`Saved ${saved.name} in this browser.`);
  }

  function loadDraft(saved: SavedCustomizationDraft) {
    setDraft(saved.values);
    setDraftName(saved.name);
    selectTab("drafts");
    setDraftNotice(`Loaded ${saved.name}.`);
  }

  function deleteDraft(id: string) {
    setSavedDrafts((current) => current.filter((item) => item.id !== id));
    setDraftNotice("Saved draft removed from this browser.");
  }

  function applyPreset(presetId: string) {
    if (!draft) return;
    const nextDraft = applyCustomizationDraftPreset(draft, presetId);
    const preset = CUSTOMIZATION_DRAFT_PRESETS.find((item) => item.id === presetId);
    setDraft(nextDraft);
    setDraftName(preset?.name ?? draftName);
    setDraftNotice(preset ? `Applied ${preset.name} preset.` : "Preset was not found.");
  }

  function confirmOrReset(kind: "active" | "default") {
    if (!manifest) return;
    if (confirmReset !== kind) {
      setConfirmReset(kind);
      return;
    }
    setDraft(kind === "active" ? createDraft(manifest) : DEFAULT_CUSTOMIZATION_DRAFT);
    setConfirmReset("");
    setDraftNotice(kind === "active" ? "Draft reset to the active environment values." : "Draft reset to Arkivel defaults.");
  }

  if (!isAdmin) {
    return (
      <Page width="narrow">
        <EmptyState title="Admin access required" description="Log in as an admin to preview customization settings." />
      </Page>
    );
  }

  return (
    <Page width="wide">
      <PageHeader
        title="Customization Studio"
        description="Preview self-host branding, styles, color themes, layouts, feature flags, copy, logos, and deployment config without writing database overrides."
        actions={
          manifest && draft ? (
            <Toolbar>
              <ToolbarGroup>
                <Button
                  aria-label={confirmReset === "active" ? "Confirm resetting draft to active environment values" : "Reset draft to active environment values"}
                  onClick={() => confirmOrReset("active")}
                  disabled={changedCount === 0 && confirmReset !== "active"}
                >
                  {confirmReset === "active" ? "Confirm active reset" : "Reset to active"}
                </Button>
                <Button
                  aria-label={confirmReset === "default" ? "Confirm resetting draft to Arkivel defaults" : "Reset draft to Arkivel defaults"}
                  onClick={() => confirmOrReset("default")}
                >
                  {confirmReset === "default" ? "Confirm default reset" : "Reset to defaults"}
                </Button>
              </ToolbarGroup>
            </Toolbar>
          ) : null
        }
      />

      <ScreenReaderOnly id="customization-studio-summary" aria-live="polite">
        {studioSummary}
      </ScreenReaderOnly>

      {error && <Notice className="mb-4 border-danger-border bg-danger-soft text-danger" role="alert">{error}</Notice>}
      {draftNotice && (
        <Notice className="mb-4 border-info-border bg-info-soft text-info" role="status" aria-live="polite">
          {draftNotice}
        </Notice>
      )}

      {!manifest || !draft ? (
        <p className="text-[13px] text-muted">Loading customization manifest...</p>
      ) : (
        <div className="space-y-4">
          <SectionPanel title="Current instance">
            <StatGrid>
              <StatCard label="Version" value={manifest.customization.version} />
              <StatCard label="Draft changes" value={String(changedCount)} />
              <StatCard
                label="Diagnostics"
                value={diagnostics ? `${diagnostics.counts.error} / ${diagnostics.counts.warning}` : "Pending"}
                detail="errors / warnings"
              />
              <StatCard label="Layout" value={draft.layoutId} />
            </StatGrid>
          </SectionPanel>

          <Tabs
            aria-describedby="customization-studio-summary"
            label="Customization workbench"
            onKeyDown={handleTabKeyDown}
          >
            {CUSTOMIZATION_STUDIO_TABS.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                aria-controls={tabPanelId(tab.id)}
                aria-label={`${tab.label}: ${tab.description}`}
                id={tabButtonId(tab.id)}
                onClick={() => selectTab(tab.id)}
                ref={setTabRef(tab.id)}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                {tab.label}
              </TabButton>
            ))}
          </Tabs>

          <div
            id={tabPanelId(activeTab)}
            role="tabpanel"
            aria-labelledby={tabButtonId(activeTab)}
            tabIndex={0}
          >
          {activeTab === "brand" && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <SectionPanel title="Brand and copy" bodyClassName="grid gap-3 md:grid-cols-2">
                <Field htmlFor="brand-name" label="Site name">
                  <Input id="brand-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
                </Field>
                <Field htmlFor="brand-tagline" label="Tagline">
                  <Input id="brand-tagline" value={draft.tagline} onChange={(event) => setDraft({ ...draft, tagline: event.target.value })} />
                </Field>
                <Field className="md:col-span-2" htmlFor="brand-description" label="Description">
                  <Textarea
                    id="brand-description"
                    rows={3}
                    value={draft.description}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  />
                </Field>
                <Field className="md:col-span-2" htmlFor="brand-welcome" label="Welcome text">
                  <Textarea
                    id="brand-welcome"
                    rows={4}
                    value={draft.welcomeText}
                    onChange={(event) => setDraft({ ...draft, welcomeText: event.target.value })}
                  />
                </Field>
                <Field className="md:col-span-2" htmlFor="brand-footer" label="Footer text">
                  <Input id="brand-footer" value={draft.footerText} onChange={(event) => setDraft({ ...draft, footerText: event.target.value })} />
                </Field>
              </SectionPanel>

              <SectionPanel title="Brand assets">
                <div className="space-y-3">
                  <Field htmlFor="brand-logo" label="Full logo">
                    <Input id="brand-logo" value={draft.logo} onChange={(event) => setDraft({ ...draft, logo: event.target.value })} />
                  </Field>
                  <Field htmlFor="brand-logo-mark" label="Logo mark">
                    <Input id="brand-logo-mark" value={draft.logoMark} onChange={(event) => setDraft({ ...draft, logoMark: event.target.value })} />
                  </Field>
                  <Field htmlFor="brand-app-icon" label="App icon">
                    <Input id="brand-app-icon" value={draft.appIcon} onChange={(event) => setDraft({ ...draft, appIcon: event.target.value })} />
                  </Field>
                  <BrandPreview draft={draft} />
                </div>
              </SectionPanel>
            </div>
          )}

          {activeTab === "drafts" && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-4">
                <SectionPanel
                  title="Browser-local draft"
                  actions={<Button aria-label="Save current customization draft in this browser" onClick={saveDraft} variant="primary">Save draft</Button>}
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <Field htmlFor="draft-name" label="Draft name">
                      <Input
                        id="draft-name"
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        placeholder={`${draft.name} draft`}
                      />
                    </Field>
                    <div className="flex items-end">
                      <Chip tone={changedCount > 0 ? "warning" : "success"}>
                        {changedCount > 0 ? `${changedCount} changes` : "matches active"}
                      </Chip>
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] text-muted">
                    Saved drafts stay in this browser with localStorage. They are preview-only and do not change deployment config or database state.
                  </p>
                </SectionPanel>

                <SectionPanel title="Preset starters" bodyClassName="grid gap-3 md:grid-cols-2">
                  {CUSTOMIZATION_DRAFT_PRESETS.map((preset) => (
                    <div key={preset.id} className="border border-border bg-surface p-3">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-heading">{preset.name}</p>
                        <Button aria-label={`Apply ${preset.name} customization preset`} onClick={() => applyPreset(preset.id)}>Apply</Button>
                      </div>
                      <p className="text-[12px] text-muted">{preset.description}</p>
                      <InlineCode className="mt-2 inline-block">{preset.id}</InlineCode>
                    </div>
                  ))}
                </SectionPanel>

                <SectionPanel title="Active vs draft diff">
                  {draftDiff.length === 0 ? (
                    <EmptyState title="No draft changes" description="The current preview matches the active environment-derived configuration." />
                  ) : (
                    <DataTable aria-label="Active environment values compared with draft values">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Active</th>
                          <th>Draft</th>
                        </tr>
                      </thead>
                      <tbody>
                        {draftDiff.map((row) => (
                          <tr key={row.field}>
                            <th>{row.label}</th>
                            <td>{row.activeValue}</td>
                            <td>{row.draftValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </DataTable>
                  )}
                </SectionPanel>
              </div>

              <SectionPanel title="Saved drafts">
                {savedDrafts.length === 0 ? (
                  <EmptyState title="No saved drafts" description="Save a draft or apply a preset to start building a reusable self-host setup." />
                ) : (
                  <div className="space-y-2">
                    {savedDrafts.map((saved) => (
                      <div key={saved.id} className="border border-border bg-surface p-3">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-heading">{saved.name}</p>
                          <Chip>{new Date(saved.updatedAt).toLocaleDateString()}</Chip>
                        </div>
                        <p className="text-[12px] text-muted">
                          {saved.values.styleId} / {saved.values.colorThemeId} / {saved.values.layoutId}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button aria-label={`Load saved draft ${saved.name}`} onClick={() => loadDraft(saved)}>Load</Button>
                          <Button aria-label={`Delete saved draft ${saved.name}`} onClick={() => deleteDraft(saved.id)}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionPanel>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-4">
              <SectionPanel title="Preview configuration" bodyClassName="grid gap-3 md:grid-cols-3">
                <Field htmlFor="preview-style" label="Style">
                  <Select
                    id="preview-style"
                    value={draft.styleId}
                    onChange={(event) => setDraft({ ...draft, styleId: event.target.value })}
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
                    onChange={(event) => setDraft({ ...draft, colorThemeId: event.target.value })}
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
                    onChange={(event) => setDraft({ ...draft, layoutId: event.target.value })}
                  >
                    {manifest.ui.layoutPresets.map((preset) => (
                      <option key={preset.id} value={preset.envValue}>{preset.name}</option>
                    ))}
                  </Select>
                </Field>
              </SectionPanel>

              <PresetGrid title="Style presets" items={manifest.ui.stylePresets.map((preset) => ({
                code: preset.id,
                description: preset.description,
                title: preset.name,
              }))} />
              <PresetGrid title="Color themes" columns="md:grid-cols-3" items={manifest.ui.colorThemePresets.map((preset) => ({
                code: preset.id,
                description: preset.description,
                title: preset.name,
              }))} />
              <PresetGrid title="Layout presets" items={manifest.ui.layoutPresets.map((preset) => ({
                code: preset.envValue,
                description: preset.description,
                meta: preset.status,
                title: preset.name,
              }))} />
            </div>
          )}

          {activeTab === "features" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <SectionPanel title="Feature flags" bodyClassName="grid gap-3">
                <Field htmlFor="feature-registration" label="Public registration">
                  <Select
                    id="feature-registration"
                    value={String(draft.registrationEnabled)}
                    onChange={(event) => setDraft({ ...draft, registrationEnabled: event.target.value === "true" })}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </Select>
                </Field>
                <Field htmlFor="feature-discussions" label="Discussions">
                  <Select
                    id="feature-discussions"
                    value={String(draft.discussionsEnabled)}
                    onChange={(event) => setDraft({ ...draft, discussionsEnabled: event.target.value === "true" })}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </Select>
                </Field>
                <Field htmlFor="feature-map" label="Map route">
                  <Select
                    id="feature-map"
                    value={String(draft.mapEnabled)}
                    onChange={(event) => setDraft({ ...draft, mapEnabled: event.target.value === "true" })}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </Select>
                </Field>
              </SectionPanel>

              <SectionPanel title="Integration basics">
                <Field htmlFor="base-url" label="Canonical base URL">
                  <Input id="base-url" value={draft.baseUrl} onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })} />
                </Field>
                <Notice className="mt-3 border-info-border bg-info-soft text-info">
                  These values still compile from environment variables in v1. The studio previews and exports the values but does not persist database overrides.
                </Notice>
              </SectionPanel>
            </div>
          )}

          {activeTab === "diagnostics" && diagnostics && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <SectionPanel
                title="Deployment diagnostics"
                actions={<Button aria-label="Download customization diagnostics JSON" onClick={() => downloadDiagnostics(diagnostics)}>Download JSON</Button>}
              >
                <StatGrid className="mb-3">
                  <StatCard label="Passed" value={String(diagnostics.counts.pass)} />
                  <StatCard label="Warnings" value={String(diagnostics.counts.warning)} />
                  <StatCard label="Errors" value={String(diagnostics.counts.error)} />
                </StatGrid>
                <div className="space-y-2">
                  {diagnostics.diagnostics.map((diagnostic) => (
                    <div key={diagnostic.id} className="border border-border bg-surface p-3">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-heading">{diagnostic.title}</p>
                        <Chip tone={diagnosticTone(diagnostic.severity)}>{diagnostic.severity}</Chip>
                      </div>
                      <p className="text-[12px] text-muted">{diagnostic.detail}</p>
                      <InlineCode className="mt-2 inline-block">{diagnostic.id}</InlineCode>
                    </div>
                  ))}
                </div>
              </SectionPanel>

              <SectionPanel title="What diagnostics cover">
                <ul className="list-disc space-y-2 pl-5 text-[13px] text-muted">
                  <li>Required brand copy and empty identity fields.</li>
                  <li>Logo, mark, and app icon paths before deployment.</li>
                  <li>Canonical base URL shape for metadata, feeds, and share links.</li>
                  <li>Registered style, color theme, and layout compatibility.</li>
                  <li>Manual review prompts for alternate palettes, dark theme contrast, oversized brand assets, responsive previews, and map imagery.</li>
                </ul>
                <Notice className="mt-3 border-info-border bg-info-soft text-info">
                  Diagnostics are advisory and preview-safe. They do not fetch remote assets, execute packs, or write deployment settings.
                </Notice>
              </SectionPanel>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-4">
              <SectionPanel title="Live preview panels" bodyClassName="grid gap-3 lg:grid-cols-2">
                <PreviewFrame title="Homepage" draft={draft}>
                  <p className="text-[18px] font-semibold text-heading">{draft.name}</p>
                  <p className="mt-1 text-[13px] text-muted">{draft.welcomeText}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <PreviewTile label="Articles" value="Browse" />
                    <PreviewTile label="Studio" value="Plan" />
                    <PreviewTile label="Search" value="Find" />
                  </div>
                </PreviewFrame>
                <PreviewFrame title="Article reader" draft={draft}>
                  <p className="text-[18px] font-semibold text-heading">Example Article</p>
                  <p className="mt-1 text-[13px] text-muted">A preview of article chrome, metadata, and reading rhythm.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip>published</Chip>
                    <Chip tone="info">{draft.layoutId}</Chip>
                    <Chip tone="success">{draft.colorThemeId}</Chip>
                  </div>
                </PreviewFrame>
                <PreviewFrame title="Editor" draft={draft}>
                  <div className="border border-border bg-background p-3">
                    <p className="text-[12px] font-semibold text-heading">Insert / Review / Outline</p>
                    <p className="mt-2 text-[13px] text-muted">Reusable editor controls will inherit the selected style and space pack.</p>
                  </div>
                </PreviewFrame>
                <PreviewFrame title="Dashboard" draft={draft}>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <PreviewTile label="Health" value="92%" />
                    <PreviewTile label="Drafts" value="8" />
                    <PreviewTile label="Reviews" value="3" />
                  </div>
                </PreviewFrame>
                <PreviewFrame title="Marketplace" draft={draft}>
                  <p className="text-[13px] text-muted">Catalog cards reflect style, color theme, and layout selections before install.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip tone="info">style</Chip>
                    <Chip tone="warning">component-pack</Chip>
                    <Chip>plugin</Chip>
                  </div>
                </PreviewFrame>
                <PreviewFrame title="Mobile shell" draft={draft}>
                  <div className="mx-auto max-w-[220px] border border-border bg-background p-3">
                    <p className="text-[12px] font-semibold text-heading">{draft.name}</p>
                    <p className="mt-1 text-[11px] text-muted">{draft.tagline}</p>
                    <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px] text-muted">
                      <span>Home</span><span>Search</span><span>Create</span><span>Menu</span>
                    </div>
                  </div>
                </PreviewFrame>
              </SectionPanel>

              <SectionPanel title="Responsive QA checklist" bodyClassName="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {CUSTOMIZATION_STUDIO_VIEWPORTS.map((viewport) => (
                  <div key={viewport.id} className="border border-border bg-surface p-3">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-heading">{viewport.label}</p>
                      <Chip tone="info">{viewport.width}</Chip>
                    </div>
                    <p className="text-[12px] text-muted">{viewport.description}</p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-muted">
                      {viewport.checks.map((check) => (
                        <li key={check}>{check}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </SectionPanel>
            </div>
          )}

          {activeTab === "output" && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
              <SectionPanel
                title="Deployment output"
                actions={
                  <Button
                    aria-label={copied ? "Deployment output copied" : "Copy deployment output to clipboard"}
                    onClick={async () => {
                      await navigator.clipboard.writeText(output);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    }}
                    variant="primary"
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                }
              >
                <Toolbar className="mb-3">
                  <ToolbarGroup label="Format">
                    {outputModes.map((mode) => (
                      <Button
                        key={mode.id}
                        aria-pressed={outputMode === mode.id}
                        aria-label={`Show deployment output as ${mode.label}`}
                        onClick={() => setOutputMode(mode.id)}
                        variant={outputMode === mode.id ? "primary" : "default"}
                      >
                        {mode.label}
                      </Button>
                    ))}
                  </ToolbarGroup>
                </Toolbar>
                <CodeBlock>{output}</CodeBlock>
                <p className="mt-2 text-[12px] text-muted">
                  Change these values in deployment config, then rebuild or redeploy. This studio does not write runtime overrides in v1.
                </p>
              </SectionPanel>

              <SectionPanel title="Config source map">
                <DataTable aria-label="Environment variable source map">
                  <tbody>
                    {envEntries.map((entry) => (
                      <tr key={entry.key}>
                        <th><InlineCode>{entry.key}</InlineCode></th>
                        <td><Chip tone={sourceTone(entry.source)}>{entry.source}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </SectionPanel>
            </div>
          )}

          {activeTab === "packs" && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
              <SectionPanel title="Theme pack validator">
                <Textarea
                  aria-label="Theme pack JSON"
                  className="font-mono"
                  rows={16}
                  value={themePackJson}
                  onChange={(event) => setThemePackJson(event.target.value)}
                />
                <Notice
                  aria-live="polite"
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

              <SectionPanel title="Theme pack schema">
                <CodeBlock>{JSON.stringify(manifest.ui.themePackSchema, null, 2)}</CodeBlock>
              </SectionPanel>
            </div>
          )}
          </div>
        </div>
      )}
    </Page>
  );
}

function BrandPreview({ draft }: { draft: CustomizationDraft }) {
  return (
    <div className="border border-border bg-background p-3" role="region" aria-label="Brand asset preview">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-10 w-10 shrink-0 border border-border bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${draft.logoMark || draft.logo}")` }}
        />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-heading">{draft.name}</p>
          <p className="truncate text-[12px] text-muted">{draft.tagline}</p>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted">{draft.description}</p>
    </div>
  );
}

function PresetGrid({
  columns = "md:grid-cols-2",
  items,
  title,
}: {
  columns?: string;
  items: { code: string; description: string; meta?: string; title: string }[];
  title: string;
}) {
  return (
    <SectionPanel title={title} bodyClassName={`grid gap-3 ${columns}`}>
      {items.map((item) => (
        <div key={item.code} className="border border-border bg-surface p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-heading">{item.title}</span>
            {item.meta && <Chip>{item.meta}</Chip>}
          </div>
          <InlineCode>{item.code}</InlineCode>
          <p className="mt-2 text-[12px] text-muted">{item.description}</p>
        </div>
      ))}
    </SectionPanel>
  );
}

function PreviewFrame({ children, draft, title }: { children: ReactNode; draft: CustomizationDraft; title: string }) {
  return (
    <div
      aria-label={`${title} preview`}
      className="border border-border bg-surface p-4"
      data-color-theme={draft.colorThemeId}
      data-layout={draft.layoutId}
      data-style={draft.styleId}
      role="region"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase text-muted">{title}</p>
        <Chip tone="info">{draft.styleId}</Chip>
      </div>
      {children}
    </div>
  );
}

function PreviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-2">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-heading">{value}</p>
    </div>
  );
}
