"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Page, PageHeader } from "@/components/ui";

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
    <Page width="narrow">
      <PageHeader
        title="New canvas"
        description="Name the canvas before opening the visual editor."
      />
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Canvas name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="ui-input"
        />
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
        >
          {loading ? "Creating..." : "Create canvas"}
        </Button>
      </form>
    </Page>
  );
}
