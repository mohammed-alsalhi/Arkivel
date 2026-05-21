"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCanvasPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Untitled Canvas" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/canvas/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-xl font-bold text-heading mb-6">New Canvas</h1>
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Canvas name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-8 px-4 text-sm border border-border rounded bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create canvas"}
        </button>
      </form>
    </div>
  );
}
