import { Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    decisionTree: { insertDecisionTree: () => ReturnType };
  }
}

export interface DecisionTreeNode {
  label: string;
  yes?: DecisionTreeNode;
  no?: DecisionTreeNode;
}

/**
 * DecisionTreeExtension — block node storing a decision tree as JSON.
 * Renders as <div data-decision-tree="..."> in HTML.
 */
export const DecisionTree = Node.create({
  name: "decisionTree",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      tree: {
        default: JSON.stringify({ label: "Question?", yes: { label: "Yes outcome" }, no: { label: "No outcome" } }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-decision-tree]", getAttrs: (el) => ({ tree: (el as HTMLElement).dataset.decisionTree || "{}" }) }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { "data-decision-tree": HTMLAttributes.tree, class: "decision-tree-block" }];
  },

  addCommands() {
    return {
      insertDecisionTree:
        () =>
        ({ commands }) => {
          const root: DecisionTreeNode = { label: "Question?", yes: { label: "Yes" }, no: { label: "No" } };
          return commands.insertContent({ type: this.name, attrs: { tree: JSON.stringify(root) } });
        },
    };
  },
});
