import { ARTICLE_TEMPLATES, type ArticleTemplate } from "./templates";

/**
 * Maps category slugs to default template IDs.
 * When a user selects a category, the matching template is auto-applied.
 */
const CATEGORY_TEMPLATE_MAP: Record<string, string> = {
  // People categories
  people: "person",
  leaders: "person",
  artists: "person",
  scientists: "person",
  warriors: "person",
  merchants: "person",

  // Place categories
  places: "place",
  cities: "place",
  regions: "place",
  landmarks: "place",
  buildings: "place",

  // Event categories
  events: "event",
  battles: "event",
  ceremonies: "event",
  discoveries: "event",
  disasters: "event",

  // Organization categories
  organizations: "group",
  governments: "group",
  military: "group",
  religious: "group",
  guilds: "group",

  // Thing categories
  things: "thing",
  weapons: "thing",
  artifacts: "thing",
  documents: "thing",
  tools: "thing",

  // Concept categories
  concepts: "thing",
  magic: "thing",
  religions: "thing",
  laws: "thing",
  languages: "thing",
};

type CategoryNode = {
  id: string;
  slug: string;
  parentId: string | null;
  children?: CategoryNode[];
};

/**
 * Gets the recommended template for a category, walking up the parent chain if needed.
 */
export function getCategoryTemplate(
  categorySlug: string,
  categories: CategoryNode[]
): ArticleTemplate | null {
  // Flatten category tree
  const flat: CategoryNode[] = [];
  function walk(cats: CategoryNode[]) {
    for (const cat of cats) {
      flat.push(cat);
      if (cat.children) walk(cat.children);
    }
  }
  walk(categories);

  // Walk up parent chain looking for a template match
  let current = flat.find((c) => c.slug === categorySlug);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    const templateId = CATEGORY_TEMPLATE_MAP[current.slug];
    if (templateId) {
      return ARTICLE_TEMPLATES.find((t) => t.id === templateId) || null;
    }
    current = current.parentId
      ? flat.find((c) => c.id === current!.parentId)
      : undefined;
  }

  return null;
}
