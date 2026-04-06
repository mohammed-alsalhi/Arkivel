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

type ToolbarButton = {
  label: string;
  icon: string;
  action: () => void;
  isActive?: () => boolean;
  hidden?: () => boolean;
};

export default function EditorToolbar({ editor, onImageUpload, onDetectLinks, detectedLinkCount, onInsertToc, onAiRewrite, onAiExpand, onAiGenerate, onFindReplace, typewriterMode, onTypewriterToggle }: Props) {
  if (!editor) return null;

  const groups: ToolbarButton[][] = [
    [
      {
        label: "Undo (Ctrl+Z)",
        icon: "\u21A9",
        action: () => editor.chain().focus().undo().run(),
      },
      {
        label: "Redo (Ctrl+Y)",
        icon: "\u21AA",
        action: () => editor.chain().focus().redo().run(),
      },
    ],
    [
      {
        label: "Bold",
        icon: "B",
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive("bold"),
      },
      {
        label: "Italic",
        icon: "I",
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive("italic"),
      },
      {
        label: "Strike",
        icon: "S",
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive("strike"),
      },
      {
        label: "Superscript",
        icon: "x²",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        action: () => (editor.chain().focus() as any).toggleSuperscript?.().run(),
        isActive: () => editor.isActive("superscript"),
      },
      {
        label: "Subscript",
        icon: "x₂",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        action: () => (editor.chain().focus() as any).toggleSubscript?.().run(),
        isActive: () => editor.isActive("subscript"),
      },
    ],
    [
      {
        label: "H1",
        icon: "H1",
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: () => editor.isActive("heading", { level: 1 }),
      },
      {
        label: "H2",
        icon: "H2",
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: () => editor.isActive("heading", { level: 2 }),
      },
      {
        label: "H3",
        icon: "H3",
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: () => editor.isActive("heading", { level: 3 }),
      },
    ],
    [
      {
        label: "Bullet List",
        icon: "\u2022",
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: () => editor.isActive("bulletList"),
      },
      {
        label: "Ordered List",
        icon: "1.",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: () => editor.isActive("orderedList"),
      },
      {
        label: "Blockquote",
        icon: "\u201C",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.isActive("blockquote"),
      },
      {
        label: "Code Block",
        icon: "<>",
        action: () => {
          if (editor.isActive("codeBlock")) {
            editor.chain().focus().toggleCodeBlock().run();
          } else {
            const lang = window.prompt("Language (e.g. js, python, html):", "");
            editor.chain().focus().toggleCodeBlock().run();
            if (lang) {
              editor.chain().focus().updateAttributes("codeBlock", { language: lang }).run();
            }
          }
        },
        isActive: () => editor.isActive("codeBlock"),
      },
    ],
    [
      {
        label: "Rule",
        icon: "\u2014",
        action: () => editor.chain().focus().setHorizontalRule().run(),
      },
      {
        label: "Link",
        icon: "\u{1F517}",
        action: () => {
          const url = window.prompt("URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        },
        isActive: () => editor.isActive("link"),
      },
      {
        label: "Image",
        icon: "\u{1F5BC}",
        action: onImageUpload,
      },
      {
        label: "Footnote (Ctrl+Shift+F)",
        icon: "fn",
        action: () => {
          const note = window.prompt("Footnote text:");
          if (note) {
            editor.chain().focus().insertContent({
              type: "footnoteRef",
              attrs: { note },
            }).run();
          }
        },
      },
      {
        label: "Wiki Link",
        icon: "[[]]",
        action: () => {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to);
          const title = window.prompt("Article title to link:", selectedText || "");
          if (title) {
            const label = selectedText && selectedText !== title ? selectedText : null;
            editor
              .chain()
              .focus()
              .deleteRange({ from, to })
              .insertContent({ type: "wikiLink", attrs: { title, label } })
              .run();
          }
        },
      },
    ],
    [
      {
        label: "Insert Table",
        icon: "Table",
        action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      },
      {
        label: "Add Row",
        icon: "+Row",
        action: () => editor.chain().focus().addRowAfter().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Add Column",
        icon: "+Col",
        action: () => editor.chain().focus().addColumnAfter().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Delete Row",
        icon: "-Row",
        action: () => editor.chain().focus().deleteRow().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Delete Column",
        icon: "-Col",
        action: () => editor.chain().focus().deleteColumn().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Merge Cells",
        icon: "Merge",
        action: () => editor.chain().focus().mergeCells().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Split Cell",
        icon: "Split",
        action: () => editor.chain().focus().splitCell().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Toggle Header Row",
        icon: "HRow",
        action: () => editor.chain().focus().toggleHeaderRow().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Toggle Header Column",
        icon: "HCol",
        action: () => editor.chain().focus().toggleHeaderColumn().run(),
        hidden: () => !editor.isActive("table"),
      },
      {
        label: "Delete Table",
        icon: "xTable",
        action: () => editor.chain().focus().deleteTable().run(),
        hidden: () => !editor.isActive("table"),
      },
    ],
    [
      {
        label: "Insert date",
        icon: "Date",
        action: () => {
          const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          editor.chain().focus().insertContent(date).run();
        },
      },
    ],
    [
      {
        label: "Insert math formula (KaTeX)",
        icon: "Σ",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        action: () => (editor.chain().focus() as any).insertBlockMath().run(),
      },
    ],
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 py-0.5">
      {groups.map((group, gi) => (
        <div key={gi} className="flex gap-px">
          {group.map((btn) => {
            if (btn.hidden?.()) return null;
            return (
              <button
                key={btn.label}
                type="button"
                onClick={btn.action}
                title={btn.label}
                className={`px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                  btn.isActive?.()
                    ? "bg-accent text-white"
                    : "text-foreground hover:bg-surface hover:text-accent"
                }`}
              >
                {btn.icon}
              </button>
            );
          })}
          {gi < groups.length - 1 && (
            <div className="mx-1 w-px bg-border" />
          )}
        </div>
      ))}
      <div className="mx-1 w-px bg-border" />
      <button
        type="button"
        onClick={onDetectLinks}
        title="Detect potential wiki links in text"
        className="px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-surface hover:text-accent transition-colors"
      >
        Detect Links{detectedLinkCount > 0 && ` (${detectedLinkCount})`}
      </button>
      <button
        type="button"
        onClick={onInsertToc}
        title="Insert table of contents from headings"
        className="px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-surface hover:text-accent transition-colors"
      >
        TOC
      </button>
      <button
        type="button"
        onClick={onAiRewrite}
        title="AI rewrite: select text first, then click to rewrite it"
        className="px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-surface hover:text-accent transition-colors"
      >
        AI Rewrite
      </button>
      <button
        type="button"
        onClick={onAiExpand}
        title="AI expand: select a paragraph first, then click to expand it"
        className="px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-surface hover:text-accent transition-colors"
      >
        AI Expand
      </button>
      <button
        type="button"
        onClick={onAiGenerate}
        title="AI Generate: generates full article body from existing headings"
        className="px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-surface hover:text-accent transition-colors"
      >
        AI Generate
      </button>
      <button
        type="button"
        onClick={onFindReplace}
        title="Find & replace (Ctrl+H)"
        className="px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-surface hover:text-accent transition-colors"
      >
        Find
      </button>
      <button
        type="button"
        onClick={onTypewriterToggle}
        title="Typewriter mode — keeps cursor vertically centred"
        className={`px-1.5 py-0.5 text-[11px] font-medium transition-colors ${typewriterMode ? "bg-accent text-white" : "text-foreground hover:bg-surface hover:text-accent"}`}
      >
        Typewriter
      </button>
      <button
        type="button"
        onClick={() => alert("Shortcuts:\n\nCtrl+B \u2014 Bold\nCtrl+I \u2014 Italic\nCtrl+Z \u2014 Undo\nCtrl+Y \u2014 Redo\nCtrl+Shift+L \u2014 Wiki Link\nCtrl+Shift+F \u2014 Footnote\n[[…]] \u2014 Auto wiki link")}
        title="Editor keyboard shortcuts"
        className="px-1.5 py-0.5 text-[11px] font-medium text-muted hover:bg-surface hover:text-accent transition-colors"
      >
        ?
      </button>
      <div className="mx-1 w-px bg-border" />
      {/* Claim markers */}
      {(["certain", "probable", "disputed"] as ClaimLevel[]).map((level) => {
        const colors: Record<ClaimLevel, string> = {
          certain: "text-green-600 hover:bg-green-50",
          probable: "text-yellow-600 hover:bg-yellow-50",
          disputed: "text-red-600 hover:bg-red-50",
        };
        const labels: Record<ClaimLevel, string> = {
          certain: "Certain",
          probable: "Probable",
          disputed: "Disputed",
        };
        const isActive = editor.isActive("claimMark", { level });
        return (
          <button
            key={level}
            type="button"
            onClick={() => (editor.chain().focus() as ReturnType<typeof editor.chain>).toggleClaim(level).run()}
            title={`Mark selection as ${level} claim`}
            className={`px-1.5 py-0.5 text-[10px] font-bold border rounded transition-colors ${
              isActive
                ? `border-current bg-current/10 ${colors[level]}`
                : `border-transparent ${colors[level]}`
            }`}
          >
            {labels[level]}
          </button>
        );
      })}
      <div className="mx-1 w-px bg-border" />
      <HighlightColorPicker editor={editor} />
      <VoiceDictationButton editor={editor} />
    </div>
  );
}
