import { Node, mergeAttributes } from "@tiptap/react";

/**
 * FootnoteRef — inline atom node rendered as superscript [N].
 * Stores the footnote text content in the `note` attribute.
 * Numbering is handled by CSS counters (both in editor and display).
 */
export const FootnoteRef = Node.create({
  name: "footnoteRef",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      note: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-footnote]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "sup",
      mergeAttributes(HTMLAttributes, {
        "data-footnote": node.attrs.note,
        class: "footnote-ref",
        title: node.attrs.note,
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-F": () => {
        const note = window.prompt("Footnote text:");
        if (note) {
          this.editor.chain().focus().insertContent({
            type: "footnoteRef",
            attrs: { note },
          }).run();
        }
        return true;
      },
    };
  },
});
