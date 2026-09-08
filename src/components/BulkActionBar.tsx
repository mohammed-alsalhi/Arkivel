"use client";

import { useState } from "react";

type Props = {
  selectedIds: string[];
  onClear: () => void;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

const OPERATIONS = [
  { value: "setStatus", label: "Set Status" },
  { value: "setCategory", label: "Set Category" },
  { value: "addTag", label: "Add Tag" },
  { value: "removeTag", label: "Remove Tag" },
];

export default function BulkActionBar({ selectedIds, onClear, categories, tags }: Props) {
  const [operation, setOperation] = useState("setStatus");
  const [value, setValue] = useState("");
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  if (selectedIds.length === 0) return null;

  async function apply() {
    if (!value) return;
    setApplying(true);
    setMessage("");
    try {
      const res = await fetch("/api/articles/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, operation, value }),
      });
      const data = await res.json();
      setMessage(res.ok ? `Updated ${data.updated} article(s).` : data.error || "Error");
      if (res.ok) onClear();
    } catch {
      setMessage("Failed to apply.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 md:bottom-0 bg-background border-t border-border px-4 py-3 flex flex-wrap items-center gap-3 shadow-lg">
      <span className="text-sm font-medium">{selectedIds.length} selected</span>

      <select
        value={operation}
        onChange={(e) => { setOperation(e.target.value); setValue(""); }}
        className="h-8 px-2 text-sm border border-border rounded bg-background"
      >
        {OPERATIONS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {operation === "setStatus" && (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 px-2 text-sm border border-border rounded bg-background"
        >
          <option value="">Choose…</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="published">Published</option>
        </select>
      )}

      {operation === "setCategory" && (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 px-2 text-sm border border-border rounded bg-background"
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {(operation === "addTag" || operation === "removeTag") && (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tag name"
          list="bulk-tags"
          className="h-8 px-2 text-sm border border-border rounded bg-background w-36"
        />
      )}
      <datalist id="bulk-tags">
        {tags.map((t) => <option key={t.id} value={t.name} />)}
      </datalist>

      <button
        onClick={apply}
        disabled={applying || !value}
        className="h-8 px-3 text-sm border border-border rounded hover:bg-muted disabled:opacity-50"
      >
        {applying ? "Applying…" : "Apply"}
      </button>
      <button onClick={onClear} className="h-8 px-3 text-sm text-muted-foreground hover:underline">
        Clear
      </button>
      {message && <span className="text-xs text-muted-foreground">{message}</span>}
    </div>
  );
}
