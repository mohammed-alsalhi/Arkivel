"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/AdminContext";
import BrandMark from "@/components/brand/BrandMark";
import { config } from "@/lib/config";
import { generateSlug } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
  children?: Category[];
};

type MenuItem = {
  href: string;
  label: string;
  active?: (pathname: string) => boolean;
  indent?: boolean;
};

type SidebarSide = "left" | "right";

function getStoredSidebarSide(): SidebarSide {
  try {
    return localStorage.getItem("wiki_sidebar_position") === "right" ? "right" : "left";
  } catch {
    return "left";
  }
}

function safePathSegment(value: string | null | undefined, fallback: string, id: string): string {
  const raw = (value?.trim() || generateSlug(fallback) || id).replace(/^\/+|\/+$/g, "");
  return encodeURIComponent(raw);
}

function categoryPath(category: Category): string {
  return `/categories/${safePathSegment(category.slug, category.name, category.id)}`;
}

function isPathActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;

  try {
    return decodeURIComponent(pathname) === decodeURIComponent(href);
  } catch {
    return false;
  }
}

function defaultActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const [sidebarSide, setSidebarSide] = useState<SidebarSide>(getStoredSidebarSide);
  const isAdmin = useAdmin();
  const close = () => setMobileOpen(false);

  const mainItems: MenuItem[] = [
    { href: "/", label: "Main Page", active: (path) => path === "/" },
    { href: "/studio", label: "Arkivel Studio" },
    {
      href: "/articles",
      label: `Articles${articleCount ? ` (${articleCount})` : ""}`,
      active: (path) => path === "/articles" || path.startsWith("/articles/"),
    },
    { href: "/articles/new", label: "New article", active: (path) => path === "/articles/new" },
    { href: "/recent-changes", label: "Recent changes" },
    { href: "/search", label: "Search" },
  ];

  const discoverItems: MenuItem[] = [
    { href: "/atlas", label: "Canon atlas" },
    { href: "/trails", label: "Canon trails" },
    { href: "/intelligence", label: "Knowledge cockpit" },
    { href: "/graph", label: "Article graph" },
    { href: "/ask", label: "Ask my wiki" },
    { href: "/categories", label: "Categories", active: (path) => path === "/categories" || path.startsWith("/categories/") },
    { href: "/tags", label: "Tags", active: (path) => path === "/tags" || path.startsWith("/tags/") },
    { href: "/random", label: "Random article" },
    ...(config.mapEnabled ? [{ href: "/map", label: config.mapLabel, active: (path: string) => path === "/map" || path.startsWith("/map/") }] : []),
  ];

  const workItems: MenuItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/review", label: "Review queue" },
    { href: "/canvas", label: "Canvas", active: (path) => path === "/canvas" || path.startsWith("/canvas/") },
    { href: "/scratchpad", label: "Scratchpad" },
    { href: "/bookmarks", label: "Bookmarks" },
    { href: "/reading-lists", label: "Reading lists", active: (path) => path.startsWith("/reading-lists") },
    { href: "/watchlist", label: "Watchlist", active: (path) => path === "/watchlist" },
    { href: "/daily", label: "Daily note" },
  ];

  const moreItems: MenuItem[] = [
    { href: "/timeline", label: "Timeline" },
    { href: "/timeline/historical", label: "Historical timeline" },
    { href: "/popular", label: "Popular" },
    { href: "/series", label: "Series", active: (path) => path === "/series" || path.startsWith("/series/") },
    { href: "/digest", label: "Daily digest" },
    { href: "/coverage", label: "Coverage map" },
    { href: "/health", label: "Wiki health" },
    { href: "/glossary", label: "Glossary" },
    { href: "/explore", label: "Explore" },
    { href: "/activity", label: "Activity" },
    { href: "/discussions", label: "Discussions", active: (path) => path === "/discussions" || path.startsWith("/discussions/") },
    { href: "/compare", label: "Compare revisions" },
    { href: "/export", label: "Export" },
    { href: "/split", label: "Split view" },
    { href: "/present", label: "Present" },
    { href: "/assets", label: "Asset library" },
    { href: "/api-docs", label: "API docs" },
    { href: "/help", label: "Help" },
    { href: "/features", label: "Features" },
  ];

  const adminItems: MenuItem[] = [
    { href: "/admin", label: "Dashboard", active: (path) => path === "/admin" },
    { href: "/import", label: "Import articles" },
    { href: "/import/obsidian", label: "From Obsidian", indent: true },
    { href: "/import/notion", label: "From Notion", indent: true },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/metrics", label: "Metrics" },
    { href: "/admin/health", label: "Health" },
    { href: "/admin/lint", label: "Content lint" },
    { href: "/admin/quality", label: "Content quality" },
    { href: "/admin/knowledge-gaps", label: "Knowledge gaps" },
    { href: "/admin/embeddings", label: "Embeddings" },
    { href: "/admin/search-analytics", label: "Search analytics" },
    { href: "/admin/search-gaps", label: "Search gaps" },
    { href: "/admin/plugins", label: "Plugins" },
    { href: "/admin/webhooks", label: "Webhooks" },
    { href: "/admin/templates", label: "Templates" },
    { href: "/admin/theme", label: "Theme" },
    { href: "/admin/announcements", label: "Announcements" },
    { href: "/admin/categories", label: "Category merge" },
    { href: "/admin/tags", label: "Tag management" },
    { href: "/admin/redirects", label: "Redirects" },
    { href: "/admin/kanban", label: "Article pipeline" },
    { href: "/admin/content-schedule", label: "Content schedule" },
    { href: "/admin/audit-log", label: "Audit log" },
    { href: "/admin/maintenance", label: "Maintenance mode" },
    { href: "/admin/read-only", label: "Read-only mode" },
  ];

  useEffect(() => {
    function handleMobileToggle() {
      setMobileOpen((open) => !open);
    }

    function handleMobileClose() {
      setMobileOpen(false);
    }

    window.addEventListener("toggle-mobile-sidebar", handleMobileToggle);
    window.addEventListener("close-mobile-sidebar", handleMobileClose);
    return () => {
      window.removeEventListener("toggle-mobile-sidebar", handleMobileToggle);
      window.removeEventListener("close-mobile-sidebar", handleMobileClose);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mobile-sidebar-state-change", { detail: mobileOpen }));
  }, [mobileOpen]);

  function setSidebarPosition(next: SidebarSide) {
    setSidebarSide(next);
    try {
      localStorage.setItem("wiki_sidebar_position", next);
      window.dispatchEvent(new CustomEvent("sidebar-position-change", { detail: next }));
    } catch {}
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle main menu"
        aria-pressed={mobileOpen}
        className="wiki-main-menu-button ui-icon-button fixed top-1.5 left-2 z-50 bg-surface border-border text-foreground md:!hidden"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <aside
        data-side={sidebarSide}
        className={clsx(
          "wiki-sidebar fixed top-[40px] z-40 h-[calc(100vh-40px)] w-[212px] overflow-y-auto bg-sidebar-bg transition-[transform,opacity,visibility] flex flex-col",
          mobileOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "-translate-x-full max-md:opacity-0 max-md:invisible max-md:pointer-events-none",
          "md:sticky md:top-0 md:translate-x-0 md:h-auto md:min-h-[calc(100vh-40px)] md:flex-shrink-0 md:opacity-100 md:visible md:pointer-events-auto"
        )}
      >
        {/* Logo / Title */}
        <div className="border-b border-border px-3 py-3">
          <Link href="/" className="wiki-sidebar-brand hover:no-underline" onClick={close}>
            <BrandMark className="wiki-sidebar-brand-mark" imageSize={36} priority />
            <h1
              className="wiki-sidebar-brand-name"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {config.name}
            </h1>
          </Link>
        </div>

        <MenuSection title="Main" items={mainItems} pathname={pathname} onNavigate={close} />
        <MenuSection title="Discover" items={discoverItems} pathname={pathname} onNavigate={close} />
        <MenuSection title="Work" items={workItems} pathname={pathname} onNavigate={close} />
        <MenuSection title="More" items={moreItems} pathname={pathname} onNavigate={close} defaultOpen={false} />

        {isAdmin && (
          <MenuSection title="Admin" items={adminItems} pathname={pathname} onNavigate={close} defaultOpen={false} />
        )}

        {/* Categories */}
        <SidebarSection title="Categories" defaultOpen={false}>
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
        <div className="wiki-sidebar-footer mt-auto border-t border-border px-3 py-2 text-[10px] text-muted">
          <span>v{config.version}</span>
          <button
            type="button"
            title={sidebarSide === "right" ? "Dock sidebar on the left" : "Dock sidebar on the right"}
            onClick={() => setSidebarPosition(sidebarSide === "right" ? "left" : "right")}
            className="wiki-sidebar-dock-button"
            aria-label={sidebarSide === "right" ? "Dock sidebar on the left" : "Dock sidebar on the right"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {sidebarSide === "right" ? (
                <>
                  <rect x="3" y="4" width="18" height="16" rx="1" />
                  <path d="M9 4v16" />
                  <path d="M6 8h.01M6 12h.01M6 16h.01" />
                </>
              ) : (
                <>
                  <rect x="3" y="4" width="18" height="16" rx="1" />
                  <path d="M15 4v16" />
                  <path d="M18 8h.01M18 12h.01M18 16h.01" />
                </>
              )}
            </svg>
            <span>{sidebarSide === "right" ? "Dock left" : "Dock right"}</span>
          </button>
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
  const href = categoryPath(category);

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
          href={href}
          active={isPathActive(pathname, href)}
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

function MenuSection({
  title,
  items,
  pathname,
  onNavigate,
  defaultOpen = true,
}: {
  title: string;
  items: MenuItem[];
  pathname: string;
  onNavigate: () => void;
  defaultOpen?: boolean;
}) {
  return (
    <SidebarSection title={title} defaultOpen={defaultOpen}>
      {items.map((item) => (
        <SidebarLink
          key={`${title}-${item.href}-${item.label}`}
          href={item.href}
          active={item.active ? item.active(pathname) : defaultActive(pathname, item.href)}
          onClick={onNavigate}
          indent={item.indent}
        >
          {item.label}
        </SidebarLink>
      ))}
    </SidebarSection>
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
          className="flex items-center justify-between w-full bg-infobox-header px-3 py-1 text-[11px] font-bold text-foreground uppercase hover:bg-surface-hover transition-colors"
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
        "block py-[3px] text-[13px] transition-colors hover:no-underline",
        indent ? "px-4" : "px-2",
        active ? "bg-surface text-heading font-bold" : "text-wiki-link hover:bg-surface-hover"
      )}
    >
      {children}
    </Link>
  );
}
