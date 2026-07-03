"use client";

import { useState, useCallback, useEffect } from "react";
import type { Editor } from "@tiptap/core";
import { useRouter } from "next/navigation";
import { useScrollLock } from "@/lib/useScrollLock";

type Props = {
  editor: Editor | null;
  articleId?: string;
};

export default function NoteComposer({ editor, articleId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleExtract = useCallback(async () => {
    if (!editor || !title.trim()) return;
    setLoading(true);
    setError("");
    try {
      // Get selected HTML
      const { from, to } = editor.state.selection;
      if (from === to) { setError("Select text to extract first."); setLoading(false); return; }
      const selectedHtml = editor.getHTML().slice(from, to);
      // Use the selection text from the actual editor
      const view = editor.view;
      const slice = view.state.doc.slice(from, to);
      const selectedText = slice.content.textBetween(0, slice.content.size, "\n");

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      // Create new article
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug,
          content: `<h1>${title.trim()}</h1>${editor.isEmpty ? "<p></p>" : `<p>${selectedText}</p>`}`,
          status: "draft",
        }),
      });

      if (!res.ok) { setError("Failed to create article."); setLoading(false); return; }

      // Replace selection with a wiki link
      editor.chain().focus()
        .deleteSelection()
        .insertContent(`<a class="wiki-link" data-wiki-link="${title.trim()}" href="/articles/${slug}">${title.trim()}</a>`)
        .run();

      setOpen(false);
      setTitle("");
      router.push(`/articles/${slug}/edit`);
    } catch {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [editor, title, router]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Extract selection to new article (Note Composer)"
        className="h-6 px-2 text-[11px] border border-border rounded hover:bg-muted/30 text-muted"
      >
        Extract
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-32 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Extract selection to new article" className="bg-surface border border-border rounded shadow-2xl w-full max-w-md p-5 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="font-semibold text-sm text-heading">Extract selection to new article</div>
            <p className="text-[11px] text-muted">The selected text will be moved to a new article and replaced with a wiki link.</p>
            <input
              type="text"
              autoFocus
              placeholder="New article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => { if (e.key === "Enter") handleExtract(); }}
            />
            {error && <p className="text-[11px] text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setOpen(false)} className="h-6 px-2 text-[11px] border border-border rounded hover:bg-muted/50">
                Cancel
              </button>
              <button onClick={handleExtract} disabled={loading || !title.trim()} className="h-6 px-2 text-[11px] border border-border rounded bg-accent text-white hover:bg-accent/90 disabled:opacity-50">
                {loading ? "Creating…" : "Extract"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
