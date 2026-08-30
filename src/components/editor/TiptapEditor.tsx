"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import ImageCaption from "./ImageCaptionExtension";
import { WikiLink } from "./WikiLinkExtension";
import styles from "./TiptapEditor.module.css";

export type TiptapEditorHandle = {
  getHTML: () => string;
  getMarkdown: () => string;
  setContent: (content: string) => void;
};

type Props = {
  content?: string;
  placeholder?: string;
  articleTitle?: string;
  onUpdate?: () => void;
};

type ToolButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

const lowlight = createLowlight(common);

function ToolButton({ label, onClick, active = false, disabled = false }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active || undefined}
      className={`border px-2 py-1 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-surface text-foreground hover:bg-surface-hover"
      }`}
    >
      {label}
    </button>
  );
}

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  if (!response.ok) return null;
  const data = await response.json() as { url?: unknown };
  return typeof data.url === "string" ? data.url : null;
}

function getBlockValue(editor: Editor): string {
  if (editor.isActive("heading", { level: 1 })) return "h1";
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  if (editor.isActive("blockquote")) return "quote";
  if (editor.isActive("codeBlock")) return "code";
  return "paragraph";
}

const TiptapEditor = forwardRef<TiptapEditorHandle, Props>(
  function TiptapEditor(
    { content = "", placeholder = "Start writing...", articleTitle = "", onUpdate },
    ref,
  ) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentContentRef = useRef(content);
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
      onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ codeBlock: false, link: false }),
        CodeBlockLowlight.configure({ lowlight }),
        ImageCaption.configure({ inline: false }),
        Link.configure({ openOnClick: false, autolink: true }).extend({
          parseHTML() {
            return [{ tag: "a[href]:not([data-wiki-link])" }];
          },
        }),
        Placeholder.configure({ placeholder }),
        TableKit,
        WikiLink,
      ],
      content,
      onUpdate: () => onUpdateRef.current?.(),
      editorProps: {
        attributes: {
          class: "tiptap max-w-none",
        },
        handleDrop(view, event) {
          const image = Array.from(event.dataTransfer?.files ?? []).find((file) => file.type.startsWith("image/"));
          if (!image) return false;

          event.preventDefault();
          const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
          uploadImage(image)
            .then((url) => {
              if (!url) return;
              const imageNode = view.state.schema.nodes.image.create({ src: url, alt: image.name });
              view.dispatch(view.state.tr.insert(position ?? view.state.doc.content.size, imageNode));
            })
            .catch(() => undefined);
          return true;
        },
        handlePaste(view, event) {
          const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith("image/"));
          const image = imageItem?.getAsFile();
          if (!image) return false;

          event.preventDefault();
          uploadImage(image)
            .then((url) => {
              if (!url) return;
              const imageNode = view.state.schema.nodes.image.create({ src: url, alt: image.name });
              view.dispatch(view.state.tr.replaceSelectionWith(imageNode));
            })
            .catch(() => undefined);
          return true;
        },
      },
    });

    useEffect(() => {
      if (!editor || content === currentContentRef.current) return;
      currentContentRef.current = content;
      editor.commands.setContent(content);
    }, [content, editor]);

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? "",
      getMarkdown: () => htmlToMarkdown(editor?.getHTML() ?? ""),
      setContent: (nextContent: string) => {
        currentContentRef.current = nextContent;
        editor?.commands.setContent(nextContent);
      },
    }), [editor]);

    function setBlock(value: string) {
      if (!editor) return;
      if (value === "paragraph") editor.chain().focus().setParagraph().run();
      if (value === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
      if (value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
      if (value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
      if (value === "quote") editor.chain().focus().toggleBlockquote().run();
      if (value === "code") editor.chain().focus().toggleCodeBlock().run();
    }

    function editLink() {
      if (!editor) return;
      const currentUrl = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL:", currentUrl ?? "https://");
      if (url === null) return;
      if (!url.trim()) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }

    function insertWikiLink() {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      const title = window.prompt("Article title:", selectedText);
      if (!title?.trim()) return;

      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent({
          type: "wikiLink",
          attrs: {
            title: title.trim(),
            label: selectedText && selectedText !== title.trim() ? selectedText : null,
          },
        })
        .run();
    }

    async function handleImageFile(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file || !editor) return;

      try {
        const url = await uploadImage(file);
        if (url) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } finally {
        event.target.value = "";
      }
    }

    return (
      <div
        className={styles.shell}
        data-testid="editor-shell"
        aria-label={`${articleTitle || "Article"} editor`}
      >
        <div
          className="flex flex-wrap items-center gap-1 border-b border-border bg-surface p-2"
          data-testid="editor-toolbar"
          role="toolbar"
          aria-label="Editor toolbar"
        >
          <select
            value={editor ? getBlockValue(editor) : "paragraph"}
            onChange={(event) => setBlock(event.target.value)}
            disabled={!editor}
            aria-label="Block style"
            className="border border-border bg-surface px-2 py-1 text-[12px] text-foreground focus:border-accent focus:outline-none"
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="quote">Quote</option>
            <option value="code">Code block</option>
          </select>

          <ToolButton label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} />
          <ToolButton label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} />
          <ToolButton label="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} disabled={!editor} />
          <ToolButton label="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} disabled={!editor} />
          <ToolButton label="Inline code" onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive("code")} disabled={!editor} />
          <ToolButton label="Bulleted list" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} disabled={!editor} />
          <ToolButton label="Numbered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} disabled={!editor} />
          <ToolButton label="Link" onClick={editLink} active={editor?.isActive("link")} disabled={!editor} />
          <ToolButton label="Wiki link" onClick={insertWikiLink} disabled={!editor} />
          <ToolButton label="Image" onClick={() => fileInputRef.current?.click()} disabled={!editor} />
          <ToolButton
            label="Table"
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            active={editor?.isActive("table")}
            disabled={!editor}
          />
        </div>

        {editor?.isActive("table") && (
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-hover p-2" aria-label="Table controls">
            <ToolButton label="Add row" onClick={() => editor.chain().focus().addRowAfter().run()} />
            <ToolButton label="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()} />
            <ToolButton label="Delete row" onClick={() => editor.chain().focus().deleteRow().run()} />
            <ToolButton label="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()} />
            <ToolButton label="Delete table" onClick={() => editor.chain().focus().deleteTable().run()} />
          </div>
        )}

        <div className={styles.canvas}>
          <EditorContent editor={editor} />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
          tabIndex={-1}
        />

      </div>
    );
  },
);

function htmlToMarkdown(html: string): string {
  if (!html || typeof DOMParser === "undefined") return "";

  const root = new DOMParser().parseFromString(html, "text/html").body;

  function serialize(node: Node): string {
    if (node.nodeType === 3) return node.textContent ?? "";
    if (!(node instanceof HTMLElement)) return "";

    const children = () => Array.from(node.childNodes).map(serialize).join("");
    const tag = node.tagName.toLowerCase();

    if (tag === "p") return `${children().trim()}\n\n`;
    if (/^h[1-6]$/.test(tag)) return `${"#".repeat(Number(tag[1]))} ${children().trim()}\n\n`;
    if (tag === "strong" || tag === "b") return `**${children()}**`;
    if (tag === "em" || tag === "i") return `*${children()}*`;
    if (tag === "s" || tag === "del") return `~~${children()}~~`;
    if (tag === "br") return "\n";
    if (tag === "hr") return "---\n\n";
    if (tag === "code" && node.parentElement?.tagName.toLowerCase() !== "pre") return `\`${children()}\``;
    if (tag === "pre") {
      const code = node.textContent?.replace(/\n$/, "") ?? "";
      const language = node.querySelector("code")?.className.match(/language-([\w-]+)/)?.[1] ?? "";
      return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
    if (tag === "blockquote") {
      return `${children().trim().split("\n").map((line) => `> ${line}`).join("\n")}\n\n`;
    }
    if (tag === "a") {
      const label = children();
      const wikiTitle = node.getAttribute("data-wiki-link");
      if (wikiTitle) return label === wikiTitle ? `[[${wikiTitle}]]` : `[[${wikiTitle}|${label}]]`;
      return `[${label}](${node.getAttribute("href") ?? ""})`;
    }
    if (tag === "img") {
      const alt = node.getAttribute("alt") ?? "";
      const src = node.getAttribute("src") ?? "";
      const title = node.getAttribute("title");
      return `![${alt}](${src}${title ? ` "${title}"` : ""})`;
    }
    if (tag === "figure") {
      const image = node.querySelector("img");
      return image ? `${serialize(image)}\n\n` : `${children().trim()}\n\n`;
    }
    if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((child, index) => `${tag === "ol" ? `${index + 1}.` : "-"} ${serialize(child).trim()}`)
        .join("\n");
      return `${items}\n\n`;
    }
    if (tag === "li") return children();
    if (tag === "table") return `${node.outerHTML}\n\n`;

    return children();
  }

  return Array.from(root.childNodes)
    .map(serialize)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default TiptapEditor;
