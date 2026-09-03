# modules and collections

Design record for making one Arkivel codebase serve very different deployments — a personal wiki, a team knowledge base, notes-plus-tasks, world-building — without growing a table per feature again.

## decision

Arkivel is configurable at three levels, in this order of preference:

1. **the core is fixed.** Articles, wiki links, spaces (categories), tags, search, revisions, users, sessions, audit, admin, settings. Every deployment has it. It is not a module.
2. **collections are the engine.** One small generic data model — a collection with a typed property schema, items, and views — covers tasks, reading lists, CRMs, trackers, and whatever comes next as *templates*, not code. This is how Notion gets its range from a tiny model.
3. **modules are for genuinely different code paths.** Graph, assets, import, export, the public API, feeds, share links, and later collections itself. A module is a folder that declares its routes, navigation, palette commands, docs, settings, and schema, and a deployment enables a set of them.

Starter kits (a preset of enabled modules plus seeded collections and a skin) replace the idea of a marketplace. There are no third-party plugins.

## why not features

v5 answered every need with a feature: 96 tables, each with routes and UI, all shipped to every deployment. The 6.0 rewrite exists because that collapsed. The rule going forward: **tables scale with engines, not with features.** Before adding a model, ask whether a collection template covers it.

## modules

`src/modules/` holds one folder per module plus a registry.

```ts
// src/modules/types.ts
export type ModuleId = "graph" | "assets" | "import" | "export" | "api" | "feeds" | "share" | "collections";

export type NavSection = "top" | "library" | "spaces" | "footer";

export type NavEntry = {
  label: string;
  href: string;
  icon: IconName;          // a key into the shared inline icon set
  section: NavSection;
  order: number;
  requires?: "member" | "admin";
};

export type PaletteCommand = {
  label: string;
  href: string;
  keywords: string[];
  requires?: "member" | "admin";
};

export type ModuleDefinition = {
  id: ModuleId;
  name: string;            // lowercase interface copy
  description: string;
  /** path prefixes this module owns; disabled → 404 */
  routes: string[];
  nav: NavEntry[];
  commands: PaletteCommand[];
  docs: { help?: string; features: string[] };
  /** default enablement when ARKIVEL_MODULES is unset */
  defaultEnabled: boolean;
};
```

Resolution of the enabled set, per request, cached:

1. `ARKIVEL_MODULES` env (comma list) — the deployment's hard default; unset means every module's `defaultEnabled`.
2. `SystemSetting` row `modules` with `config: { enabled: ModuleId[] }` — the admin override from `/admin/modules`.

`getEnabledModules()` (server) and `useEnabledModules()` (client, fed from the root layout) are the only ways to read it. Pages inside a module call `requireModule(id)` (server: `notFound()` when disabled); API routes call the same and return 404. The sidebar, command palette, help page, and features page are **composed from the registry**, never hand-listed.

Existing features move into modules with no behaviour change: `graph` (`/graph`, `/api/graph`, the article context rail's graph tab), `assets` (`/assets`, `/api/assets`, `/api/upload`), `import` (`/import/**`, `/api/import/**`), `export` (`/export`, `/api/export/**`), `api` (`/api/v1/**`, `/api-docs`), `feeds` (`/feed.xml`, `/feed/atom`), `share` (`/share/**`, share-token routes).

## collections

Three tables, added by migration, owned by the `collections` module.

```prisma
model Collection {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  icon        String?
  description String?
  categoryId  String?                      // the space it lives in
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  schema      Json                         // PropertyDefinition[]
  items       CollectionItem[]
  views       CollectionView[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
}

model CollectionItem {
  id           String     @id @default(cuid())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  articleId    String?    @unique          // an item may be a real page
  article      Article?   @relation(fields: [articleId], references: [id], onDelete: SetNull)
  title        String
  properties   Json                        // Record<propertyId, value>, validated against schema
  sortOrder    Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([collectionId, sortOrder])
  @@index([collectionId, updatedAt])
}

model CollectionView {
  id           String     @id @default(cuid())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  slug         String
  name         String
  kind         String                       // "table" | "board" | "list" | "calendar"
  config       Json                         // ViewConfig
  isDefault    Boolean    @default(false)
  sortOrder    Int        @default(0)

  @@unique([collectionId, slug])
}
```

Property types (`src/modules/collections/properties.ts`): `title` (exactly one, maps to `item.title`), `text`, `number`, `select` (options with a tone), `multi_select`, `date`, `checkbox`, `url`, `person` (user id), `page` (article id), `relation` (item ids in another collection), `created_time`, `updated_time`. Every write validates `properties` against the collection's schema; unknown keys are dropped, wrong types rejected.

View config: `{ filters: Filter[], sorts: Sort[], groupBy?: propertyId, visible: propertyId[] }`. Table is the first view kind; board (grouped by a select), list, and calendar (by a date) follow.

Routes: `/collections` (index), `/collections/[slug]` (default view), `/collections/[slug]/[view]`, `/collections/[slug]/items/[id]` (item page: the linked article when there is one, otherwise the property form). API under `/api/collections/**` mirrors it. Collections appear in the sidebar under their space (or a "collections" section when unspaced), in the palette, and in search.

The table view is the shared `DataTable` (fixed 2.25rem rows, pinned header) with inline property editing; views never introduce a second table look.

## starter kits

A kit is `{ modules: ModuleId[], skin, seed }` in `src/kits/`. `ARKIVEL_KIT` picks one for a fresh database; `/admin/kits` can apply a kit's seed later (idempotent, like the demo seed). First kits: `wiki` (core + graph + api), `notes-and-tasks` (core + collections with a tasks collection: status / due / priority / assignee, table + board views), `team-knowledge-base` (everything).

## phases

1. **baseline** — `prisma/migrations` created from the live database, `prisma migrate deploy` in the Dockerfile instead of `db push`, `npm run db:*` scripts. *(this record)*
2. **module registry** — `src/modules`, existing features moved in, `/admin/modules`, composed navigation/palette/docs, `ARKIVEL_MODULES`.
3. **collections** — migration, models, property validation, API, index + table view + item page, sidebar/palette/search integration.
4. **tasks kit** — the first template on the engine, with a board view.
5. **views** — list and calendar; relations across collections.

## rules

- never `prisma db push` against an existing database; every schema change is a migration rehearsed on a branch database first.
- a module may not import from another module; both go through the core.
- no new table without first asking whether a collection template covers the need.
