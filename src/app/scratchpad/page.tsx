"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import TiptapEditor, { type TiptapEditorHandle } from "@/components/editor/TiptapEditor";
import { Button, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader
        title="Scratchpad"
        description="Private notes — never appears in search or article listings."
        actions={
          <>
            {savedAt && !saving && (
              <span className="text-[11px] text-muted">
                Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {saving && <span className="text-[11px] text-muted">Saving...</span>}
            <Button onClick={save} disabled={saving}>
              Save
            </Button>
          </>
        }
      />

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
    </Page>
  );
}
