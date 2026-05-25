export const DESKTOP_RESEARCH_SCHEMA_VERSION = "arkivel.desktop-research.v1";

export const DESKTOP_PACKAGING_OPTIONS = ["electron", "tauri", "browser-pwa", "docker-desktop"] as const;
export const LOCAL_DEPLOYMENT_RECIPES = ["docker-desktop-single-machine", "node-postgres-local", "pwa-local-network"] as const;

export const desktopResearchContract = {
  apiRoute: "/api/desktop-research",
  docs: "docs/desktop-app-research.md",
  localOnlyRecipes: LOCAL_DEPLOYMENT_RECIPES,
  packagingOptions: DESKTOP_PACKAGING_OPTIONS,
  schemaVersion: DESKTOP_RESEARCH_SCHEMA_VERSION,
  v5Scope: "research-only",
} as const;

export const desktopPackagingNotes = [
  {
    option: "electron",
    strengths: ["mature updater ecosystem", "filesystem APIs", "broad plugin isolation patterns"],
    risks: ["larger bundles", "Node integration must stay disabled for untrusted content", "auto-update signing adds release overhead"],
  },
  {
    option: "tauri",
    strengths: ["small bundles", "Rust command boundary", "native filesystem dialogs"],
    risks: ["requires Rust toolchain for contributors", "plugin execution boundary needs separate design", "updater flow needs signing discipline"],
  },
  {
    option: "browser-pwa",
    strengths: ["already close to current app", "lowest maintenance", "offline reading path exists"],
    risks: ["limited filesystem import/export UX", "local database still needs a service", "not a full desktop packaging answer"],
  },
  {
    option: "docker-desktop",
    strengths: ["matches self-host architecture", "Postgres and assets stay explicit", "backup volumes are easy to document"],
    risks: ["less native-feeling", "requires Docker Desktop", "updates are operational rather than app-like"],
  },
] as const;

export const desktopArchitectureNotes = [
  "Keep Next.js, Prisma, Postgres, asset storage, and plugin manifest contracts as the core architecture.",
  "Treat Electron or Tauri as launchers around a local web server until v5 scope is explicitly approved.",
  "Store local data in an app-owned directory with separate database, assets, exports, logs, and plugin-manifest folders.",
  "Require signed updates, backup prompts, restore rehearsal, and plugin permission review before any desktop beta.",
] as const;

export const fileSystemUxPlan = {
  exports: ["choose export folder", "write manifest and checksums", "show privacy omissions", "open containing folder after completion"],
  imports: ["choose archive or folder", "preview manifest", "run dry-run conflict report", "require restore point before apply"],
};

export const desktopDecisionRecord = {
  decision: "Do not commit desktop packaging to v5 scope yet.",
  nextReview: "before-v5-release-candidate",
  requiredEvidence: ["backup/restore UX", "signed update plan", "plugin safety boundary", "local database support burden"],
  status: "research-only",
} as const;

export function createDesktopResearchReport() {
  return {
    architectureNotes: desktopArchitectureNotes,
    contract: desktopResearchContract,
    decisionRecord: desktopDecisionRecord,
    fileSystemUxPlan,
    localDeploymentRecipes: LOCAL_DEPLOYMENT_RECIPES,
    packagingNotes: desktopPackagingNotes,
  };
}
