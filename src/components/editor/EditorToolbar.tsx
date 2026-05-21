"use client";

import type { Editor } from "@tiptap/react";
import VoiceDictationButton from "./VoiceDictationButton";
import HighlightColorPicker from "./HighlightColorPicker";
import type { ClaimLevel } from "./ClaimMarkExtension";

type Props = {
  editor: Editor | null;
  onImageUpload: () => void;
  onDetectLinks: () => void;
  detectedLinkCount: number;
  onInsertToc: () => void;
  onAiRewrite: () => void;
  onAiExpand: () => void;
  onAiGenerate: () => void;
  onFindReplace: () => void;
  typewriterMode: boolean;
  onTypewriterToggle: () => void;
};

type ToolAction = {
  label: string;
  icon: string;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
  tone?: "default" | "accent" | "ai" | "danger";
};

function ToolButton({ action }: { action: ToolAction }) {
  return (
    <button
      type="button"
      onClick={action.action}
      disabled={action.disabled}
      title={action.label}
      aria-label={action.label}
      aria-pressed={action.active || undefined}
      data-tone={action.tone ?? "default"}
      className="editor-tool-button"
    >
      <span aria-hidden="true">{action.icon}</span>
    </button>
  );
}

function ToolbarGroup({
  label,
  actions,
}: {
  label: string;
  actions: ToolAction[];
}) {
  const visible = actions.filter((action) => !action.disabled || action.label === "Undo" || action.label === "Redo");
  if (visible.length === 0) return null;

  return (
    <div className="editor-toolbar-group" aria-label={label}>
      <span className="editor-toolbar-label">{label}</span>
      <div className="editor-toolbar-buttons">
        {visible.map((action) => (
          <ToolButton key={action.label} action={action} />
        ))}
      </div>
    </div>
  );
}

function getBlockValue(editor: Editor) {
  if (editor.isActive("heading", { level: 1 })) return "h1";
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  if (editor.isActive("codeBlock")) return "code";
  if (editor.isActive("blockquote")) return "quote";
  return "paragraph";
}

export default function EditorToolbar({
  editor,
  onImageUpload,
  onDetectLinks,
  detectedLinkCount,
  onInsertToc,
  onAiRewrite,
  onAiExpand,
  onAiGenerate,
  onFindReplace,
  typewriterMode,
  onTypewriterToggle,
}: Props) {
  if (!editor) return null;
  const activeEditor = editor;

  const isTableActive = activeEditor.isActive("table");
  const blockValue = getBlockValue(activeEditor);

  function setBlock(value: string) {
    if (value === "paragraph") activeEditor.chain().focus().setParagraph().run();
    if (value === "h1") activeEditor.chain().focus().toggleHeading({ level: 1 }).run();
    if (value === "h2") activeEditor.chain().focus().toggleHeading({ level: 2 }).run();
    if (value === "h3") activeEditor.chain().focus().toggleHeading({ level: 3 }).run();
    if (value === "quote") activeEditor.chain().focus().toggleBlockquote().run();
    if (value === "code") {
      if (activeEditor.isActive("codeBlock")) {
        activeEditor.chain().focus().toggleCodeBlock().run();
      } else {
        const lang = window.prompt("Language (js, python, html, css):", "");
        activeEditor.chain().focus().toggleCodeBlock().run();
        if (lang) activeEditor.chain().focus().updateAttributes("codeBlock", { language: lang }).run();
      }
    }
  }

  function insertLink() {
    const previous = activeEditor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL:", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      activeEditor.chain().focus().unsetLink().run();
      return;
    }
    activeEditor.chain().focus().setLink({ href: url.trim() }).run();
  }

  function insertWikiLink() {
    const { from, to } = activeEditor.state.selection;
    const selectedText = activeEditor.state.doc.textBetween(from, to);
    const title = window.prompt("Article title to link:", selectedText || "");
    if (!title) return;
    const label = selectedText && selectedText !== title ? selectedText : null;
    activeEditor
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent({ type: "wikiLink", attrs: { title, label } })
      .run();
  }

  function insertFootnote() {
    const note = window.prompt("Footnote text:");
    if (!note) return;
    activeEditor.chain().focus().insertContent({ type: "footnoteRef", attrs: { note } }).run();
  }

  const historyActions: ToolAction[] = [
    {
      label: "Undo",
      icon: "UN",
      action: () => activeEditor.chain().focus().undo().run(),
      disabled: !activeEditor.can().undo(),
    },
    {
      label: "Redo",
      icon: "RE",
      action: () => activeEditor.chain().focus().redo().run(),
      disabled: !activeEditor.can().redo(),
    },
  ];

  const textActions: ToolAction[] = [
    { label: "Bold", icon: "B", action: () => activeEditor.chain().focus().toggleBold().run(), active: activeEditor.isActive("bold") },
    { label: "Italic", icon: "I", action: () => activeEditor.chain().focus().toggleItalic().run(), active: activeEditor.isActive("italic") },
    { label: "Strike", icon: "S", action: () => activeEditor.chain().focus().toggleStrike().run(), active: activeEditor.isActive("strike") },
    { label: "Inline code", icon: "</>", action: () => activeEditor.chain().focus().toggleCode().run(), active: activeEditor.isActive("code") },
    { label: "Superscript", icon: "x2", action: () => activeEditor.chain().focus().toggleSuperscript().run(), active: activeEditor.isActive("superscript") },
    { label: "Subscript", icon: "x_2", action: () => activeEditor.chain().focus().toggleSubscript().run(), active: activeEditor.isActive("subscript") },
  ];

  const structureActions: ToolAction[] = [
    { label: "Bullet list", icon: "UL", action: () => activeEditor.chain().focus().toggleBulletList().run(), active: activeEditor.isActive("bulletList") },
    { label: "Numbered list", icon: "OL", action: () => activeEditor.chain().focus().toggleOrderedList().run(), active: activeEditor.isActive("orderedList") },
    { label: "Pull quote", icon: "PQ", action: () => activeEditor.chain().focus().togglePullQuote().run(), active: activeEditor.isActive("pullQuote") },
    { label: "Divider", icon: "--", action: () => activeEditor.chain().focus().setHorizontalRule().run() },
  ];

  const insertActions: ToolAction[] = [
    { label: "Link", icon: "URL", action: insertLink, active: activeEditor.isActive("link") },
    { label: "Wiki link", icon: "[[]]", action: insertWikiLink },
    { label: "Image", icon: "IMG", action: onImageUpload },
    { label: "Footnote", icon: "fn", action: insertFootnote },
    { label: "Table", icon: "TBL", action: () => activeEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { label: "Math block", icon: "SUM", action: () => activeEditor.chain().focus().insertBlockMath().run() },
  ];

  const knowledgeActions: ToolAction[] = [
    {
      label: "Detect wiki links",
      icon: detectedLinkCount > 0 ? `LINK ${detectedLinkCount}` : "LINK",
      action: onDetectLinks,
      tone: detectedLinkCount > 0 ? "accent" : "default",
    },
    { label: "Insert table of contents", icon: "TOC", action: onInsertToc },
    { label: "Find and replace", icon: "F/R", action: onFindReplace },
    { label: "Typewriter mode", icon: "TYPE", action: onTypewriterToggle, active: typewriterMode },
  ];

  const aiActions: ToolAction[] = [
    { label: "AI rewrite selection", icon: "AI-R", action: onAiRewrite, tone: "ai" },
    { label: "AI expand selection", icon: "AI-X", action: onAiExpand, tone: "ai" },
    { label: "AI generate article from headings", icon: "AI-G", action: onAiGenerate, tone: "ai" },
  ];

  const tableActions: ToolAction[] = [
    { label: "Add row below", icon: "+R", action: () => activeEditor.chain().focus().addRowAfter().run() },
    { label: "Add column after", icon: "+C", action: () => activeEditor.chain().focus().addColumnAfter().run() },
    { label: "Delete row", icon: "-R", action: () => activeEditor.chain().focus().deleteRow().run() },
    { label: "Delete column", icon: "-C", action: () => activeEditor.chain().focus().deleteColumn().run() },
    { label: "Merge cells", icon: "MRG", action: () => activeEditor.chain().focus().mergeCells().run() },
    { label: "Split cell", icon: "SPL", action: () => activeEditor.chain().focus().splitCell().run() },
    { label: "Header row", icon: "H-R", action: () => activeEditor.chain().focus().toggleHeaderRow().run(), active: activeEditor.isActive("tableHeader") },
    { label: "Header column", icon: "H-C", action: () => activeEditor.chain().focus().toggleHeaderColumn().run(), active: activeEditor.isActive("tableHeader") },
    { label: "Delete table", icon: "DEL", action: () => activeEditor.chain().focus().deleteTable().run(), tone: "danger" },
  ];

  const claimLevels: { level: ClaimLevel; label: string }[] = [
    { level: "certain", label: "Certain" },
    { level: "probable", label: "Probable" },
    { level: "disputed", label: "Disputed" },
  ];

  return (
    <div className="editor-toolbar-v2">
      <div className="editor-toolbar-main">
        <div className="editor-toolbar-block">
          <span className="editor-toolbar-label">Block</span>
          <select
            value={blockValue}
            onChange={(event) => setBlock(event.target.value)}
            aria-label="Block style"
            className="editor-block-select"
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="quote">Quote</option>
            <option value="code">Code block</option>
          </select>
        </div>

        <ToolbarGroup label="History" actions={historyActions} />
        <ToolbarGroup label="Text" actions={textActions} />
        <ToolbarGroup label="Structure" actions={structureActions} />
        <ToolbarGroup label="Insert" actions={insertActions} />
        <ToolbarGroup label="Knowledge" actions={knowledgeActions} />
        <ToolbarGroup label="AI" actions={aiActions} />

        <div className="editor-toolbar-group editor-toolbar-claims" aria-label="Claim confidence">
          <span className="editor-toolbar-label">Claims</span>
          <div className="editor-toolbar-buttons">
            {claimLevels.map(({ level, label }) => {
              const active = activeEditor.isActive("claimMark", { level });
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => activeEditor.chain().focus().toggleClaim(level).run()}
                  title={`Mark selection as ${label.toLowerCase()}`}
                  aria-pressed={active || undefined}
                  data-claim={level}
                  className="editor-claim-button"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="editor-toolbar-group editor-toolbar-finishing" aria-label="Finishing">
          <span className="editor-toolbar-label">Color</span>
          <div className="editor-toolbar-buttons">
            <HighlightColorPicker editor={activeEditor} />
            <VoiceDictationButton editor={activeEditor} />
            <button
              type="button"
              onClick={() => alert("Editor shortcuts:\n\nCtrl+B - Bold\nCtrl+I - Italic\nCtrl+Z - Undo\nCtrl+Y - Redo\nCtrl+H - Find and replace\nCtrl+Shift+L - Wiki link\nCtrl+Shift+F - Footnote\n[[...]] - Wiki link search\n/ - Command menu")}
              title="Editor keyboard shortcuts"
              aria-label="Editor keyboard shortcuts"
              className="editor-tool-button"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {isTableActive && (
        <div className="editor-context-bar" aria-label="Table controls">
          <span className="editor-context-label">Table lab</span>
          {tableActions.map((action) => (
            <ToolButton key={action.label} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
