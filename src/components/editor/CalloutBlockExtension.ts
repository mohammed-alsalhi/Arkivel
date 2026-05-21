import { Node, mergeAttributes, InputRule } from "@tiptap/core";

export type CalloutType = "note" | "tip" | "warning" | "important" | "quote";

const CALLOUT_LABELS: Record<CalloutType, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  important: "Important",
  quote: "Quote",
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    calloutBlock: {
      insertCallout: (type?: CalloutType) => ReturnType;
      setCalloutType: (type: CalloutType) => ReturnType;
    };
  }
}

export const CalloutBlock = Node.create({
  name: "calloutBlock",

  group: "block",

  content: "block+",

  defining: true,

  addAttributes() {
    return {
      type: {
        default: "note" as CalloutType,
        parseHTML: (element: HTMLElement) =>
          (element.getAttribute("data-callout-type") as CalloutType) || "note",
        renderHTML: (attributes) => ({ "data-callout-type": attributes.type }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-callout-type]",
        getAttrs: (el) => {
          const element = el as HTMLElement;
          return {
            type: element.getAttribute("data-callout-type") as CalloutType || "note",
          };
        },
        contentElement: (node) => {
          const el = node as HTMLElement;
          const body = el.querySelector(".callout-body");
          if (body) return body as HTMLElement;
          // Strip the title div so it's not parsed as content
          const clone = el.cloneNode(true) as HTMLElement;
          clone.querySelector(".callout-title")?.remove();
          return clone;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type as CalloutType;
    const label = CALLOUT_LABELS[type] || "Note";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: `callout callout-${type}`,
        "data-callout-type": type,
      }),
      ["div", { class: "callout-title", contenteditable: "false" }, `[!${label.toUpperCase()}]`],
      ["div", { class: "callout-body" }, 0],
    ];
  },

  addCommands() {
    return {
      insertCallout:
        (type: CalloutType = "note") =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { type },
              content: [{ type: "paragraph" }],
            })
            .run();
        },
      setCalloutType:
        (type: CalloutType) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { type });
        },
    };
  },

  addInputRules() {
    // > [!NOTE] → insert a note callout
    const types: CalloutType[] = ["note", "tip", "warning", "important", "quote"];
    return types.map((type) =>
      new InputRule({
        find: new RegExp(`^>\\s*\\[!${type.toUpperCase()}\\]\\s$`),
        handler: ({ range, chain }) => {
          chain()
            .deleteRange(range)
            .insertCallout(type)
            .run();
        },
      })
    );
  },
});
