import { Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    dataTable: { insertDataTable: () => ReturnType };
  }
}

/**
 * DataTableExtension — block node that stores CSV/JSON source.
 * Renders as <div data-table="..."> in HTML (base64-encoded source).
 */
export const DataTable = Node.create({
  name: "dataTable",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      source: { default: "" },    // CSV or JSON string
      sourceType: { default: "csv" }, // "csv" | "json"
    };
  },

  parseHTML() {
    return [{
      tag: "div[data-table]",
      getAttrs: (el) => {
        const el2 = el as HTMLElement;
        return {
          source: atob(el2.dataset.table || ""),
          sourceType: el2.dataset.tableType || "csv",
        };
      },
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        "data-table": btoa(unescape(encodeURIComponent(HTMLAttributes.source || ""))),
        "data-table-type": HTMLAttributes.sourceType || "csv",
        class: "data-table-block",
      },
    ];
  },

  addCommands() {
    return {
      insertDataTable:
        () =>
        ({ commands }) => {
          const source = prompt("Paste CSV or JSON data:");
          if (!source) return false;
          const sourceType = source.trim().startsWith("[") || source.trim().startsWith("{") ? "json" : "csv";
          return commands.insertContent({ type: this.name, attrs: { source, sourceType } });
        },
    };
  },
});
