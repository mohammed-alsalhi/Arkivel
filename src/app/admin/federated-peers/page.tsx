"use client";

import { useState, useEffect } from "react";

type Peer = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string | null;
  enabled: boolean;
};

export default function FederatedPeersPage() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Peer | null>(null);
  const [form, setForm] = useState({ name: "", baseUrl: "", apiKey: "", enabled: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/federated-peers");
    const data = await res.json();
    if (Array.isArray(data)) setPeers(data);
    setLoading(false);
  }

  function startCreate() {
    setForm({ name: "", baseUrl: "", apiKey: "", enabled: true });
    setEditing(null);
    setCreating(true);
    setError("");
  }

  function startEdit(p: Peer) {
    setForm({ name: p.name, baseUrl: p.baseUrl, apiKey: p.apiKey ?? "", enabled: p.enabled });
    setEditing(p);
    setCreating(false);
    setError("");
  }

  async function save() {
    setSaving(true);
    setError("");
    const url = editing ? `/api/federated-peers/${editing.id}` : "/api/federated-peers";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Failed to save"); return; }
    setEditing(null);
    setCreating(false);
    load();
  }

  async function deletePeer(id: string) {
    if (!confirm("Remove this federated peer?")) return;
    await fetch(`/api/federated-peers/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleEnabled(p: Peer) {
    await fetch(`/api/federated-peers/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, enabled: !p.enabled }),
    });
    load();
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Federated search peers
      </h1>
      <p className="text-[13px] text-muted mb-4">
        Configure external wiki instances to include in federated search results. Peer wikis must expose the public{" "}
        <code className="bg-surface-hover px-1 rounded text-[12px]">/api/v1/articles</code> endpoint.
        Results appear in the search page under &ldquo;Results from other wikis&rdquo;.
      </p>

      <button onClick={startCreate} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover mb-4">
        + Add peer
      </button>

      {(creating || editing) && (
        <div className="wiki-portal mb-4">
          <div className="wiki-portal-header">{editing ? `Edit: ${editing.name}` : "Add federated peer"}</div>
          <div className="wiki-portal-body space-y-2">
            <div>
              <label className="block text-[11px] text-muted font-bold mb-0.5">Display name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none" placeholder="My Other Wiki" />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-bold mb-0.5">Base URL</label>
              <input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                className="w-full border border-border bg-surface px-2 py-1 text-[12px] font-mono focus:border-accent focus:outline-none" placeholder="https://otherwiki.example.com" />
            </div>
            <div>
              <label className="block text-[11px] text-muted font-bold mb-0.5">API key (optional, for private wikis)</label>
              <input type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                className="w-full border border-border bg-surface px-2 py-1 text-[12px] font-mono focus:border-accent focus:outline-none" placeholder="Leave blank for public wikis" />
            </div>
            <label className="flex items-center gap-1.5 text-[12px]">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
              Enabled
            </label>
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : peers.length === 0 ? (
        <div className="wiki-notice">No federated peers configured yet.</div>
      ) : (
        <table className="w-full border-collapse border border-border bg-surface text-[13px]">
          <thead>
            <tr className="bg-surface-hover">
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Name</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">URL</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-20">Status</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((p) => (
              <tr key={p.id} className="hover:bg-surface-hover">
                <td className="border border-border px-3 py-1.5 font-medium">{p.name}</td>
                <td className="border border-border px-3 py-1.5 text-muted text-[12px] font-mono">{p.baseUrl}</td>
                <td className="border border-border px-3 py-1.5">
                  <button onClick={() => toggleEnabled(p)}
                    className={`h-5 px-1.5 text-[10px] rounded border ${p.enabled ? "border-green-500 text-green-600" : "border-border text-muted"}`}>
                    {p.enabled ? "Active" : "Off"}
                  </button>
                </td>
                <td className="border border-border px-3 py-1.5">
                  <span className="flex gap-1">
                    <button onClick={() => startEdit(p)} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover">Edit</button>
                    <button onClick={() => deletePeer(p.id)} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover text-red-600">Del</button>
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
