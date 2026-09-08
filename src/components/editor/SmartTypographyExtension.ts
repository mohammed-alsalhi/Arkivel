import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/**
 * SmartTypography — converts plain text patterns to typographic equivalents
 * as the user types:
 *   --   →  — (em dash)
 *   ...  →  … (ellipsis)
 *   "    →  " " (curly double quotes, context-aware)
 *   '    →  ' ' (curly single quotes / apostrophe, context-aware)
 */
export const SmartTypography = Extension.create({
  name: "smartTypography",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("smartTypography"),
        props: {
          handleTextInput(view, from, to, text) {
            const { state } = view;
            const $from = state.doc.resolve(from);
            if (!$from.parent.isTextblock) return false;

            // Get text before cursor in current text block
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 3),
              $from.parentOffset,
              null,
              "\ufffc"
            );

            let replacement: string | null = null;

            // -- → em dash
            if (text === "-" && textBefore.endsWith("-")) {
              replacement = "—";
              const tr = state.tr.delete(from - 1, to).insertText(replacement, from - 1);
              view.dispatch(tr);
              return true;
            }

            // ... → ellipsis
            if (text === "." && textBefore.endsWith("..")) {
              replacement = "…";
              const tr = state.tr.delete(from - 2, to).insertText(replacement, from - 2);
              view.dispatch(tr);
              return true;
            }

            // Curly double quotes
            if (text === '"') {
              // Open if preceded by space, start, or opening bracket; else close
              const isOpen = /[\s\u0000\(\[\{]$/.test(textBefore) || textBefore === "";
              replacement = isOpen ? "\u201C" : "\u201D";
            }

            // Curly single quotes / apostrophe
            if (text === "'") {
              const isOpen = /[\s\u0000\(\[\{]$/.test(textBefore) || textBefore === "";
              replacement = isOpen ? "\u2018" : "\u2019";
            }

            if (replacement) {
              const tr = state.tr.delete(from, to).insertText(replacement, from);
              view.dispatch(tr);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});
