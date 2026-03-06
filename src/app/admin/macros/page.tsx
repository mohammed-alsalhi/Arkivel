"use client";

import { useState, useEffect } from "react";

type Macro = {
  id: string;
  name: string;
  description: string | null;
  template: string;
  updatedAt: string;
};

const DEFAULT_TEMPLATES: Record<string, { description: string; template: string }> = {
  warning: {
    description: "Yellow warning box",
    template: `<div class="macro-warning" style="border-left:4px solid #d97706;background:#fef9c3;padding:0.5rem 0.75rem;margin:0.75rem 0;font-size:13px;"><strong>Warning:</strong> {{{body}}}</div>`,
  },
  note: {
    description: "Blue info box",
    template: `<div class="macro-note" style="border-left:4px solid #3b82f6;background:#eff6ff;padding:0.5rem 0.75rem;margin:0.75rem 0;font-size:13px;"><strong>Note:</strong> {{{body}}}</div>`,
  },
  tip: {
    description: "Green tip box",
    template: `<div class="macro-tip" style="border-left:4px solid #22c55e;background:#f0fdf4;padding:0.5rem 0.75rem;margin:0.75rem 0;font-size:13px;"><strong>Tip:</strong> {{{body}}}</div>`,
  },
};

export default function MacrosPage() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Macro | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", template: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/macros");
    const data = await res.json();
    if (Array.isArray(data)) setMacros(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate(preset?: string) {
    const p = preset ? DEFAULT_TEMPLATES[preset] : null;
    setForm({ name: preset ?? "", description: p?.description ?? "", template: p?.template ?? "" });
    setEditing(null);
    setCreating(true);
    setError("");
  }

  function startEdit(m: Macro) {
    setForm({ name: m.name, description: m.description ?? "", template: m.template });
    setEditing(m);
    setCreating(false);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    const url = editing ? `/api/macros/${editing.id}` : "/api/macros";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save");
      return;
    }
    setEditing(null);
    setCreating(false);
    load();
  }

  async function deleteMacro(id: string, name: string) {
    if (!confirm(`Delete macro "{{${name}}}"?`)) return;
    await fetch(`/api/macros/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Macros / Shortcodes
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Define reusable shortcodes that authors can embed in articles using{" "}
        <code className="bg-surface-hover px-1 rounded text-[12px]">{"{{macroName|arg1}}"}</code>{" "}
        syntax. Template variables: <code className="bg-surface-hover px-1 rounded text-[12px]">{"{{{body}}}"}</code>{" "}
        (first arg), <code className="bg-surface-hover px-1 rounded text-[12px]">{"{{{1}}}"}</code>,{" "}
        <code className="bg-surface-hover px-1 rounded text-[12px]">{"{{{2}}}"}</code>, etc.
      </p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => startCreate()}
          className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover"
        >
          + New macro
        </button>
        <span className="text-[11px] text-muted">Quick-add preset:</span>
        {Object.keys(DEFAULT_TEMPLATES).map((k) => (
          <button
            key={k}
            onClick={() => startCreate(k)}
            className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover"
          >
            {k}
          </button>
        ))}
      </div>

      {/* Form */}
      {(creating || editing) && (
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">{editing ? `Edit macro: ${editing.name}` : "New macro"}</div>
          <div className="wiki-portal-body space-y-2">
            {!editing && (
              <div>
                <label className="block text-[11px] text-muted font-bold mb-0.5">Name (no spaces)</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  className="w-full border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none"
                  placeholder="e.g. warning"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] text-muted font-bold mb-0.5">Description (optional)</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none"
                placeholder="Brief description"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-bold mb-0.5">HTML template</label>
              <textarea
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
                rows={5}
                className="w-full border border-border bg-surface px-2 py-1 text-[11px] font-mono focus:border-accent focus:outline-none"
                placeholder={`<div class="...">{{{body}}}</div>`}
              />
            </div>
            {form.template && (
              <div>
                <p className="text-[11px] text-muted font-bold mb-0.5">Preview (with sample arg)</p>
                <div
                  className="border border-border bg-surface p-2 text-[13px]"
                  dangerouslySetInnerHTML={{
                    __html: form.template
                      .replace(/\{\{\{body\}\}\}/g, "Sample argument")
                      .replace(/\{\{\{1\}\}\}/g, "Sample argument")
                      .replace(/\{\{\{\d+\}\}\}/g, ""),
                  }}
                />
              </div>
            )}
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
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

      {/* Macro list */}
      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : macros.length === 0 ? (
        <div className="wiki-notice">No macros defined yet. Add one above.</div>
      ) : (
        <table className="w-full border-collapse border border-border bg-surface text-[13px]">
          <thead>
            <tr className="bg-surface-hover">
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Shortcode</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Description</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {macros.map((m) => (
              <tr key={m.id} className="hover:bg-surface-hover">
                <td className="border border-border px-3 py-1.5">
                  <code className="text-[12px] bg-surface-hover px-1 rounded">{`{{${m.name}|…}}`}</code>
                </td>
                <td className="border border-border px-3 py-1.5 text-muted text-[12px]">
                  {m.description || <span className="italic">—</span>}
                </td>
                <td className="border border-border px-3 py-1.5">
                  <span className="flex gap-1">
                    <button
                      onClick={() => startEdit(m)}
                      className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMacro(m.id, m.name)}
                      className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover text-red-600"
                    >
                      Delete
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
