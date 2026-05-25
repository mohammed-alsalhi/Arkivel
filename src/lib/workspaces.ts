export const WORKSPACE_CONTRACT_SCHEMA_VERSION = "arkivel.workspace.v1";

export const WORKSPACE_ROLES = ["admin", "editor", "viewer"] as const;
export const WORKSPACE_VISIBILITY = ["private", "members", "public"] as const;
export const WORKSPACE_NAVIGATION_MODES = ["standard", "docs", "archive", "demo"] as const;
export const WORKSPACE_BOOTSTRAP_PROFILES = [
  "personal",
  "team",
  "public-docs",
  "private-archive",
  "demo",
] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];
export type WorkspaceVisibility = (typeof WORKSPACE_VISIBILITY)[number];
export type WorkspaceNavigationMode = (typeof WORKSPACE_NAVIGATION_MODES)[number];
export type WorkspaceBootstrapProfile = (typeof WORKSPACE_BOOTSTRAP_PROFILES)[number];

export type WorkspaceSettings = {
  homeRoute: string;
  defaultArticleStatus: "draft" | "review" | "published";
  invitePolicy: "admins-only" | "admins-and-editors";
  publicRead: boolean;
  marketplaceSelections: {
    styleId: string;
    colorThemeId: string;
    layoutId: string;
    componentPackId: string;
  };
};

export type WorkspaceBootstrapPlan = {
  profile: WorkspaceBootstrapProfile;
  visibility: WorkspaceVisibility;
  defaultRole: WorkspaceRole;
  navigationMode: WorkspaceNavigationMode;
  settings: WorkspaceSettings;
  starterSpaces: string[];
  starterTags: string[];
  migrationNotes: string[];
};

export type WorkspaceScope = {
  workspaceId?: string;
  includeGlobal: boolean;
};

const PROFILE_PLANS: Record<WorkspaceBootstrapProfile, WorkspaceBootstrapPlan> = {
  personal: {
    profile: "personal",
    visibility: "private",
    defaultRole: "viewer",
    navigationMode: "standard",
    settings: baseSettings("draft", false, "classic-wiki", "standard", "classic-wiki", "default-wiki"),
    starterSpaces: ["Inbox", "Projects", "Reference"],
    starterTags: ["idea", "todo", "reference"],
    migrationNotes: ["Keep existing unscoped articles visible in the default personal workspace."],
  },
  team: {
    profile: "team",
    visibility: "members",
    defaultRole: "viewer",
    navigationMode: "standard",
    settings: baseSettings("review", false, "classic-wiki", "forest", "team-knowledge-base", "team-knowledge-base"),
    starterSpaces: ["Handbook", "Policies", "Runbooks", "Onboarding"],
    starterTags: ["owner-needed", "stale", "onboarding"],
    migrationNotes: ["Map existing admins to workspace admins and add editors explicitly before enabling team visibility."],
  },
  "public-docs": {
    profile: "public-docs",
    visibility: "public",
    defaultRole: "viewer",
    navigationMode: "docs",
    settings: baseSettings("published", true, "classic-wiki", "standard", "docs-portal", "docs-portal"),
    starterSpaces: ["Guides", "API", "Changelog", "Troubleshooting"],
    starterTags: ["versioned", "public", "support"],
    migrationNotes: ["Review draft and private content before changing a migrated workspace to public visibility."],
  },
  "private-archive": {
    profile: "private-archive",
    visibility: "private",
    defaultRole: "viewer",
    navigationMode: "archive",
    settings: baseSettings("published", false, "classic-wiki", "standard", "classic-wiki", "default-wiki"),
    starterSpaces: ["Collections", "People", "Places", "Sources"],
    starterTags: ["archival", "source", "needs-review"],
    migrationNotes: ["Preserve slugs and revisions first; add members only after import rehearsal passes."],
  },
  demo: {
    profile: "demo",
    visibility: "public",
    defaultRole: "viewer",
    navigationMode: "demo",
    settings: baseSettings("published", true, "atlas-modern", "ember", "worldbuilding-atlas", "worldbuilding-atlas"),
    starterSpaces: ["Start Here", "Examples", "Tours"],
    starterTags: ["demo", "sample", "guided"],
    migrationNotes: ["Never mix production private data into demo deployments."],
  },
};

function baseSettings(
  defaultArticleStatus: WorkspaceSettings["defaultArticleStatus"],
  publicRead: boolean,
  styleId: string,
  colorThemeId: string,
  layoutId: string,
  componentPackId: string
): WorkspaceSettings {
  return {
    homeRoute: "/dashboard",
    defaultArticleStatus,
    invitePolicy: "admins-only",
    publicRead,
    marketplaceSelections: { styleId, colorThemeId, layoutId, componentPackId },
  };
}

export const workspaceContract = {
  schemaVersion: WORKSPACE_CONTRACT_SCHEMA_VERSION,
  entity: "Wiki is the durable workspace entity for v4.82 and later.",
  roles: WORKSPACE_ROLES,
  visibility: WORKSPACE_VISIBILITY,
  navigationModes: WORKSPACE_NAVIGATION_MODES,
  bootstrapProfiles: WORKSPACE_BOOTSTRAP_PROFILES,
  scopedApiParameters: ["workspaceId", "wikiId", "X-Arkivel-Workspace"],
  scopedSurfaces: ["articles", "categories", "tags", "search", "dashboard", "customization", "marketplace"],
  isolationRule: "Workspace-scoped queries must include Article.wikiId, or explicitly include global legacy rows during migration.",
  migrationPath: [
    "Create a personal default workspace for the existing owner/admin.",
    "Backfill Article.wikiId for rows that should move out of the legacy global pool.",
    "Keep unscoped rows readable through includeGlobal until the admin confirms migration.",
    "Invite members after visibility, default role, and marketplace selections are reviewed.",
  ],
};

export function normalizeWorkspaceSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getWorkspaceBootstrapPlan(profile: string | null | undefined): WorkspaceBootstrapPlan {
  if (profile && WORKSPACE_BOOTSTRAP_PROFILES.includes(profile as WorkspaceBootstrapProfile)) {
    return PROFILE_PLANS[profile as WorkspaceBootstrapProfile];
  }
  return PROFILE_PLANS.personal;
}

export function getWorkspaceIdFromRequestLike(input: {
  searchParams?: URLSearchParams;
  headers?: Headers | { get(name: string): string | null };
}): string | undefined {
  const fromQuery = input.searchParams?.get("workspaceId") || input.searchParams?.get("wikiId");
  const fromHeader = input.headers?.get("X-Arkivel-Workspace") || input.headers?.get("x-arkivel-workspace");
  return fromQuery || fromHeader || undefined;
}

export function createWorkspaceArticleWhere(scope: WorkspaceScope): { OR: ({ wikiId: string } | { wikiId: null })[] } | { wikiId: string } | { wikiId: null } | Record<string, never> {
  if (scope.workspaceId && scope.includeGlobal) {
    return { OR: [{ wikiId: scope.workspaceId }, { wikiId: null }] };
  }
  if (scope.workspaceId) return { wikiId: scope.workspaceId };
  return scope.includeGlobal ? {} : { wikiId: null };
}

export function createPublicWorkspaceArticleWhere() {
  return { OR: [{ wikiId: null }, { wiki: { visibility: "public" } }] };
}

export function createApiKeyWorkspaceArticleWhere(input: {
  userId: string;
  workspaceId?: string;
  includeGlobal?: boolean;
}) {
  const readableWorkspace = {
    OR: [
      { wiki: { visibility: "public" } },
      { wiki: { memberships: { some: { userId: input.userId, status: "active" } } } },
      { wiki: { ownerId: input.userId } },
    ],
  };

  if (input.workspaceId) {
    return input.includeGlobal
      ? { OR: [{ wikiId: null }, { AND: [{ wikiId: input.workspaceId }, readableWorkspace] }] }
      : { AND: [{ wikiId: input.workspaceId }, readableWorkspace] };
  }

  return { OR: [{ wikiId: null }, readableWorkspace] };
}

export function canAccessWorkspace(input: {
  visibility: WorkspaceVisibility;
  role?: WorkspaceRole | null;
  publicRead?: boolean;
}): boolean {
  if (input.role) return true;
  return input.visibility === "public" || input.publicRead === true;
}

export function createWorkspaceIsolationScenarios() {
  return [
    {
      name: "scoped workspace hides sibling articles",
      scope: { workspaceId: "wiki_a", includeGlobal: false },
      where: createWorkspaceArticleWhere({ workspaceId: "wiki_a", includeGlobal: false }),
      hiddenWikiId: "wiki_b",
    },
    {
      name: "migration mode includes legacy global articles",
      scope: { workspaceId: "wiki_a", includeGlobal: true },
      where: createWorkspaceArticleWhere({ workspaceId: "wiki_a", includeGlobal: true }),
      includedLegacyWikiId: null,
    },
    {
      name: "unscoped strict mode only reads legacy global rows",
      scope: { includeGlobal: false },
      where: createWorkspaceArticleWhere({ includeGlobal: false }),
      hiddenWikiId: "wiki_a",
    },
  ];
}
