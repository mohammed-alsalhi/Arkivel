import { Mark, mergeAttributes } from "@tiptap/core";

export const PotentialLink = Mark.create({
  name: "potentialLink",

  addAttributes() {
    return {
      title: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-suggest-title]",
        getAttrs: (el) => ({
          title: (el as HTMLElement).getAttribute("data-suggest-title"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({
        class: "potential-link",
        "data-suggest-title": HTMLAttributes.title,
      }),
      0,
    ];
  },
});
