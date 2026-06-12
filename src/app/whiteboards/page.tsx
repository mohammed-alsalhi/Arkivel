"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, EmptyState, Page, PageHeader } from "@/components/ui";

type Board = { id: string; title: string; slug: string; updatedAt: string };

export default function WhiteboardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/whiteboards");
    const data = await res.json();
    if (Array.isArray(data)) setBoards(data);
    setLoading(false);
  }

  async function create() {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/whiteboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const board = await res.json();
      window.location.href = `/whiteboards/${board.slug}`;
    }
  }

  return (
    <Page>
      <PageHeader title="Whiteboards" />

      <div className="flex gap-2 mb-4">
        {creating ? (
          <>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") create(); if (e.key === "Escape") setCreating(false); }}
              placeholder="Whiteboard title"
              className="border border-border bg-surface px-2 py-1 text-[12px] focus:border-accent focus:outline-none"
            />
            <Button variant="primary" onClick={create}>
              Create
            </Button>
            <Button onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setCreating(true)}>
            + New whiteboard
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-[13px] text-muted italic">Loading…</p>
      ) : boards.length === 0 ? (
        <EmptyState title="No whiteboards yet." description="Create one above." />
      ) : (
        <ul className="space-y-1 text-[13px]">
          {boards.map((b) => (
            <li key={b.id} className="border-b border-border pb-1">
              <Link href={`/whiteboards/${b.slug}`} className="font-medium hover:underline">
                {b.title}
              </Link>
              <span className="text-muted text-[11px] ml-2">
                Updated {new Date(b.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}

export const dynamic = "force-dynamic";
