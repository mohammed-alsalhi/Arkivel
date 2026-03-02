"use client";

import { useState, useMemo } from "react";

type MapArea = {
  id: string;
  label: string;
  article: { id: string; title: string; slug: string } | null;
};

export default function MapSearch({
  markers,
  onSelect,
}: {
  markers: MapArea[];
  onSelect: (markerId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return markers.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.article?.title.toLowerCase().includes(q)
    );
  }, [query, markers]);

  return (
    <div className="absolute top-4 right-4 z-[1000] w-56">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search markers..."
        className="w-full border border-border bg-surface px-2 py-1 text-[12px] text-foreground shadow focus:border-accent focus:outline-none"
      />

      {open && filtered.length > 0 && (
        <div className="mt-1 max-h-48 overflow-y-auto border border-border bg-surface shadow-md">
          {filtered.map((marker) => (
            <button
              key={marker.id}
              onClick={() => {
                onSelect(marker.id);
                setQuery("");
                setOpen(false);
              }}
              className="block w-full px-2 py-1.5 text-left text-[12px] text-foreground hover:bg-surface-hover"
            >
              <span className="font-bold">{marker.label}</span>
              {marker.article && (
                <span className="ml-1 text-[10px] text-muted">
                  ({marker.article.title})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="mt-1 border border-border bg-surface p-2 shadow-md">
          <p className="text-[11px] text-muted italic">No markers found.</p>
        </div>
      )}
    </div>
  );
}
