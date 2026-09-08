"use client";

import { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { findReplaceKey } from "./FindReplaceExtension";

interface Props {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}

export default function FindReplacePanel({ editor, open, onClose }: Props) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const findRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) findRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!editor || !open) return;
    // Dispatch query to plugin
    const { tr } = editor.state;
    tr.setMeta(findReplaceKey, { query: find });
    editor.view.dispatch(tr);

    // Count matches
    if (!find) { setMatchCount(0); return; }
    let count = 0;
    const lq = find.toLowerCase();
    editor.state.doc.descendants((node) => {
      if (!node.isText || !node.text) return;
      let i = node.text.toLowerCase().indexOf(lq);
      while (i !== -1) { count++; i = node.text.toLowerCase().indexOf(lq, i + 1); }
    });
    setMatchCount(count);
  }, [find, editor, open]);

  // Clear highlights on close
  useEffect(() => {
    if (!open && editor) {
      const { tr } = editor.state;
      tr.setMeta(findReplaceKey, { query: "" });
      editor.view.dispatch(tr);
    }
  }, [open, editor]);

  function handleReplaceOne() {
    if (!editor || !find) return;
    const content = editor.getHTML();
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (regex.test(content)) {
      editor.commands.setContent(content.replace(regex, replace));
    }
  }

  function handleReplaceAll() {
    if (!editor || !find) return;
    const content = editor.getHTML();
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    editor.commands.setContent(content.replace(regex, replace));
    setFind("");
    setMatchCount(0);
  }

  if (!open) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-surface text-[12px] flex-wrap">
      <div className="flex items-center gap-1.5">
        <input
          ref={findRef}
          type="text"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Find…"
          className="w-36 px-2 py-0.5 border border-border bg-background text-foreground focus:border-accent focus:outline-none text-[12px]"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
        {find && (
          <span className="text-muted whitespace-nowrap">
            {matchCount} match{matchCount !== 1 ? "es" : ""}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Replace with…"
          className="w-36 px-2 py-0.5 border border-border bg-background text-foreground focus:border-accent focus:outline-none text-[12px]"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
        <button
          onClick={handleReplaceOne}
          disabled={!find || matchCount === 0}
          className="h-5 px-2 text-[11px] border border-border rounded hover:bg-surface-hover disabled:opacity-40"
        >
          Replace
        </button>
        <button
          onClick={handleReplaceAll}
          disabled={!find || matchCount === 0}
          className="h-5 px-2 text-[11px] border border-border rounded hover:bg-surface-hover disabled:opacity-40"
        >
          All
        </button>
      </div>
      <button
        onClick={onClose}
        className="ml-auto text-muted hover:text-foreground text-[14px] leading-none"
        aria-label="Close find & replace"
      >
        ×
      </button>
    </div>
  );
}
