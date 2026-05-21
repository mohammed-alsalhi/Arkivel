"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  alertEnabled: boolean;
  createdAt: string;
};

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/saved-searches");
    if (res.ok) setSearches(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleAlert(s: SavedSearch) {
    const res = await fetch(`/api/saved-searches?id=${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertEnabled: !s.alertEnabled }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSearches((prev) => prev.map((x) => (x.id === updated.id ? { ...x, alertEnabled: updated.alertEnabled } : x)));
    }
  }

  async function deleteSearch(id: string) {
    const res = await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
    if (res.ok) setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Saved searches
      </h1>
      <p className="text-[12px] text-muted mb-4">
        Enable alerts to receive an in-app notification when new articles match a saved search.
      </p>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : searches.length === 0 ? (
        <div className="text-[13px] text-muted italic">
          No saved searches yet.{" "}
          <Link href="/search" className="text-wiki-link hover:underline">
            Search something
          </Link>{" "}
          and save it with the &ldquo;Save search&rdquo; button.
        </div>
      ) : (
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted text-[11px] uppercase">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Query</th>
              <th className="py-2 pr-4 text-center">Alert</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {searches.map((s) => (
              <tr key={s.id} className="border-b border-border hover:bg-surface-hover">
                <td className="py-2 pr-4 font-medium">{s.name}</td>
                <td className="py-2 pr-4 text-muted font-mono text-[12px]">
                  <Link href={`/search?q=${encodeURIComponent(s.query)}`} className="text-wiki-link hover:underline">
                    {s.query}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-center">
                  <button
                    onClick={() => toggleAlert(s)}
                    title={s.alertEnabled ? "Disable alert" : "Enable alert"}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      s.alertEnabled ? "bg-accent" : "bg-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        s.alertEnabled ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="py-2">
                  <button
                    onClick={() => deleteSearch(s.id)}
                    className="text-[11px] text-muted hover:text-red-500 transition-colors"
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
