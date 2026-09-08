import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaidBlock: { insertMermaidBlock: () => ReturnType };
  }
}

/**
 * MermaidExtension — a CodeBlockLowlight variant that sets language to "mermaid"
 * and adds a data-mermaid attribute for client-side rendering on display.
 */
export const MermaidBlock = CodeBlockLowlight.extend({
  name: "mermaidBlock",

  addAttributes() {
    return {
      ...this.parent?.(),
      language: { default: "mermaid" },
      "data-mermaid": { default: "true", renderHTML: () => ({ "data-mermaid": "true" }) },
    };
  },

  addCommands() {
    return {
      insertMermaidBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { language: "mermaid", "data-mermaid": "true" },
            content: [{ type: "text", text: "graph TD\n  A[Start] --> B[End]" }],
          });
        },
    };
  },
});
