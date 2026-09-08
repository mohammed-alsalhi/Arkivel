"use client";

import { useState, useEffect } from "react";

export default function CategoryWatchButton({ categoryId }: { categoryId: string }) {
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/category-watch?categoryId=${categoryId}`)
      .then((r) => r.json())
      .then((d) => setWatching(d.watching ?? false))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/category-watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId }),
    });
    if (res.ok) {
      const d = await res.json();
      setWatching(d.watching);
    }
    setLoading(false);
  }

  if (loading) return null;

  return (
    <button
      onClick={toggle}
      aria-pressed={watching}
      className="ui-button"
      title={watching ? "Stop watching this category" : "Watch this category for new articles"}
    >
      {watching ? "Watching" : "Watch"}
    </button>
  );
}
