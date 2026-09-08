import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pullQuote: {
      setPullQuote: () => ReturnType;
      togglePullQuote: () => ReturnType;
    };
  }
}

export const PullQuote = Node.create({
  name: "pullQuote",
  group: "block",
  content: "inline*",
  marks: "",
  defining: true,

  parseHTML() {
    return [{ tag: "blockquote[data-pull-quote]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["blockquote", mergeAttributes(HTMLAttributes, { "data-pull-quote": "" }), 0];
  },

  addCommands() {
    return {
      setPullQuote:
        () =>
        ({ commands }) =>
          commands.wrapIn(this.name),
      togglePullQuote:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-Q": () => this.editor.commands.togglePullQuote(),
    };
  },
});
