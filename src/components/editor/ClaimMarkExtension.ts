import { Mark, mergeAttributes } from "@tiptap/core";

export type ClaimLevel = "certain" | "probable" | "disputed";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    claimMark: {
      setClaim: (level: ClaimLevel) => ReturnType;
      unsetClaim: () => ReturnType;
      toggleClaim: (level: ClaimLevel) => ReturnType;
    };
  }
}

export const ClaimMarkExtension = Mark.create({
  name: "claimMark",

  addAttributes() {
    return {
      level: {
        default: "probable",
        parseHTML: (element) => element.getAttribute("data-claim"),
        renderHTML: (attributes) => ({ "data-claim": attributes.level }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-claim]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setClaim:
        (level: ClaimLevel) =>
        ({ commands }) =>
          commands.setMark(this.name, { level }),
      unsetClaim:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
      toggleClaim:
        (level: ClaimLevel) =>
        ({ commands }) =>
          commands.toggleMark(this.name, { level }),
    };
  },
});
