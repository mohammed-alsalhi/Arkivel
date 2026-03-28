"use client";

import { useState, useEffect } from "react";

type Announcement = {
  id: string;
  message: string;
  type: string;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

const TYPES = ["info", "warning", "success", "error"] as const;

const TYPE_BADGE: Record<string, string> = {
  info:    "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  error:   "bg-red-100 text-red-800",
};

export default function AnnouncementsPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("info");
  const [expiresAt, setExpiresAt] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/announcements");
    if (res.ok) setList(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, type, expiresAt: expiresAt || null, scheduledAt: scheduledAt || null }),
    });
    if (res.ok) {
      setMessage("");
      setExpiresAt("");
      setScheduledAt("");
      setType("info");
      await load();
    }
    setSaving(false);
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1
        className="text-[1.4rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Announcements
      </h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="wiki-portal mb-6">
        <div className="wiki-portal-header">New announcement</div>
        <div className="wiki-portal-body space-y-3">
          <div>
            <label className="block text-[12px] text-muted mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full border border-border bg-background px-2 py-1.5 text-[13px] text-foreground focus:border-accent focus:outline-none resize-none"
              placeholder="Announcement text shown to all users…"
            />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-[12px] text-muted mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
                className="border border-border bg-background px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Expires (optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="border border-border bg-background px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Go live at (optional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="border border-border bg-background px-2 py-1 text-[13px] text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                disabled={saving || !message.trim()}
                className="h-6 px-2 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-40"
              >
                {saving ? "Posting…" : "Post announcement"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="text-muted text-[13px] italic">Loading…</div>
      ) : list.length === 0 ? (
        <p className="text-[13px] text-muted italic">No announcements yet.</p>
      ) : (
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-[11px] text-muted text-left border-b border-border">
              <th className="pb-1 pr-3">Message</th>
              <th className="pb-1 pr-3">Type</th>
              <th className="pb-1 pr-3">Expires</th>
              <th className="pb-1 pr-3">Status</th>
              <th className="pb-1" />
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t border-border-light hover:bg-surface-hover">
                <td className="py-1.5 pr-3 max-w-xs">
                  <span className={a.active ? "" : "opacity-50 line-through"}>{a.message}</span>
                </td>
                <td className="py-1.5 pr-3">
                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${TYPE_BADGE[a.type] ?? ""}`}>
                    {a.type}
                  </span>
                </td>
                <td className="py-1.5 pr-3 text-muted">
                  {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="py-1.5 pr-3">
                  <button
                    onClick={() => toggleActive(a.id, a.active)}
                    className={`h-6 px-2 text-[11px] border rounded transition-colors ${
                      a.active
                        ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-border text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {a.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="py-1.5 text-right">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="h-6 px-2 text-[11px] border border-border rounded text-muted hover:text-foreground hover:bg-surface-hover"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
