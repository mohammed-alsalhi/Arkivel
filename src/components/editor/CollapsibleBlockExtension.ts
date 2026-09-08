import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    collapsibleBlock: {
      /**
       * Insert a collapsible block at the current position.
       */
      insertCollapsibleBlock: () => ReturnType;
      /**
       * Toggle a collapsible block.
       */
      toggleCollapsibleBlock: () => ReturnType;
    };
  }
}

export const CollapsibleBlock = Node.create({
  name: "collapsibleBlock",

  group: "block",

  content: "block+",

  defining: true,

  addAttributes() {
    return {
      summary: {
        default: "Click to expand",
        parseHTML: (element: HTMLElement) => {
          const summaryEl = element.querySelector("summary");
          return summaryEl?.textContent || "Click to expand";
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "details",
        getAttrs: (el) => {
          const element = el as HTMLElement;
          const summaryEl = element.querySelector("summary");
          return {
            summary: summaryEl?.textContent || "Click to expand",
          };
        },
        // Strip <summary> from the content so it is not parsed as a child block
        contentElement: (node) => {
          const element = node as HTMLElement;
          // Create a wrapper that excludes the summary element
          const wrapper = document.createElement("div");
          Array.from(element.childNodes).forEach((child) => {
            if (
              child instanceof HTMLElement &&
              child.tagName.toLowerCase() === "summary"
            ) {
              return;
            }
            wrapper.appendChild(child.cloneNode(true));
          });
          // If there are no content nodes after stripping summary, add a paragraph
          if (wrapper.childNodes.length === 0) {
            wrapper.innerHTML = "<p></p>";
          }
          return wrapper;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(HTMLAttributes, { class: "collapsible-block" }),
      ["summary", {}, node.attrs.summary],
      ["div", { class: "collapsible-content" }, 0],
    ];
  },

  addCommands() {
    return {
      insertCollapsibleBlock:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { summary: "Click to expand" },
              content: [
                {
                  type: "paragraph",
                },
              ],
            })
            .run();
        },
      toggleCollapsibleBlock:
        () =>
        ({ commands, state }) => {
          const { $from } = state.selection;

          // Check if we are inside a collapsible block
          for (let depth = $from.depth; depth > 0; depth--) {
            if ($from.node(depth).type.name === this.name) {
              // Lift content out of the collapsible block
              return commands.lift(this.name);
            }
          }

          // Otherwise insert a new one
          return commands.insertCollapsibleBlock();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-t": () => this.editor.commands.toggleCollapsibleBlock(),
    };
  },
});
