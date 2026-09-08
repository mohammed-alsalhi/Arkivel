/**
 * The built-in starter kits. Pure data plus pure helpers; the database work
 * lives in `./apply` and the status computation in `./status`.
 */
import { MODULE_IDS } from "@/modules/registry";
import type { KitCollection, KitDefinition, KitId } from "./types";

export type * from "./types";
export { kitCollectionSlug, kitStatus } from "./status";

function daysFromNow(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const tasksCollection: KitCollection = {
  template: "tasks",
  name: "tasks",
  views: [{ kind: "table" }, { kind: "board", groupBy: "status" }],
  items: [
    {
      title: "write the welcome page",
      properties: { status: "todo", priority: "high", due: daysFromNow(3), notes: "how to log in, where the spaces are, how to make a first page." },
    },
    {
      title: "review last week's meeting notes",
      properties: { status: "in_progress", priority: "medium", due: daysFromNow(1), notes: "pull the decisions out into their own pages." },
    },
    {
      title: "tag the untagged pages",
      properties: { status: "todo", priority: "low", due: daysFromNow(7) },
    },
    {
      title: "set up the reading list",
      properties: { status: "done", priority: "low", due: daysFromNow(-2), notes: "done — see the reading list collection." },
    },
  ],
};

const readingListCollection: KitCollection = {
  template: "reading_list",
  name: "reading list",
  views: [{ kind: "table" }],
  items: [
    { title: "How to Take Smart Notes", properties: { status: "reading", author: "Sönke Ahrens" } },
    {
      title: "Working in Public",
      properties: { status: "to_read", author: "Nadia Eghbal", url: "https://press.stripe.com/working-in-public" },
    },
  ],
};

export const KITS: readonly KitDefinition[] = [
  {
    id: "wiki",
    name: "wiki",
    description: "a personal or public wiki: pages, links, the graph, feeds, share links, and the public api. no collections.",
    modules: ["graph", "api", "feeds", "share"],
    skin: "wiki",
    collections: [],
  },
  {
    id: "notes-and-tasks",
    name: "notes and tasks",
    description: "notes plus a tasks board and a reading list on the collections engine, with the graph for the notes.",
    modules: ["collections", "graph"],
    skin: "folio",
    collections: [tasksCollection, readingListCollection],
  },
  {
    id: "team-knowledge-base",
    name: "team knowledge base",
    description: "every module on, with an empty tasks collection to start from.",
    modules: [...MODULE_IDS],
    skin: "folio",
    collections: [{ ...tasksCollection, items: [] }],
  },
  {
    id: "course-workspace",
    name: "course workspace",
    description: "linked course hubs and coursework, with deadline views and repeatable course-sync imports.",
    modules: ["collections", "graph", "import", "export"],
    skin: "folio",
    collections: [
      { template: "courses", name: "courses" },
      { template: "coursework", name: "coursework", relations: { course: "courses" }, views: [
        { kind: "table" }, { kind: "board", groupBy: "status" }, { kind: "list" }, { kind: "calendar", groupBy: "due" },
      ] },
    ],
  },
];

export const KIT_IDS: readonly KitId[] = KITS.map((kit) => kit.id);

export function isKitId(value: unknown): value is KitId {
  return typeof value === "string" && (KIT_IDS as readonly string[]).includes(value);
}

export function getKit(id: unknown): KitDefinition | undefined {
  return KITS.find((kit) => kit.id === id);
}
