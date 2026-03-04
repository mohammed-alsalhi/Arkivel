"use client";

import { useState } from "react";

interface Props {
  articleId: string;
  initialBookmarked?: boolean;
}

export default function BookmarkButton({ articleId, initialBookmarked = false }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (bookmarked) {
      await fetch(`/api/bookmarks?articleId=${articleId}`, { method: "DELETE" });
      setBookmarked(false);
    } else {
      setShowNote(true);
    }
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, note: note.trim() || undefined }),
    });
    if (res.ok) {
      setBookmarked(true);
      setShowNote(false);
      setNote("");
    }
    setSaving(false);
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        title={bookmarked ? "Remove bookmark" : "Bookmark this article"}
        className={`flex items-center gap-1 h-6 px-2 text-[11px] border rounded transition-colors ${
          bookmarked
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-muted hover:text-foreground hover:bg-surface-hover"
        }`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {bookmarked ? "Saved" : "Bookmark"}
      </button>

      {showNote && (
        <div className="absolute right-0 top-8 z-20 bg-surface border border-border rounded shadow-md p-3 w-64">
          <p className="text-xs font-medium mb-1">Add a note (optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs border border-border rounded p-1.5 bg-transparent resize-none outline-none"
            rows={3}
            placeholder="Why are you bookmarking this?"
            autoFocus
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setShowNote(false)} className="text-xs text-muted hover:text-foreground">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="text-xs bg-accent text-white px-2 py-0.5 rounded disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
