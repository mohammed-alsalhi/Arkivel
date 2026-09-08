import { Node, Mark } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockMath: { insertBlockMath: () => ReturnType };
  }
}

/**
 * KaTeX inline math: $...$
 * Stores raw LaTeX in attr and renders as <span data-katex-inline="...">
 */
export const InlineMath = Mark.create({
  name: "inlineMath",

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-katex-inline]", getAttrs: (el) => ({ latex: (el as HTMLElement).dataset.katexInline || "" }) }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", { "data-katex-inline": HTMLAttributes.latex, class: "math-inline" }, 0];
  },
});

/**
 * KaTeX block math: $$...$$
 * Renders as <div data-katex-block="...">
 */
export const BlockMath = Node.create({
  name: "blockMath",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-katex-block]", getAttrs: (el) => ({ latex: (el as HTMLElement).dataset.katexBlock || "" }) }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-katex-block": HTMLAttributes.latex, class: "math-block" }];
  },

  addCommands() {
    return {
      insertBlockMath:
        () =>
        ({ commands }) => {
          const latex = prompt("Enter LaTeX expression:");
          if (!latex) return false;
          return commands.insertContent({ type: this.name, attrs: { latex } });
        },
    };
  },
});
