"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { WikiLink } from "./WikiLinkExtension";
import { PotentialLink } from "./PotentialLinkExtension";
import { FootnoteRef } from "./FootnoteExtension";
import EditorToolbar from "./EditorToolbar";
import WikiLinkSuggester from "./WikiLinkSuggester";
import LinkBubble from "./LinkBubble";
import { useWikiLinkSuggester } from "./useWikiLinkSuggester";
import { useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";

export type TiptapEditorHandle = {
  getHTML: () => string;
  getMarkdown: () => string;
  setContent: (content: string) => void;
};

type Props = {
  content?: string;
  placeholder?: string;
};

const TiptapEditor = forwardRef<TiptapEditorHandle, Props>(
  function TiptapEditor({ content = "", placeholder = "Start writing..." }, ref) {
    const [markdownMode, setMarkdownMode] = useState(false);
    const [markdownText, setMarkdownText] = useState("");
    const [detectedCount, setDetectedCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const lowlight = createLowlight(common);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockLowlight.configure({ lowlight }),
        Image.configure({ inline: false }),
        Link.configure({ openOnClick: false }).extend({
          parseHTML() {
            return [{ tag: "a[href]:not([data-wiki-link])" }];
          },
        }),
        Placeholder.configure({ placeholder }),
        WikiLink,
        PotentialLink,
        FootnoteRef,
        TableKit,
      ],
      content,
      editorProps: {
        attributes: {
          class: "tiptap max-w-none",
        },
        handleDrop(view, event) {
          const files = event.dataTransfer?.files;
          if (!files || files.length === 0) return false;

          const imageFile = Array.from(files).find(f => f.type.startsWith("image/"));
          if (!imageFile) return false;

          event.preventDefault();

          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          const formData = new FormData();
          formData.append("file", imageFile);

          fetch("/api/upload", { method: "POST", body: formData })
            .then(res => res.json())
            .then(({ url }) => {
              const node = view.state.schema.nodes.image.create({ src: url });
              const pos = coords?.pos ?? view.state.doc.content.size;
              const tr = view.state.tr.insert(pos, node);
              view.dispatch(tr);
            });

          return true;
        },
        handlePaste(view, event) {
          const items = event.clipboardData?.items;
          if (!items) return false;

          const imageItem = Array.from(items).find(i => i.type.startsWith("image/"));
          if (!imageItem) return false;

          event.preventDefault();
          const file = imageItem.getAsFile();
          if (!file) return false;

          const formData = new FormData();
          formData.append("file", file);

          fetch("/api/upload", { method: "POST", body: formData })
            .then(res => res.json())
            .then(({ url }) => {
              const node = view.state.schema.nodes.image.create({ src: url });
              const tr = view.state.tr.replaceSelectionWith(node);
              view.dispatch(tr);
            });

          return true;
        },
        handleClick(view, pos) {
          const resolved = view.state.doc.resolve(pos);
          const marks = resolved.marks();
          const potentialMark = marks.find(
            (m) => m.type.name === "potentialLink"
          );
          if (!potentialMark) return false;

          const title = potentialMark.attrs.title as string;
          const $pos = resolved;
          const parent = $pos.parent;
          let from = $pos.before($pos.depth) + 1;
          let to = from;

          // Walk through the parent's children to find the text range with this mark
          parent.forEach((node, offset) => {
            const hasMark = node.marks.some(
              (m) =>
                m.type.name === "potentialLink" && m.attrs.title === title
            );
            if (hasMark) {
              const nodeFrom = $pos.start() + offset;
              const nodeTo = nodeFrom + node.nodeSize;
              if (pos >= nodeFrom && pos < nodeTo) {
                from = nodeFrom;
                to = nodeTo;
              }
            }
          });

          const tr = view.state.tr;
          tr.removeMark(from, to, potentialMark.type);
          tr.replaceRangeWith(
            from,
            to,
            view.state.schema.nodes.wikiLink.create({ title })
          );
          view.dispatch(tr);
          setDetectedCount((c) => Math.max(0, c - 1));
          return true;
        },
      },
    });

    const suggester = useWikiLinkSuggester(editor);

    const handleDetectLinks = useCallback(async () => {
      if (!editor) return;

      // First clear any existing potential link marks
      const { tr } = editor.state;
      const markType = editor.schema.marks.potentialLink;
      tr.removeMark(0, editor.state.doc.content.size, markType);
      editor.view.dispatch(tr);

      // Fetch all article titles
      const res = await fetch("/api/articles/titles");
      if (!res.ok) return;
      const articles: { title: string; slug: string }[] = await res.json();
      if (articles.length === 0) return;

      // Sort by title length descending so longer matches take priority
      const sorted = [...articles].sort(
        (a, b) => b.title.length - a.title.length
      );

      let count = 0;
      const { tr: tr2 } = editor.state;

      editor.state.doc.descendants((node, pos) => {
        if (!node.isText || !node.text) return;

        // Skip text inside wikiLink nodes (parent check)
        const $pos = editor.state.doc.resolve(pos);
        if ($pos.parent.type.name === "wikiLink") return;
        // Skip headings
        if ($pos.parent.type.name === "heading") return;

        // Skip text that already has a potentialLink mark
        if (node.marks.some((m) => m.type.name === "potentialLink")) return;

        const text = node.text;
        // Track which character positions are already matched
        const matched = new Array(text.length).fill(false);

        for (const article of sorted) {
          const titleLower = article.title.toLowerCase();
          const textLower = text.toLowerCase();
          let searchFrom = 0;

          while (searchFrom < text.length) {
            const idx = textLower.indexOf(titleLower, searchFrom);
            if (idx === -1) break;

            const end = idx + article.title.length;

            // Check if any character in this range is already matched
            let overlap = false;
            for (let i = idx; i < end; i++) {
              if (matched[i]) {
                overlap = true;
                break;
              }
            }

            if (!overlap) {
              // Check word boundaries
              const beforeOk =
                idx === 0 || /\W/.test(text[idx - 1]);
              const afterOk =
                end >= text.length || /\W/.test(text[end]);

              if (beforeOk && afterOk) {
                tr2.addMark(
                  pos + idx,
                  pos + end,
                  markType.create({ title: article.title })
                );
                for (let i = idx; i < end; i++) matched[i] = true;
                count++;
              }
            }

            searchFrom = end;
          }
        }
      });

      if (count > 0) {
        editor.view.dispatch(tr2);
      }
      setDetectedCount(count);
    }, [editor]);

    useImperativeHandle(ref, () => ({
      getHTML: () => {
        const html = editor?.getHTML() || "";
        // Strip potential-link marks — they're editor-only hints, not saved content
        return html.replace(/<span[^>]*data-suggest-title="[^"]*"[^>]*>(.*?)<\/span>/g, "$1");
      },
      getMarkdown: () => markdownText,
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
    }));

    async function handleImageUpload() {
      fileInputRef.current?.click();
    }

    async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        editor.chain().focus().setImage({ src: url }).run();
      }

      e.target.value = "";
    }

    function toggleMarkdownMode() {
      if (!editor) return;

      if (!markdownMode) {
        const html = editor.getHTML();
        setMarkdownText(htmlToBasicMarkdown(html));
      } else {
        const html = basicMarkdownToHtml(markdownText);
        editor.commands.setContent(html);
      }
      setMarkdownMode(!markdownMode);
    }

    return (
      <div className="border border-border overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-border bg-surface-hover px-2 py-1">
          <EditorToolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            onDetectLinks={handleDetectLinks}
            detectedLinkCount={detectedCount}
          />
          <button
            type="button"
            onClick={toggleMarkdownMode}
            className={`px-2 py-0.5 text-[11px] transition-colors ${
              markdownMode
                ? "bg-accent text-white font-bold"
                : "text-muted hover:text-foreground"
            }`}
          >
            {markdownMode ? "Rich Text" : "Markdown"}
          </button>
        </div>

        {markdownMode ? (
          <textarea
            value={markdownText}
            onChange={(e) => setMarkdownText(e.target.value)}
            className="min-h-[300px] w-full bg-surface p-4 font-mono text-[13px] text-foreground focus:outline-none"
            placeholder="Write in markdown..."
          />
        ) : (
          <EditorContent editor={editor} />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <WikiLinkSuggester
          active={suggester.active}
          query={suggester.query}
          position={suggester.position}
          onSelect={suggester.selectItem}
          onDismiss={suggester.dismiss}
        />

        {!markdownMode && <LinkBubble editor={editor} />}
      </div>
    );
  }
);

function htmlToBasicMarkdown(html: string): string {
  return html
    // Convert wiki links to [[Title]] or [[Title|Label]] before stripping tags
    .replace(/<a[^>]*data-wiki-link="([^"]*)"[^>]*>([^<]*)<\/a>/gi, (_m, title, text) => {
      return text !== title ? `[[${title}|${text}]]` : `[[${title}]]`;
    })
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function basicMarkdownToHtml(md: string): string {
  const lines = md.split("\n");
  const result: string[] = [];
  let paragraph: string[] = [];

  function convertInline(text: string): string {
    return text
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, title, label) => {
        const slug = slugify(title);
        const display = label || title;
        return `<a href="/articles/${slug}" class="wiki-link" data-wiki-link="${title}">${display}</a>`;
      })
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  function flushParagraph() {
    if (paragraph.length > 0) {
      result.push(`<p>${convertInline(paragraph.join("<br>"))}</p>`);
      paragraph = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      result.push(`<h3>${convertInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      result.push(`<h2>${convertInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      flushParagraph();
      result.push(`<h1>${convertInline(trimmed.slice(2))}</h1>`);
    } else {
      paragraph.push(trimmed);
    }
  }

  flushParagraph();
  return result.join("");
}

export default TiptapEditor;
