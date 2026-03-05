"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import TiptapEditor, { type TiptapEditorHandle } from "@/components/editor/TiptapEditor";

export default function ScratchpadPage() {
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [autosaveTimer, setAutosaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/scratchpad")
      .then((r) => r.json())
      .then((data) => {
        if (editorRef.current && data.content) {
          editorRef.current.setContent(data.content);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const save = useCallback(async () => {
    if (!editorRef.current) return;
    setSaving(true);
    const content = editorRef.current.getHTML();
    await fetch("/api/scratchpad", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setSavedAt(new Date());
  }, []);

  function scheduleSave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    const t = setTimeout(save, 2000);
    setAutosaveTimer(t);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1
            className="text-[1.5rem] font-normal text-heading"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Scratchpad
          </h1>
          <p className="text-[12px] text-muted mt-0.5">
            Private notes — never appears in search or article listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && !saving && (
            <span className="text-[11px] text-muted">
              Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {saving && <span className="text-[11px] text-muted">Saving...</span>}
          <button
            onClick={save}
            disabled={saving}
            className="h-6 px-2 text-[11px] border border-border rounded bg-surface hover:bg-surface-hover disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {loaded && (
        <div
          className="border border-border"
          onKeyDown={scheduleSave}
          onPaste={scheduleSave}
        >
          <TiptapEditor
            ref={editorRef}
            placeholder="Start writing your private notes..."
          />
        </div>
      )}
    </div>
  );
}
