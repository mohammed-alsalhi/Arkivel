"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
  slug: string;
  _count?: { articles: number };
};

type OptionItem = { envValue?: string; id: string; name: string; recommendedLayout?: string };
type CustomizationManifest = {
  colorThemePresets: OptionItem[];
  componentPacks: OptionItem[];
  customization: { features: { discussionsEnabled: boolean }; map: { enabled: boolean }; version: string };
  layoutPresets: OptionItem[];
  spaceCustomization?: { navigationModes: string[] };
  stylePresets: OptionItem[];
};

type PublicSpaceCustomization = {
  colorThemeId: string | null;
  componentPackId: string | null;
  inheritedFrom?: string | null;
  layoutId: string | null;
  metadataSchemaId: string | null;
  navigationMode: string | null;
  source: "global" | "parent-space" | "space" | "article";
  styleId: string | null;
  templatePackId: string | null;
};

type ResolvedCustomization = {
  chain: PublicSpaceCustomization[];
  effective: PublicSpaceCustomization;
  privateDraftConfigHidden: boolean;
  sources: Record<string, string>;
};

const fields = [
  { key: "styleId", label: "Style" },
  { key: "colorThemeId", label: "Color theme" },
  { key: "layoutId", label: "Layout" },
  { key: "componentPackId", label: "Component pack" },
  { key: "templatePackId", label: "Template pack" },
  { key: "navigationMode", label: "Navigation" },
  { key: "metadataSchemaId", label: "Metadata schema" },
] as const;

type FieldKey = (typeof fields)[number]["key"];
type FormState = Record<FieldKey, string>;

const emptyForm: FormState = {
  colorThemeId: "",
  componentPackId: "",
  layoutId: "",
  metadataSchemaId: "",
  navigationMode: "",
  styleId: "",
  templatePackId: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [manifest, setManifest] = useState<CustomizationManifest | null>(null);
  const [resolved, setResolved] = useState<ResolvedCustomization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [merging, setMerging] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? null;
  const explicitCount = fields.filter((field) => form[field.key]).length;
  const parentName = selectedCategory?.parentId
    ? categories.find((category) => category.id === selectedCategory.parentId)?.name ?? "parent space"
    : "global defaults";
  const selectedPack = manifest?.componentPacks.find((pack) => pack.id === form.componentPackId);
  const warnings = useMemo(() => {
    const next: string[] = [];
    if (form.navigationMode === "atlas-map" && manifest && !manifest.customization.map.enabled) {
      next.push("Atlas map navigation is selected while the global map feature is disabled.");
    }
    if (selectedPack?.recommendedLayout && form.layoutId && selectedPack.recommendedLayout !== form.layoutId) {
      next.push(`The selected component pack recommends the ${selectedPack.recommendedLayout} layout.`);
    }
    if (form.metadataSchemaId && form.metadataSchemaId.length < 3) {
      next.push("Metadata schema ids should be stable and descriptive enough for future template reuse.");
    }
    return next;
  }, [form, manifest, selectedPack]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((response) => response.json()),
      fetch("/api/customization").then((response) => response.json()),
    ])
      .then(([categoryData, manifestData]) => {
        const nextCategories = Array.isArray(categoryData) ? flattenCategories(categoryData) : [];
        setCategories(nextCategories);
        setManifest(manifestData);
        setSelectedCategoryId(nextCategories[0]?.id ?? "");
      })
      .catch(() => {
        setCategories([]);
        setManifest(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      return;
    }

    fetch(`/api/categories/${selectedCategoryId}/customization`)
      .then((response) => response.json())
      .then((data: ResolvedCustomization) => {
        setResolved(data);
        const explicit = data.chain.findLast((item) => item.source === "space") ?? null;
        setForm({
          colorThemeId: explicit?.colorThemeId ?? "",
          componentPackId: explicit?.componentPackId ?? "",
          layoutId: explicit?.layoutId ?? "",
          metadataSchemaId: explicit?.metadataSchemaId ?? "",
          navigationMode: explicit?.navigationMode ?? "",
          styleId: explicit?.styleId ?? "",
          templatePackId: explicit?.templatePackId ?? "",
        });
      })
      .catch(() => {
        setResolved(null);
        setForm(emptyForm);
      })
  }, [selectedCategoryId]);

  async function handleMerge(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setError(null);
    if (!sourceId || !targetId) return;

    const source = categories.find((category) => category.id === sourceId);
    const target = categories.find((category) => category.id === targetId);
    if (
      !confirm(
        `Merge "${source?.name}" into "${target?.name}"?\n\nAll articles and sub-categories from "${source?.name}" will be reassigned to "${target?.name}", and "${source?.name}" will be permanently deleted.`
      )
    )
      return;

    setMerging(true);
    try {
      const res = await fetch("/api/admin/categories/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, targetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Merge failed");
      } else {
        setResult(
          `Merged "${data.sourceName}" into "${data.targetName}" -- ${data.articlesReassigned} article(s) reassigned.`
        );
        setSourceId("");
        setTargetId("");
        const updated = await fetch("/api/categories").then((response) => response.json());
        setCategories(Array.isArray(updated) ? flattenCategories(updated) : []);
      }
    } catch {
      setError("Merge failed. Please try again.");
    } finally {
      setMerging(false);
    }
  }

  async function saveCustomization(nextForm = form) {
    if (!selectedCategoryId) return;

    setSaving(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch(`/api/categories/${selectedCategoryId}/customization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(nextForm)),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.issues?.join(" ") ?? data.error ?? "Customization save failed");
      } else {
        setResult(`Saved customization overrides for "${selectedCategory?.name ?? "space"}".`);
        const refreshed = await fetch(`/api/categories/${selectedCategoryId}/customization`).then((r) => r.json());
        setResolved(refreshed);
      }
    } catch {
      setError("Customization save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: FieldKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetToParent() {
    setForm(emptyForm);
    saveCustomization(emptyForm);
  }

  function resetToGlobal() {
    const global = resolved?.chain[0] ?? null;
    const globalForm = global
      ? {
          colorThemeId: global.colorThemeId ?? "",
          componentPackId: global.componentPackId ?? "",
          layoutId: global.layoutId ?? "",
          metadataSchemaId: global.metadataSchemaId ?? "",
          navigationMode: global.navigationMode ?? "",
          styleId: global.styleId ?? "",
          templatePackId: global.templatePackId ?? "",
        }
      : emptyForm;

    setForm(globalForm);
    saveCustomization(globalForm);
  }

  return (
    <div className="space-y-8">
      <section>
        <h1
          className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Space Customization
        </h1>

        {loading ? (
          <p className="text-[13px] text-muted italic">Loading categories...</p>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(260px,360px)_1fr]">
            <div className="border border-border bg-surface p-4">
              <label className="block text-[12px] text-muted mb-1">Category space</label>
              <select
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
                className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="mt-4 text-[12px] text-muted">
                {explicitCount === 0 ? (
                  <p>All fields inherit from {parentName}.</p>
                ) : (
                  <p>{explicitCount} explicit override(s) saved or ready to save for this space.</p>
                )}
                {resolved?.privateDraftConfigHidden && (
                  <p className="mt-2">Private draft config is hidden from public customization reads.</p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetToParent}
                  disabled={saving || !selectedCategoryId}
                  className="h-7 px-3 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-40"
                >
                  Reset to parent
                </button>
                <button
                  type="button"
                  onClick={resetToGlobal}
                  disabled={saving || !selectedCategoryId}
                  className="h-7 px-3 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover disabled:opacity-40"
                >
                  Reset to global
                </button>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveCustomization();
              }}
              className="border border-border bg-surface p-4"
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <SelectField
                  label="Style"
                  value={form.styleId}
                  onChange={(value) => updateField("styleId", value)}
                  options={manifest?.stylePresets ?? []}
                />
                <SelectField
                  label="Color theme"
                  value={form.colorThemeId}
                  onChange={(value) => updateField("colorThemeId", value)}
                  options={manifest?.colorThemePresets ?? []}
                />
                <SelectField
                  label="Layout"
                  value={form.layoutId}
                  onChange={(value) => updateField("layoutId", value)}
                  options={(manifest?.layoutPresets ?? []).map((layout) => ({
                    ...layout,
                    id: layout.envValue ?? layout.id,
                  }))}
                />
                <SelectField
                  label="Component pack"
                  value={form.componentPackId}
                  onChange={(value) => updateField("componentPackId", value)}
                  options={manifest?.componentPacks ?? []}
                />
                <TextField
                  label="Template pack"
                  value={form.templatePackId}
                  onChange={(value) => updateField("templatePackId", value)}
                  placeholder="docs-template-pack"
                />
                <SelectField
                  label="Navigation"
                  value={form.navigationMode}
                  onChange={(value) => updateField("navigationMode", value)}
                  options={(manifest?.spaceCustomization?.navigationModes ?? []).map((mode) => ({ id: mode, name: mode }))}
                />
                <TextField
                  label="Metadata schema"
                  value={form.metadataSchemaId}
                  onChange={(value) => updateField("metadataSchemaId", value)}
                  placeholder="docs.article"
                />
              </div>

              {warnings.length > 0 && (
                <div className="mt-4 border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                  {warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={saving || !selectedCategoryId}
                  className="h-7 px-3 text-[11px] border border-accent rounded bg-accent/10 text-accent hover:bg-accent/15 disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Save overrides"}
                </button>
                <span className="text-[12px] text-muted">
                  Blank fields inherit from {parentName}; filled fields become explicit overrides.
                </span>
              </div>
            </form>
          </div>
        )}

        {resolved && (
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="border border-border bg-surface p-4">
              <div className="wiki-portal-header mb-3">Inherited Preview</div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {fields.map((field) => (
                  <div key={field.key} className="border border-border-light bg-background p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase text-muted">{field.label}</span>
                      <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
                        {resolved.sources[field.key] ?? "global"}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-[13px] text-foreground">
                      {resolved.effective[field.key] || "Inherited default"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border bg-surface p-4">
              <div className="wiki-portal-header mb-3">Responsive QA</div>
              <ul className="space-y-2 text-[12px] text-muted">
                <li><strong className="text-foreground">Phone:</strong> navigation collapses cleanly and article cards keep category/status text readable.</li>
                <li><strong className="text-foreground">Tablet:</strong> metadata schema and right-rail content stack without overlapping article summaries.</li>
                <li><strong className="text-foreground">Desktop:</strong> layout, theme, and component pack previews preserve scan-friendly category lists.</li>
              </ul>
            </div>
          </div>
        )}

        {resolved && selectedCategory && (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <PreviewPanel title="Article List">
              <p>{selectedCategory._count?.articles ?? 0} article(s) will render with the effective layout and component pack.</p>
              <p>Article cards inherit the {resolved.effective.componentPackId ?? "default"} component pack.</p>
            </PreviewPanel>
            <PreviewPanel title="Metadata & Navigation">
              <p>Metadata schema: {resolved.effective.metadataSchemaId ?? "global default"}</p>
              <p>Navigation mode: {resolved.effective.navigationMode ?? "global default"}</p>
            </PreviewPanel>
            <PreviewPanel title="Theme & Layout">
              <p>Style: {resolved.effective.styleId ?? "global default"}</p>
              <p>Color: {resolved.effective.colorThemeId ?? "global default"}</p>
              <p>Layout: {resolved.effective.layoutId ?? "global default"}</p>
            </PreviewPanel>
          </div>
        )}
      </section>

      <section>
        <h2
          className="text-[1.2rem] font-normal text-heading border-b border-border pb-1 mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Category Merge
        </h2>

        <div className="wiki-notice mb-4">
          Merging moves all articles and sub-categories from the source into the target, then permanently deletes the
          source category. This cannot be undone.
        </div>

        {loading ? (
          <p className="text-[13px] text-muted italic">Loading categories...</p>
        ) : (
          <form onSubmit={handleMerge} className="max-w-md space-y-4">
            <div>
              <label className="block text-[12px] text-muted mb-1">
                Source category <span className="text-red-500">(will be deleted)</span>
              </label>
              <select
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
                required
                className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none"
              >
                <option value="">Select source...</option>
                {categories
                  .filter((category) => category.id !== targetId)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] text-muted mb-1">
                Target category <span className="text-green-600">(articles merged into this)</span>
              </label>
              <select
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
                required
                className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none"
              >
                <option value="">Select target...</option>
                {categories
                  .filter((category) => category.id !== sourceId)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={merging || !sourceId || !targetId}
              className="h-6 px-3 text-[11px] border border-red-400 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40"
            >
              {merging ? "Merging..." : "Merge categories"}
            </button>
          </form>
        )}
      </section>

      {result && (
        <p className="text-[13px] text-green-700 border border-green-200 bg-green-50 px-3 py-2 rounded">{result}</p>
      )}
      {error && (
        <p className="text-[13px] text-red-700 border border-red-200 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] text-muted mb-1">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none"
      >
        <option value="">Inherit</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] text-muted mb-1">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function PreviewPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="wiki-portal-header mb-2">{title}</div>
      <div className="space-y-1 text-[12px] text-muted">{children}</div>
    </div>
  );
}

function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];
  const visit = (category: Category) => {
    result.push(category);
    const children = (category as Category & { children?: Category[] }).children ?? [];
    children.forEach(visit);
  };

  categories.forEach(visit);
  return Array.from(new Map(result.map((category) => [category.id, category])).values());
}

function toPayload(form: FormState) {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, value.trim() || null]),
  );
}
