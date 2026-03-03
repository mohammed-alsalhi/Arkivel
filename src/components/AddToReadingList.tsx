"use client";

import { useState, useEffect } from "react";

interface ReadingList {
  id: string;
  name: string;
}

interface Props {
  articleId: string;
}

export default function AddToReadingList({ articleId }: Props) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<string[]>([]);

  function loadLists() {
    if (lists.length > 0) return;
    setLoading(true);
    fetch("/api/reading-lists?own=1")
      .then((r) => r.json())
      .then((data) => { setLists(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  async function addToList(listId: string) {
    const res = await fetch(`/api/reading-lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    });
    if (res.ok) setAdded((prev) => [...prev, listId]);
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); loadLists(); }}
        className="px-2 py-0.5 text-[11px] border border-border rounded text-muted hover:border-accent/40 hover:text-foreground transition-colors"
      >
        + Reading List
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 bg-surface border border-border rounded shadow-md p-2 w-52 text-[12px]">
          {loading ? (
            <p className="text-muted px-2 py-1">Loading…</p>
          ) : lists.length === 0 ? (
            <p className="text-muted px-2 py-1">No lists yet. Create one in Reading Lists.</p>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                onClick={() => addToList(list.id)}
                disabled={added.includes(list.id)}
                className={`w-full text-left px-2 py-1 rounded hover:bg-surface-hover transition-colors ${
                  added.includes(list.id) ? "text-muted line-through" : "text-foreground"
                }`}
              >
                {added.includes(list.id) ? "✓ " : ""}{list.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
