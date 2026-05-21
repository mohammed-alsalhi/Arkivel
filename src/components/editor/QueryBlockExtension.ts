import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    queryBlock: {
      insertQueryBlock: (query?: string) => ReturnType;
    };
  }
}

export const QueryBlock = Node.create({
  name: "queryBlock",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      query: {
        default: "FROM * SORT updatedAt LIMIT 10 AS LIST",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-query-block") || "FROM * SORT updatedAt LIMIT 10 AS LIST",
        renderHTML: (attributes) => ({
          "data-query-block": attributes.query,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-query-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "query-block-placeholder",
        contenteditable: "false",
      }),
      `[Query: ${HTMLAttributes["data-query-block"]}]`,
    ];
  },

  addCommands() {
    return {
      insertQueryBlock:
        (query = "FROM * SORT updatedAt LIMIT 10 AS LIST") =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { query },
            })
            .run();
        },
    };
  },
});
