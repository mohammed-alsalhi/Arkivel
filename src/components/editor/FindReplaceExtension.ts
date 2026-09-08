import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const findReplaceKey = new PluginKey("findReplace");

export const FindReplace = Extension.create({
  name: "findReplace",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: findReplaceKey,
        state: {
          init() {
            return { decorations: DecorationSet.empty, query: "" };
          },
          apply(tr, prev) {
            const meta = tr.getMeta(findReplaceKey);
            if (meta !== undefined) {
              const { query } = meta as { query: string };
              if (!query) return { decorations: DecorationSet.empty, query: "" };

              const decorations: Decoration[] = [];
              const doc = tr.doc;
              const lq = query.toLowerCase();

              doc.descendants((node, pos) => {
                if (!node.isText || !node.text) return;
                const text = node.text.toLowerCase();
                let index = text.indexOf(lq);
                while (index !== -1) {
                  decorations.push(
                    Decoration.inline(pos + index, pos + index + lq.length, {
                      class: "find-highlight",
                    })
                  );
                  index = text.indexOf(lq, index + 1);
                }
              });

              return {
                query,
                decorations: DecorationSet.create(doc, decorations),
              };
            }
            // Remap decorations on doc change
            return {
              ...prev,
              decorations: prev.decorations.map(tr.mapping, tr.doc),
            };
          },
        },
        props: {
          decorations(state) {
            return findReplaceKey.getState(state)?.decorations ?? DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
