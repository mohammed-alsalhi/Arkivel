"use client";

import { useState, useEffect } from "react";

type FieldType = "text" | "number" | "date" | "boolean" | "select";

type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  options?: string; // comma-separated for select type
  required?: boolean;
};

type Schema = {
  id: string;
  categoryId: string;
  fields: FieldDef[];
  category: { id: string; name: string; slug: string };
};

type Category = { id: string; name: string; slug: string };

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes/No" },
  { value: "select", label: "Select (dropdown)" },
];

function emptyField(): FieldDef {
  return { name: "", label: "", type: "text", options: "", required: false };
}

export default function MetadataSchemasPage() {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Schema | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([emptyField()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [sRes, cRes] = await Promise.all([fetch("/api/metadata-schemas"), fetch("/api/categories")]);
    const [sData, cData] = await Promise.all([sRes.json(), cRes.json()]);
    if (Array.isArray(sData)) setSchemas(sData);
    if (Array.isArray(cData)) setCategories(cData);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing(null);
    setCreating(true);
    setSelectedCategory("");
    setFields([emptyField()]);
    setError("");
  }

  function startEdit(s: Schema) {
    setEditing(s);
    setCreating(false);
    setSelectedCategory(s.categoryId);
    setFields(s.fields.length > 0 ? s.fields : [emptyField()]);
    setError("");
  }

  function updateField(i: number, patch: Partial<FieldDef>) {
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function addField() {
    setFields((prev) => [...prev, emptyField()]);
  }

  function removeField(i: number) {
    setFields((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setError("");
    const catId = editing?.categoryId ?? selectedCategory;
    if (!catId) { setError("Select a category"); return; }
    const validFields = fields.filter((f) => f.name.trim() && f.label.trim());
    if (validFields.length === 0) { setError("Add at least one field with name and label"); return; }

    setSaving(true);
    const res = await fetch("/api/metadata-schemas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: catId, fields: validFields }),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save"); return; }
    setEditing(null);
    setCreating(false);
    load();
  }

  const usedCategoryIds = new Set(schemas.map((s) => s.categoryId));
  const availableCategories = categories.filter((c) => !usedCategoryIds.has(c.id));

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Custom metadata schemas
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Define typed metadata fields per category. These appear in the article editor when an article belongs to that category, and values are stored in the article&apos;s metadata object.
      </p>

      <button
        onClick={startCreate}
        className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover mb-4"
      >
        + New schema
      </button>

      {/* Form */}
      {(creating || editing) && (
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">
            {editing ? `Edit schema: ${editing.category.name}` : "New schema"}
          </div>
          <div className="wiki-portal-body space-y-3">
            {!editing && (
              <div>
                <label className="block text-[11px] text-muted font-bold mb-0.5">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none"
                >
                  <option value="">— Select category —</option>
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-muted font-bold">Fields</span>
                <button
                  onClick={addField}
                  className="h-5 px-2 text-[10px] border border-border rounded hover:bg-surface-hover"
                >
                  + Add field
                </button>
              </div>
              <div className="space-y-2">
                {fields.map((f, i) => (
                  <div key={i} className="flex gap-2 items-start border border-border p-2 bg-surface">
                    <div className="flex-1 space-y-1">
                      <div className="flex gap-2">
                        <input
                          value={f.name}
                          onChange={(e) => updateField(i, { name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                          placeholder="field_name"
                          className="flex-1 border border-border bg-surface px-2 py-0.5 text-[11px] font-mono focus:border-accent focus:outline-none"
                        />
                        <input
                          value={f.label}
                          onChange={(e) => updateField(i, { label: e.target.value })}
                          placeholder="Display label"
                          className="flex-1 border border-border bg-surface px-2 py-0.5 text-[11px] focus:border-accent focus:outline-none"
                        />
                        <select
                          value={f.type}
                          onChange={(e) => updateField(i, { type: e.target.value as FieldType })}
                          className="border border-border bg-surface px-1 py-0.5 text-[11px] focus:border-accent focus:outline-none"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      {f.type === "select" && (
                        <input
                          value={f.options ?? ""}
                          onChange={(e) => updateField(i, { options: e.target.value })}
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full border border-border bg-surface px-2 py-0.5 text-[11px] focus:border-accent focus:outline-none"
                        />
                      )}
                      <label className="flex items-center gap-1 text-[11px] text-muted">
                        <input
                          type="checkbox"
                          checked={f.required ?? false}
                          onChange={(e) => updateField(i, { required: e.target.checked })}
                        />
                        Required
                      </label>
                    </div>
                    <button
                      onClick={() => removeField(i)}
                      className="text-[11px] text-red-500 hover:underline mt-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save schema"}
              </button>
              <button
                onClick={() => { setEditing(null); setCreating(false); }}
                className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema list */}
      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : schemas.length === 0 ? (
        <div className="wiki-notice">No metadata schemas defined yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border bg-surface text-[13px]">
            <thead>
              <tr className="bg-surface-hover">
                <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Category</th>
                <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Fields</th>
                <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schemas.map((s) => (
                <tr key={s.id} className="hover:bg-surface-hover">
                  <td className="border border-border px-3 py-1.5 font-medium">{s.category.name}</td>
                  <td className="border border-border px-3 py-1.5 text-muted text-[12px]">
                    {(s.fields as FieldDef[]).map((f) => `${f.label} (${f.type})`).join(", ") || "—"}
                  </td>
                  <td className="border border-border px-3 py-1.5">
                    <button
                      onClick={() => startEdit(s)}
                      className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
