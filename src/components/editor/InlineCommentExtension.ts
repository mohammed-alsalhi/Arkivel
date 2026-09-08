import { Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineComment: {
      /**
       * Set an inline comment on the current selection.
       */
      setInlineComment: (attrs: {
        comment: string;
        author?: string;
      }) => ReturnType;
      /**
       * Remove inline comment from the current selection.
       */
      unsetInlineComment: () => ReturnType;
    };
  }
}

export const InlineComment = Mark.create({
  name: "inlineComment",

  addAttributes() {
    return {
      comment: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-comment") || "",
        renderHTML: (attributes: Record<string, string>) => ({
          "data-comment": attributes.comment,
        }),
      },
      author: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-comment-author") || "",
        renderHTML: (attributes: Record<string, string>) => ({
          "data-comment-author": attributes.author,
        }),
      },
      createdAt: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-comment-created") || "",
        renderHTML: (attributes: Record<string, string>) => ({
          "data-comment-created": attributes.createdAt,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-comment]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "inline-comment",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setInlineComment:
        (attrs) =>
        ({ commands }) => {
          return commands.setMark(this.name, {
            comment: attrs.comment,
            author: attrs.author || "",
            createdAt: new Date().toISOString(),
          });
        },
      unsetInlineComment:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
