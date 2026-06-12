import type { Metadata } from "next";
import Link from "next/link";
import { config } from "@/lib/config";
import { Page, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "All tools",
  description: "Directory of every workspace, discovery and publishing tool.",
};

type DirectoryEntry = {
  href: string;
  label: string;
  description: string;
};

type DirectoryGroup = {
  title: string;
  entries: DirectoryEntry[];
};

const groups: DirectoryGroup[] = [
  {
    title: "Discover",
    entries: [
      { href: "/atlas", label: "Canon atlas", description: "Territories, threads and lore in one map." },
      { href: "/trails", label: "Canon trails", description: "Guided reading routes through the wiki." },
      { href: "/intelligence", label: "Knowledge cockpit", description: "Signals, quality radar and canon ops." },
      { href: "/graph", label: "Article graph", description: "Force-directed network of every link." },
      { href: "/ask", label: "Ask my wiki", description: "Ask questions answered from your articles." },
      { href: "/explore", label: "Explore", description: "Serendipitous browsing across the wiki." },
      { href: "/popular", label: "Popular", description: "Most-read articles." },
      { href: "/random", label: "Random article", description: "Jump somewhere unexpected." },
      { href: "/series", label: "Series", description: "Multi-part article sequences." },
      { href: "/timeline", label: "Timeline", description: "Edits and creations in order." },
      { href: "/timeline/historical", label: "Historical timeline", description: "In-world chronology of events." },
      { href: "/coverage", label: "Coverage map", description: "Where the wiki is strong and thin." },
      { href: "/health", label: "Wiki health", description: "Stubs, broken links and quality checks." },
      { href: "/glossary", label: "Glossary", description: "Defined terms used across articles." },
      { href: "/activity", label: "Activity", description: "Recent reading and editing activity." },
      { href: "/discussions", label: "Discussions", description: "Conversation threads on articles." },
      { href: "/digest", label: "Daily digest", description: "A daily summary of what changed." },
    ],
  },
  {
    title: "Workspace",
    entries: [
      { href: "/studio", label: "Arkivel Studio", description: "Boards, bases and canvas in one workspace." },
      { href: "/dashboard", label: "Dashboard", description: "Your personal overview widgets." },
      { href: "/review", label: "Review queue", description: "Articles enrolled for spaced review." },
      { href: "/canvas", label: "Canvas", description: "Freeform JSON-canvas boards." },
      { href: "/whiteboards", label: "Whiteboards", description: "Sketch and diagram ideas." },
      { href: "/scratchpad", label: "Scratchpad", description: "Quick throwaway notes." },
      { href: "/daily", label: "Daily note", description: "One note per day." },
      { href: "/bookmarks", label: "Bookmarks", description: "Articles you saved." },
      { href: "/reading-lists", label: "Reading lists", description: "Curated lists of articles." },
      { href: "/watchlist", label: "Watchlist", description: "Articles you follow for changes." },
    ],
  },
  {
    title: "Publish & share",
    entries: [
      { href: "/compare", label: "Compare revisions", description: "Diff any two revisions side by side." },
      { href: "/split", label: "Split view", description: "Read two articles at once." },
      { href: "/export", label: "Export", description: "Download articles as Markdown or HTML." },
      { href: "/import", label: "Import", description: "Bring in content from Obsidian, Notion and more." },
      { href: "/assets", label: "Asset library", description: "Uploaded images and files." },
    ],
  },
  {
    title: "Reference",
    entries: [
      { href: "/api-docs", label: "API docs", description: "REST API reference and keys." },
      { href: "/help", label: "Help", description: "How the wiki works." },
      { href: "/features", label: "Features", description: "Everything the wiki can do." },
    ],
  },
];

export default function ToolsPage() {
  return (
    <Page className="wiki-responsive-guard">
      <PageHeader
        title="All tools"
        description={
          <>
            Every destination in one place. The sidebar keeps the daily essentials; everything else lives here
            and in the command palette (Ctrl/Cmd&nbsp;+&nbsp;K).
          </>
        }
      />

      {groups.map((group) => (
        <Section key={group.title} title={group.title}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="block border border-border bg-surface p-3 no-underline hover:bg-surface-hover hover:no-underline transition-colors"
              >
                <span className="block text-[13px] font-semibold text-wiki-link">{entry.label}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">{entry.description}</span>
              </Link>
            ))}
          </div>
        </Section>
      ))}

      {config.mapEnabled && (
        <Section title="World">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/map"
              className="block border border-border bg-surface p-3 no-underline hover:bg-surface-hover hover:no-underline transition-colors"
            >
              <span className="block text-[13px] font-semibold text-wiki-link">{config.mapLabel}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted">Interactive world map with linked markers.</span>
            </Link>
          </div>
        </Section>
      )}
    </Page>
  );
}
