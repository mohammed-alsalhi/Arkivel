"use client";

import { useState, useEffect } from "react";

type Term = { id: string; term: string; definition: string; aliases: string[] };

export default function AdminGlossaryPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [aliases, setAliases] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/glossary");
    if (res.ok) setTerms(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    setSaving(true);
    const aliasArr = aliases.split(",").map((a) => a.trim()).filter(Boolean);
    const url = editId ? `/api/glossary/${editId}` : "/api/glossary";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, definition, aliases: aliasArr }),
    });
    if (res.ok) {
      setTerm(""); setDefinition(""); setAliases(""); setEditId(null);
      await load();
    }
    setSaving(false);
  }

  function startEdit(t: Term) {
    setEditId(t.id);
    setTerm(t.term);
    setDefinition(t.definition);
    setAliases(t.aliases.join(", "));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this term?")) return;
    await fetch(`/api/glossary/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        Glossary Management
      </h1>

      <form onSubmit={handleSave} className="wiki-portal mb-6">
        <div className="wiki-portal-header">{editId ? "Edit term" : "New term"}</div>
        <div className="wiki-portal-body space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-muted mb-1">Term</label>
              <input value={term} onChange={(e) => setTerm(e.target.value)} required
                className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Aliases (comma-separated)</label>
              <input value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="e.g. JS, ECMAScript"
                className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-muted mb-1">Definition</label>
            <textarea value={definition} onChange={(e) => setDefinition(e.target.value)} required rows={2}
              className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="h-6 px-3 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-40">
              {saving ? "Saving…" : editId ? "Update" : "Add term"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setTerm(""); setDefinition(""); setAliases(""); }}
                className="h-6 px-3 text-[11px] border border-border rounded hover:bg-surface-hover">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : terms.length === 0 ? (
        <p className="text-[13px] text-muted italic">No terms yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-[11px] text-muted text-left border-b border-border">
                <th className="pb-1 pr-3">Term</th>
                <th className="pb-1 pr-3">Aliases</th>
                <th className="pb-1 pr-3">Definition</th>
                <th className="pb-1" />
              </tr>
            </thead>
            <tbody>
              {terms.map((t) => (
                <tr key={t.id} className="border-t border-border-light hover:bg-surface-hover">
                  <td className="py-1.5 pr-3 font-medium">{t.term}</td>
                  <td className="py-1.5 pr-3 text-muted text-[12px]">{t.aliases.join(", ") || "—"}</td>
                  <td className="py-1.5 pr-3 max-w-xs line-clamp-2">{t.definition}</td>
                  <td className="py-1.5 text-right space-x-1">
                    <button onClick={() => startEdit(t)} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover">Delete</button>
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
