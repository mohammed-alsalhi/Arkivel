import type { ModuleDefinition } from "../types";

const collections: ModuleDefinition = {
  id: "collections",
  name: "collections",
  description:
    "the generic database engine: collections with typed properties, items that can be pages, and table views. tasks, reading lists, and trackers are templates on it.",
  routes: ["/collections", "/api/collections"],
  nav: [{ label: "collections", href: "/collections", icon: "table", section: "library", order: 25 }],
  commands: [
    { label: "collections", href: "/collections", keywords: ["database", "table", "tasks", "tracker"] },
    { label: "new collection", href: "/collections?new=1", keywords: ["create", "database", "tasks"], requires: "member" },
  ],
  docs: {
    help: "open [collections](/collections) for tasks, reading lists, and any table of typed properties; items can be pages.",
    features: [
      "collections — a small database engine: define properties (text, number, select, date, checkbox, url, person, page, relation), add items, and work in a fixed-row table view; the tasks starter kit is one template on it.",
    ],
  },
  defaultEnabled: true,
};

export default collections;
