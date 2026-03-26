"use client";

import { useState, useEffect } from "react";

type Snippet = { id: string; name: string; content: string; createdAt: string };

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/snippets");
    if (res.ok) setSnippets(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    const url = editId ? `/api/snippets/${editId}` : "/api/snippets";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
    if (res.ok) {
      setName("");
      setContent("");
      setEditId(null);
      await load();
    }
    setSaving(false);
  }

  function startEdit(s: Snippet) {
    setEditId(s.id);
    setName(s.name);
    setContent(s.content);
  }

  function cancelEdit() {
    setEditId(null);
    setName("");
    setContent("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this snippet?")) return;
    await fetch(`/api/snippets/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1
        className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Editor Snippets
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Snippets are reusable content blocks. Type <code className="bg-surface-hover px-1">/snippet</code> in the editor to insert one.
      </p>

      {/* Create/edit form */}
      <form onSubmit={handleSave} className="wiki-portal mb-6">
        <div className="wiki-portal-header">{editId ? "Edit snippet" : "New snippet"}</div>
        <div className="wiki-portal-body space-y-3">
          <div>
            <label className="block text-[12px] text-muted mb-1">
              Name <span className="text-muted">(used as trigger in /snippet menu)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-xs border border-border bg-background px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
              placeholder="e.g. meeting-notes, warning-box"
            />
          </div>
          <div>
            <label className="block text-[12px] text-muted mb-1">Content (HTML)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground font-mono focus:border-accent focus:outline-none resize-y"
              placeholder="<p>Your snippet content here…</p>"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !name.trim() || !content.trim()}
              className="h-6 px-2 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-40"
            >
              {saving ? "Saving…" : editId ? "Update" : "Create snippet"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:bg-surface-hover"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="text-muted text-[13px] italic">Loading…</div>
      ) : snippets.length === 0 ? (
        <p className="text-[13px] text-muted italic">No snippets yet.</p>
      ) : (
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-[11px] text-muted text-left border-b border-border">
              <th className="pb-1 pr-3">Name</th>
              <th className="pb-1 pr-3">Preview</th>
              <th className="pb-1" />
            </tr>
          </thead>
          <tbody>
            {snippets.map((s) => (
              <tr key={s.id} className="border-t border-border-light hover:bg-surface-hover">
                <td className="py-1.5 pr-3 font-mono text-[12px] text-accent">{s.name}</td>
                <td className="py-1.5 pr-3 max-w-xs text-muted truncate text-[12px]">
                  {s.content.replace(/<[^>]+>/g, " ").trim().slice(0, 80)}
                </td>
                <td className="py-1.5 text-right">
                  <span className="inline-flex gap-1">
                    <button
                      onClick={() => startEdit(s)}
                      className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:bg-surface-hover"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:bg-surface-hover"
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
