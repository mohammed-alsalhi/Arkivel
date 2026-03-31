import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import type { Range } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";

export type SlashCommandItem = {
  title: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
};

const slashCommandPluginKey = new PluginKey("slashCommand");

export type SnippetItem = { id: string; name: string; content: string };

export function getSuggestionItems(
  { query }: { query: string },
  snippets: SnippetItem[] = []
): SlashCommandItem[] {
  const items: SlashCommandItem[] = [
    {
      title: "Heading 1",
      description: "Large section heading",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Unordered list with bullet points",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Ordered List",
      description: "Numbered list",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Blockquote",
      description: "Block quotation",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code Block",
      description: "Syntax-highlighted code block",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Horizontal Rule",
      description: "Visual divider between sections",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: "Table",
      description: "Insert a table with 3 columns and 3 rows",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    },
    {
      title: "Callout",
      description: "Highlighted callout block for important info",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBlockquote()
          .run();
        // Apply callout class via DOM after blockquote is created
        const { state } = editor;
        const pos = state.selection.$from;
        const blockquoteNode = pos.node(pos.depth - 1);
        if (blockquoteNode?.type.name === "blockquote") {
          editor.view.dispatch(
            state.tr.setNodeAttribute(pos.before(pos.depth), "class", "callout")
          );
        }
      },
    },
    {
      title: "Collapsible Block",
      description: "Toggle block that can be expanded/collapsed",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertCollapsibleBlock()
          .run();
      },
    },
    {
      title: "Mermaid Diagram",
      description: "Flowchart, sequence diagram, or Gantt chart",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertMermaidBlock().run();
      },
    },
    {
      title: "Math (KaTeX)",
      description: "LaTeX block math equation",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertBlockMath().run();
      },
    },
    {
      title: "Data Table",
      description: "Sortable/filterable table from CSV or JSON",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertDataTable().run();
      },
    },
    {
      title: "Decision Tree",
      description: "Interactive branching decision flowchart",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertDecisionTree().run();
      },
    },
    {
      title: "Pull Quote",
      description: "Large styled pull quote for emphasis",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).togglePullQuote().run();
      },
    },
    {
      title: "Accordion / FAQ",
      description: "Collapsible question-and-answer block",
      command: ({ editor, range }) => {
        const question = typeof window !== "undefined"
          ? (window.prompt("Question / heading:", "") ?? "")
          : "";
        editor.chain().focus().deleteRange(range).insertContent(
          `<details class="wiki-accordion"><summary>${question || "Click to expand"}</summary><p>Answer here…</p></details><p></p>`
        ).run();
      },
    },
    {
      title: "Two-Column Layout",
      description: "Side-by-side two-column block",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent(
          `<div class="wiki-2col"><div class="wiki-2col-left"><p>Left column…</p></div><div class="wiki-2col-right"><p>Right column…</p></div></div><p></p>`
        ).run();
      },
    },
    {
      title: "YouTube / Video Embed",
      description: "Embed a YouTube or Vimeo video",
      command: ({ editor, range }) => {
        const url = typeof window !== "undefined"
          ? (window.prompt("YouTube or Vimeo URL:", "") ?? "")
          : "";
        if (!url.trim()) return;
        // Convert watch URL to embed URL
        let embedUrl = url.trim();
        const ytMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vimeoMatch = embedUrl.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        editor.chain().focus().deleteRange(range).insertContent(
          `<div class="wiki-embed-video"><iframe src="${embedUrl}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div><p></p>`
        ).run();
      },
    },
    {
      title: "Vertical Timeline",
      description: "Chronological timeline with dates and events",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent(
          `<div class="wiki-timeline"><div class="wiki-timeline-entry"><div class="wiki-timeline-date">Date</div><div class="wiki-timeline-body"><p>Event description</p></div></div><div class="wiki-timeline-entry"><div class="wiki-timeline-date">Date</div><div class="wiki-timeline-body"><p>Event description</p></div></div></div><p></p>`
        ).run();
      },
    },
    {
      title: "Twitter / X Post",
      description: "Embed a tweet or X post by URL",
      command: ({ editor, range }) => {
        const url = typeof window !== "undefined"
          ? (window.prompt("Twitter/X post URL:", "") ?? "")
          : "";
        if (!url.trim()) return;
        editor.chain().focus().deleteRange(range).insertContent(
          `<div class="wiki-tweet"><div class="wiki-tweet-header">Post on X</div><a href="${url.trim()}" target="_blank" rel="noopener noreferrer" class="wiki-tweet-link">${url.trim()}</a></div><p></p>`
        ).run();
      },
    },
    {
      title: "GitHub Gist Embed",
      description: "Embed a GitHub Gist",
      command: ({ editor, range }) => {
        const gistUrl = typeof window !== "undefined"
          ? (window.prompt("GitHub Gist URL (e.g. https://gist.github.com/user/abc123):", "") ?? "")
          : "";
        if (!gistUrl.trim()) return;
        const gistId = gistUrl.replace(/.*\//, "").split("#")[0];
        editor.chain().focus().deleteRange(range).insertContent(
          `<div class="wiki-gist" data-gist-id="${gistId}" data-gist-url="${gistUrl.trim()}"><a href="${gistUrl.trim()}" target="_blank" rel="noopener">View Gist: ${gistId}</a></div><p></p>`
        ).run();
      },
    },
    {
      title: "Tabs",
      description: "Tabbed content block with multiple panels",
      command: ({ editor, range }) => {
        const tab1 = typeof window !== "undefined"
          ? (window.prompt("First tab label:", "Tab 1") ?? "Tab 1")
          : "Tab 1";
        const tab2 = typeof window !== "undefined"
          ? (window.prompt("Second tab label:", "Tab 2") ?? "Tab 2")
          : "Tab 2";
        editor.chain().focus().deleteRange(range).insertContent(
          `<div class="wiki-tabs" data-tabs="true"><div class="wiki-tabs-nav"><button class="wiki-tab-btn active" data-tab="0">${tab1 || "Tab 1"}</button><button class="wiki-tab-btn" data-tab="1">${tab2 || "Tab 2"}</button></div><div class="wiki-tab-panel active" data-panel="0"><p>Content for ${tab1 || "Tab 1"}…</p></div><div class="wiki-tab-panel" data-panel="1"><p>Content for ${tab2 || "Tab 2"}…</p></div></div><p></p>`
        ).run();
      },
    },
    {
      title: "Gallery",
      description: "Responsive image grid gallery",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent(
          `<div class="wiki-gallery"><div class="wiki-gallery-item"><img src="" alt="Image 1" /><div class="wiki-gallery-caption">Caption 1</div></div><div class="wiki-gallery-item"><img src="" alt="Image 2" /><div class="wiki-gallery-caption">Caption 2</div></div><div class="wiki-gallery-item"><img src="" alt="Image 3" /><div class="wiki-gallery-caption">Caption 3</div></div></div><p></p>`
        ).run();
      },
    },
  ];

  // Append user snippets as slash-command items
  for (const s of snippets) {
    items.push({
      title: `Snippet: ${s.name}`,
      description: s.content.replace(/<[^>]+>/g, " ").trim().slice(0, 60),
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).insertContent(s.content).run();
      },
    });
  }

  if (!query) return items;

  const lower = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower)
  );
}

/** Factory: returns a getSuggestionItems function bound to the given snippets list. */
export function makeGetSuggestionItems(snippets: SnippetItem[]) {
  return (props: { query: string }) => getSuggestionItems(props, snippets);
}

export const SlashCommandExtension = Extension.create<{
  suggestion: Partial<SuggestionOptions<SlashCommandItem>>;
}>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        pluginKey: slashCommandPluginKey,
        items: getSuggestionItems,
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
