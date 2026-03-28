"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState } from "react";
import { useAdmin } from "@/components/AdminContext";
import { config } from "@/lib/config";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
  children?: Category[];
};

// ── SVG primitives ────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="11" height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("transition-transform flex-shrink-0", !open && "-rotate-90")}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({
  categories,
  articleCount,
}: {
  categories: Category[];
  articleCount?: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = useAdmin();
  const close = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-pressed={mobileOpen}
        className="fixed top-1.5 left-2 z-50 flex items-center justify-center w-7 h-7 bg-surface border border-border text-foreground md:hidden"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <aside
        className={clsx(
          "fixed left-0 top-[40px] z-40 h-[calc(100vh-40px)] w-[200px] overflow-y-auto bg-sidebar-bg border-r border-border transition-transform flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:sticky md:top-0 md:translate-x-0 md:h-auto md:min-h-[calc(100vh-40px)] md:flex-shrink-0"
        )}
      >
        {/* Logo / Title */}
        <div className="px-3 py-3 border-b border-border">
          <Link href="/" className="block text-center hover:no-underline" onClick={close}>
            <h1
              className="text-lg font-bold text-heading"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {config.name}
            </h1>
          </Link>
        </div>

        {/* Browse — core content navigation */}
        <SidebarSection title="Browse">
          <SidebarLink href="/" active={pathname === "/"} onClick={close}>
            Main Page
          </SidebarLink>
          <SidebarLink href="/articles" active={pathname === "/articles"} onClick={close}>
            All articles{articleCount ? ` (${articleCount})` : ""}
          </SidebarLink>
          <SidebarLink href="/recent-changes" active={pathname === "/recent-changes"} onClick={close}>
            Recent changes
          </SidebarLink>
          <SidebarLink href="/timeline" active={pathname === "/timeline"} onClick={close}>
            Timeline
          </SidebarLink>
          <SidebarLink href="/popular" active={pathname === "/popular"} onClick={close}>
            Popular
          </SidebarLink>
          <SidebarLink href="/series" active={pathname === "/series" || pathname.startsWith("/series/")} onClick={close}>
            Series
          </SidebarLink>
          <SidebarLink href="/random" active={pathname === "/random"} onClick={close}>
            Random article
          </SidebarLink>
          <SidebarLink href="/tags" active={pathname === "/tags" || pathname.startsWith("/tags/")} onClick={close}>
            Tags
          </SidebarLink>
          <SidebarLink href="/graph" active={pathname === "/graph"} onClick={close}>
            Article graph
          </SidebarLink>
          <SidebarLink href="/glossary" active={pathname === "/glossary"} onClick={close}>
            Glossary
          </SidebarLink>
          {config.mapEnabled && (
            <SidebarLink href="/map" active={pathname === "/map" || pathname.startsWith("/map/")} onClick={close}>
              {config.mapLabel}
            </SidebarLink>
          )}
        </SidebarSection>

        {/* Discover — exploration and stats */}
        <SidebarSection title="Discover">
          <SidebarLink href="/explore" active={pathname === "/explore"} onClick={close}>
            Explore
          </SidebarLink>
          <SidebarLink href="/activity" active={pathname === "/activity"} onClick={close}>
            Activity
          </SidebarLink>
          <SidebarLink href="/stats" active={pathname === "/stats"} onClick={close}>
            Stats
          </SidebarLink>
          <SidebarLink href="/leaderboard" active={pathname === "/leaderboard"} onClick={close}>
            Leaderboard
          </SidebarLink>
          <SidebarLink href="/mentions" active={pathname === "/mentions"} onClick={close}>
            Mentions
          </SidebarLink>
          <SidebarLink href="/discussions" active={pathname === "/discussions" || pathname.startsWith("/discussions/")} onClick={close}>
            Discussions
          </SidebarLink>
          <SidebarLink href="/collections" active={pathname.startsWith("/collections")} onClick={close}>
            Collections
          </SidebarLink>
        </SidebarSection>

        {/* Community — collaborative features */}
        <SidebarSection title="Community" defaultOpen={false}>
          <SidebarLink href="/change-requests" active={pathname === "/change-requests"} onClick={close}>
            Change requests
          </SidebarLink>
          <SidebarLink href="/reviews" active={pathname === "/reviews"} onClick={close}>
            Reviews
          </SidebarLink>
          <SidebarLink href="/bounties" active={pathname === "/bounties"} onClick={close}>
            Bounties
          </SidebarLink>
          <SidebarLink href="/forks" active={pathname === "/forks"} onClick={close}>
            Forks
          </SidebarLink>
          <SidebarLink href="/users" active={pathname === "/users" || pathname.startsWith("/users/")} onClick={close}>
            Users
          </SidebarLink>
        </SidebarSection>

        {/* Personal — user account features */}
        <SidebarSection title="Personal">
          <SidebarLink href="/dashboard" active={pathname === "/dashboard"} onClick={close}>
            My dashboard
          </SidebarLink>
          <SidebarLink href="/reading-lists" active={pathname.startsWith("/reading-lists")} onClick={close}>
            Reading lists
          </SidebarLink>
          <SidebarLink href="/bookmarks" active={pathname === "/bookmarks"} onClick={close}>
            Bookmarks
          </SidebarLink>
          <SidebarLink href="/watchlist" active={pathname === "/watchlist"} onClick={close}>
            Watchlist
          </SidebarLink>
          <SidebarLink href="/watchlist/digest" active={pathname === "/watchlist/digest"} onClick={close} indent>
            Change digest
          </SidebarLink>
          <SidebarLink href="/flashcards" active={pathname === "/flashcards"} onClick={close}>
            Flashcards
          </SidebarLink>
          <SidebarLink href="/learning-paths" active={pathname.startsWith("/learning-paths")} onClick={close}>
            Learning paths
          </SidebarLink>
          <SidebarLink href="/til" active={pathname === "/til"} onClick={close}>
            Today I Learned
          </SidebarLink>
          <SidebarLink href="/scratchpad" active={pathname === "/scratchpad"} onClick={close}>
            Scratchpad
          </SidebarLink>
          <SidebarLink href="/history" active={pathname === "/history"} onClick={close}>
            Reading history
          </SidebarLink>
        </SidebarSection>

        {/* Tools — utilities and integrations */}
        <SidebarSection title="Tools" defaultOpen={false}>
          <SidebarLink href="/compare" active={pathname === "/compare"} onClick={close}>
            Compare revisions
          </SidebarLink>
          <SidebarLink href="/export" active={pathname === "/export"} onClick={close}>
            Export
          </SidebarLink>
          <SidebarLink href="/whiteboards" active={pathname === "/whiteboards" || pathname.startsWith("/whiteboards/")} onClick={close}>
            Whiteboards
          </SidebarLink>
          <SidebarLink href="/present" active={pathname === "/present"} onClick={close}>
            Present
          </SidebarLink>
          <SidebarLink href="/api-docs" active={pathname === "/api-docs"} onClick={close}>
            API docs
          </SidebarLink>
          <SidebarLink href="/feed.xml" onClick={close}>
            RSS feed
          </SidebarLink>
          <SidebarLink href="/bookmarklet" active={pathname === "/bookmarklet"} onClick={close}>
            Bookmarklet
          </SidebarLink>
          <SidebarLink href="/clipper-extension" active={pathname === "/clipper-extension"} onClick={close}>
            Clipper extension
          </SidebarLink>
          <SidebarLink href="/help" active={pathname === "/help"} onClick={close}>
            Help
          </SidebarLink>
          <SidebarLink href="/features" active={pathname === "/features"} onClick={close}>
            Features
          </SidebarLink>
        </SidebarSection>

        {/* Contribute (admin only) */}
        {isAdmin && (
          <SidebarSection title="Contribute">
            <SidebarLink href="/articles/new" onClick={close}>
              New article
            </SidebarLink>
            <SidebarLink href="/import" active={pathname === "/import"} onClick={close}>
              Import articles
            </SidebarLink>
            <SidebarLink href="/import/obsidian" active={pathname === "/import/obsidian"} onClick={close} indent>
              From Obsidian
            </SidebarLink>
            <SidebarLink href="/import/notion" active={pathname === "/import/notion"} onClick={close} indent>
              From Notion
            </SidebarLink>
          </SidebarSection>
        )}

        {/* Admin (admin only, collapsed by default) */}
        {isAdmin && (
          <SidebarSection title="Admin" defaultOpen={false}>
            <SidebarLink href="/admin" active={pathname === "/admin"} onClick={close}>
              Dashboard
            </SidebarLink>
            <SidebarLink href="/admin/users" active={pathname === "/admin/users"} onClick={close}>
              Users
            </SidebarLink>
            <SidebarLink href="/admin/analytics" active={pathname === "/admin/analytics"} onClick={close}>
              Analytics
            </SidebarLink>
            <SidebarLink href="/admin/metrics" active={pathname === "/admin/metrics"} onClick={close}>
              Metrics
            </SidebarLink>
            <SidebarLink href="/admin/health" active={pathname === "/admin/health"} onClick={close}>
              Health
            </SidebarLink>
            <SidebarLink href="/admin/plugins" active={pathname === "/admin/plugins"} onClick={close}>
              Plugins
            </SidebarLink>
            <SidebarLink href="/admin/webhooks" active={pathname === "/admin/webhooks"} onClick={close}>
              Webhooks
            </SidebarLink>
            <SidebarLink href="/admin/templates" active={pathname === "/admin/templates"} onClick={close}>
              Templates
            </SidebarLink>
            <SidebarLink href="/admin/theme" active={pathname === "/admin/theme"} onClick={close}>
              Theme
            </SidebarLink>
            <SidebarLink href="/admin/lint" active={pathname === "/admin/lint"} onClick={close}>
              Content lint
            </SidebarLink>
            <SidebarLink href="/admin/knowledge-gaps" active={pathname === "/admin/knowledge-gaps"} onClick={close}>
              Knowledge gaps
            </SidebarLink>
            <SidebarLink href="/admin/embeddings" active={pathname === "/admin/embeddings"} onClick={close}>
              Embeddings
            </SidebarLink>
            <SidebarLink href="/admin/search-analytics" active={pathname === "/admin/search-analytics"} onClick={close}>
              Search analytics
            </SidebarLink>
            <SidebarLink href="/admin/search-gaps" active={pathname === "/admin/search-gaps"} onClick={close}>
              Search gaps
            </SidebarLink>
            <SidebarLink href="/admin/announcements" active={pathname === "/admin/announcements"} onClick={close}>
              Announcements
            </SidebarLink>
            <SidebarLink href="/admin/categories" active={pathname === "/admin/categories"} onClick={close}>
              Category merge
            </SidebarLink>
            <SidebarLink href="/admin/word-count" active={pathname === "/admin/word-count"} onClick={close}>
              Word count
            </SidebarLink>
            <SidebarLink href="/admin/staleness" active={pathname === "/admin/staleness"} onClick={close}>
              Staleness
            </SidebarLink>
            <SidebarLink href="/admin/kanban" active={pathname === "/admin/kanban"} onClick={close}>
              Article pipeline
            </SidebarLink>
            <SidebarLink href="/admin/content-schedule" active={pathname === "/admin/content-schedule"} onClick={close}>
              Content schedule
            </SidebarLink>
            <SidebarLink href="/admin/audit-log" active={pathname === "/admin/audit-log"} onClick={close}>
              Audit log
            </SidebarLink>
            <SidebarLink href="/admin/macros" active={pathname === "/admin/macros"} onClick={close}>
              Macros
            </SidebarLink>
            <SidebarLink href="/admin/metadata-schemas" active={pathname === "/admin/metadata-schemas"} onClick={close}>
              Metadata schemas
            </SidebarLink>
            <SidebarLink href="/admin/series" active={pathname === "/admin/series"} onClick={close}>
              Series manager
            </SidebarLink>
            <SidebarLink href="/admin/redirects" active={pathname === "/admin/redirects"} onClick={close}>
              Redirects
            </SidebarLink>
            <SidebarLink href="/admin/stubs" active={pathname === "/admin/stubs"} onClick={close}>
              Stubs
            </SidebarLink>
            <SidebarLink href="/admin/quality" active={pathname === "/admin/quality"} onClick={close}>
              Content quality
            </SidebarLink>
            <SidebarLink href="/admin/calendar" active={pathname === "/admin/calendar"} onClick={close}>
              Calendar
            </SidebarLink>
            <SidebarLink href="/admin/federated-peers" active={pathname === "/admin/federated-peers"} onClick={close}>
              Federated peers
            </SidebarLink>
            <SidebarLink href="/admin/import" active={pathname === "/admin/import"} onClick={close}>
              Import
            </SidebarLink>
            <SidebarLink href="/admin/glossary" active={pathname === "/admin/glossary"} onClick={close}>
              Glossary
            </SidebarLink>
            <SidebarLink href="/admin/category-stats" active={pathname === "/admin/category-stats"} onClick={close}>
              Category stats
            </SidebarLink>
            <SidebarLink href="/admin/suggestions" active={pathname === "/admin/suggestions"} onClick={close}>
              Edit suggestions
            </SidebarLink>
            <SidebarLink href="/admin/retention" active={pathname === "/admin/retention"} onClick={close}>
              Reader retention
            </SidebarLink>
            <SidebarLink href="/admin/tags" active={pathname === "/admin/tags"} onClick={close}>
              Tag management
            </SidebarLink>
            <SidebarLink href="/admin/external-links" active={pathname === "/admin/external-links"} onClick={close}>
              External link clicks
            </SidebarLink>
          </SidebarSection>
        )}

        {/* Categories */}
        <SidebarSection title="Categories">
          <SidebarLink href="/categories" active={pathname === "/categories"} onClick={close}>
            All categories
          </SidebarLink>
          {categories.map((cat) => (
            <SidebarCategoryItem
              key={cat.id}
              category={cat}
              pathname={pathname}
              depth={0}
              onNavigate={close}
            />
          ))}
        </SidebarSection>

        {/* Footer */}
        <div className="mt-auto border-t border-border px-3 py-2 text-[10px] text-muted text-center">
          v{process.env.NEXT_PUBLIC_APP_VERSION}
        </div>
      </aside>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SidebarCategoryItem({
  category,
  pathname,
  depth,
  onNavigate,
}: {
  category: Category;
  pathname: string;
  depth: number;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: `${depth * 12}px` }}>
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-4 flex-shrink-0 text-muted hover:text-foreground transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronIcon open={expanded} />
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        <SidebarLink
          href={`/categories/${category.slug}`}
          active={pathname === `/categories/${category.slug}`}
          onClick={onNavigate}
        >
          <span className="flex items-center justify-between w-full">
            <span>{category.name}</span>
            {category._count.articles > 0 && (
              <span className="text-[10px] text-muted ml-1 flex-shrink-0">
                {category._count.articles}
              </span>
            )}
          </span>
        </SidebarLink>
      </div>
      {hasChildren && expanded && (
        <div>
          {category.children!.map((child) => (
            <SidebarCategoryItem
              key={child.id}
              category={child}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full bg-infobox-header px-3 py-1 text-[11px] font-bold text-foreground uppercase tracking-wider hover:bg-surface-hover transition-colors"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="px-2 py-1">{children}</div>}
    </div>
  );
}

function SidebarLink({
  href,
  active,
  onClick,
  children,
  indent,
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "block py-[3px] text-[13px] transition-colors",
        indent ? "px-4" : "px-2",
        active ? "font-bold text-heading" : "text-wiki-link hover:underline"
      )}
    >
      {children}
    </Link>
  );
}
