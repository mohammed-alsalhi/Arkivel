import type { PropertySchema, ViewConfig } from "./properties";
import { defaultViewFor } from "./properties";

export type TemplateId = "blank" | "tasks" | "reading_list" | "simple_table";

export type CollectionTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  schema: PropertySchema;
  views: { name: string; slug: string; kind: "table"; config: ViewConfig; isDefault: boolean }[];
};

function tableView(schema: PropertySchema, config?: Partial<ViewConfig>): CollectionTemplate["views"] {
  return [{ name: "table", slug: "table", kind: "table", isDefault: true, config: { ...defaultViewFor(schema), ...config } }];
}

const tasksSchema: PropertySchema = [
  { id: "title", name: "task", type: "title" },
  {
    id: "status",
    name: "status",
    type: "select",
    options: [
      { id: "todo", label: "todo", tone: "default" },
      { id: "in_progress", label: "in progress", tone: "info" },
      { id: "done", label: "done", tone: "success" },
    ],
  },
  { id: "due", name: "due", type: "date" },
  {
    id: "priority",
    name: "priority",
    type: "select",
    options: [
      { id: "low", label: "low", tone: "default" },
      { id: "medium", label: "medium", tone: "warning" },
      { id: "high", label: "high", tone: "danger" },
    ],
  },
  { id: "assignee", name: "assignee", type: "person" },
  { id: "notes", name: "notes", type: "text" },
];

const readingListSchema: PropertySchema = [
  { id: "title", name: "title", type: "title" },
  {
    id: "status",
    name: "status",
    type: "select",
    options: [
      { id: "to_read", label: "to read", tone: "default" },
      { id: "reading", label: "reading", tone: "info" },
      { id: "read", label: "read", tone: "success" },
    ],
  },
  { id: "url", name: "url", type: "url" },
  { id: "author", name: "author", type: "text" },
  { id: "rating", name: "rating", type: "number" },
];

const simpleTableSchema: PropertySchema = [
  { id: "title", name: "name", type: "title" },
  { id: "text", name: "text", type: "text" },
  { id: "number", name: "number", type: "number" },
  { id: "done", name: "done", type: "checkbox" },
];

const blankSchema: PropertySchema = [{ id: "title", name: "name", type: "title" }];

export const COLLECTION_TEMPLATES: readonly CollectionTemplate[] = [
  { id: "blank", name: "blank", description: "a title column; add properties as you go.", schema: blankSchema, views: tableView(blankSchema) },
  {
    id: "tasks",
    name: "tasks",
    description: "status, due date, priority, assignee, notes.",
    schema: tasksSchema,
    views: tableView(tasksSchema, { sorts: [{ property: "due", direction: "asc" }] }),
  },
  {
    id: "reading_list",
    name: "reading list",
    description: "status, link, author, rating.",
    schema: readingListSchema,
    views: tableView(readingListSchema),
  },
  {
    id: "simple_table",
    name: "simple table",
    description: "a text, a number, and a checkbox.",
    schema: simpleTableSchema,
    views: tableView(simpleTableSchema),
  },
];

export function getTemplate(id: unknown): CollectionTemplate | undefined {
  return COLLECTION_TEMPLATES.find((template) => template.id === id);
}
