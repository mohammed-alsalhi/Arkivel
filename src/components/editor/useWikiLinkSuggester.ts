import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Editor } from "@tiptap/react";
import { useState, useEffect, useCallback } from "react";

type SuggesterState = {
  active: boolean;
  query: string;
  range: { from: number; to: number };
  position: { top: number; left: number };
};

const suggesterKey = new PluginKey("wikiLinkSuggester");

export function useWikiLinkSuggester(editor: Editor | null) {
  const [state, setState] = useState<SuggesterState>({
    active: false,
    query: "",
    range: { from: 0, to: 0 },
    position: { top: 0, left: 0 },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const plugin = new Plugin({
      key: suggesterKey,
      view() {
        return {
          update(view) {
            const { state: editorState } = view;
            const { selection } = editorState;

            if (!selection.empty) {
              setState((s) => (s.active ? { ...s, active: false } : s));
              return;
            }

            const $pos = selection.$from;
            const textBefore = $pos.parent.textBetween(
              0,
              $pos.parentOffset,
              undefined,
              "\ufffc"
            );

            const triggerIndex = textBefore.lastIndexOf("[[");
            if (
              triggerIndex === -1 ||
              textBefore.indexOf("]]", triggerIndex) !== -1
            ) {
              setState((s) => (s.active ? { ...s, active: false } : s));
              return;
            }

            const query = textBefore.slice(triggerIndex + 2);
            if (query.includes("\n") || query.length > 100) {
              setState((s) => (s.active ? { ...s, active: false } : s));
              return;
            }

            const absoluteFrom = $pos.start() + triggerIndex;
            const absoluteTo = $pos.start() + $pos.parentOffset;

            const coords = view.coordsAtPos(absoluteTo);

            setState({
              active: true,
              query,
              range: { from: absoluteFrom, to: absoluteTo },
              position: { top: coords.bottom, left: coords.left },
            });
          },
        };
      },
    });

    editor.registerPlugin(plugin);
    return () => {
      editor.unregisterPlugin(suggesterKey);
    };
  }, [editor]);

  const selectItem = useCallback(
    (title: string) => {
      if (!editor || !state.active) return;
      editor
        .chain()
        .focus()
        .deleteRange({ from: state.range.from, to: state.range.to })
        .insertContent({ type: "wikiLink", attrs: { title } })
        .run();
      setState((s) => ({ ...s, active: false }));
    },
    [editor, state.active, state.range]
  );

  const dismiss = useCallback(() => {
    setState((s) => (s.active ? { ...s, active: false } : s));
  }, []);

  return { ...state, selectItem, dismiss };
}
