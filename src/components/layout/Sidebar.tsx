"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useLoggedIn } from "@/components/AdminContext";
import BrandMark from "@/components/brand/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import CommandPalette, { openCommandPalette } from "@/components/layout/CommandPalette";
import UserMenu from "@/components/layout/UserMenu";
import { config } from "@/lib/config";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { generateSlug } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";

type Category = {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
};

function safePathSegment(value: string | null | undefined, fallback: string, id: string): string {
  const raw = (value?.trim() || generateSlug(fallback) || id).replace(/^\/+|\/+$/g, "");
  return encodeURIComponent(raw);
}

function categoryPath(category: Category): string {
  return `/categories/${safePathSegment(category.slug, category.name, category.id)}`;
}

function isPathActive(pathname: string, href: string): boolean {
  try {
    const current = decodeURIComponent(pathname);
    const target = decodeURIComponent(href);
    return current === target || current.startsWith(`${target}/`);
  } catch {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
}

/** localStorage key for a space's open/closed state. */
function openStateKey(id: string): string {
  return `sidebar:open:${id}`;
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

const navIconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function SearchIcon() {
  return (
    <svg {...navIconProps}>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M4 5h16v14H4z" />
      <path d="M4 14h5l1.5 2.5h3L15 14h5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg {...navIconProps}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M8 3h7l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v4h4" />
      <path d="M4 7v13a1 1 0 0 0 1 1h10" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M3 12V4h8l9 9-8 8-9-9z" />
      <circle cx="7.5" cy="8.5" r="1.25" />
    </svg>
  );
}

function GraphIcon() {
  return (
    <svg {...navIconProps}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <circle cx="10" cy="18" r="2.5" />
      <path d="M8.2 7.2 15.6 8.1M7.2 8.3l1.9 7.3M12.3 16.8l4.4-6.6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg {...navIconProps}>
      <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg {...navIconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg {...navIconProps} width={14} height={14} strokeWidth={2}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

const subscribeToNothing = () => () => {};
const isApplePlatform = () => /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

export default function Sidebar({
  brandName,
  categories,
  articleCount = 0,
  logoMark,
}: {
  brandName: string;
  categories: Category[];
  articleCount?: number;
  logoMark: string;
}) {
  const pathname = usePathname();
  const loggedIn = useLoggedIn();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const asideRef = useRef<HTMLElement>(null);
  // null on the server and during hydration, so the kbd hint never mismatches.
  const isMac = useSyncExternalStore(subscribeToNothing, isApplePlatform, () => null);

  // Navigating from the palette bypasses the link onClick handlers, so close
  // the drawer whenever the route changes (adjusting state during render).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useScrollLock(mobileOpen);
  useFocusTrap(asideRef, mobileOpen);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="wiki-navigation"
        className="wiki-main-menu-button"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="wiki-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={close}
        />
      )}

      <aside
        ref={asideRef}
        id="wiki-navigation"
        className={clsx("wiki-sidebar", mobileOpen && "wiki-sidebar-open")}
        aria-label="Wiki navigation"
        // As a mobile drawer this covers the page, so it becomes a modal dialog.
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
      >
        {/* Workspace row: mark + name, like a workspace switcher without the menu. */}
        <Link href="/" className="wiki-sidebar-brand" aria-label={`${brandName} home`} onClick={close}>
          <BrandMark className="wiki-sidebar-brand-mark" imageSize={42} logoMark={logoMark} priority />
          <span className="wiki-sidebar-brand-name">{brandName}</span>
        </Link>

        <nav className="wiki-sidebar-navigation">
          {/* Top group: search, inbox, new page (no section header). */}
          <div className="wiki-sidebar-section-links wiki-sidebar-top-group">
            <button
              type="button"
              className="wiki-sidebar-link wiki-sidebar-search-trigger"
              aria-label={`Search ${brandName}`}
              aria-keyshortcuts="Meta+K Control+K"
              onClick={openCommandPalette}
            >
              <span className="wiki-sidebar-link-icon">
                <SearchIcon />
              </span>
              <span className="wiki-sidebar-link-label">search</span>
              {isMac !== null && <kbd aria-hidden="true">{isMac ? "⌘K" : "ctrl K"}</kbd>}
            </button>
            <SidebarLink href="/recent-changes" active={pathname === "/recent-changes"} onClick={close} icon={<InboxIcon />}>
              inbox
            </SidebarLink>
            <SidebarLink href="/articles/new" active={pathname === "/articles/new"} onClick={close} icon={<PlusIcon />}>
              new page
            </SidebarLink>
          </div>

          <SidebarSection title="library">
            <SidebarLink
              href="/articles"
              active={pathname === "/articles" || (pathname.startsWith("/articles/") && pathname !== "/articles/new")}
              onClick={close}
              icon={<PagesIcon />}
            >
              all pages
            </SidebarLink>
            <SidebarLink href="/tags" active={isPathActive(pathname, "/tags")} onClick={close} icon={<TagIcon />}>
              tags
            </SidebarLink>
            <SidebarLink href="/graph" active={pathname === "/graph"} onClick={close} icon={<GraphIcon />}>
              graph
            </SidebarLink>
          </SidebarSection>

          <SidebarSection title="spaces">
            {categories.length > 0 ? (
              categories.map((category) => (
                <SidebarCategory
                  key={category.id}
                  category={category}
                  pathname={pathname}
                  onNavigate={close}
                />
              ))
            ) : (
              <p className="wiki-sidebar-empty">no spaces yet</p>
            )}
          </SidebarSection>
        </nav>

        <div className="wiki-sidebar-footer">
          {loggedIn && (
            <SidebarLink href="/settings" active={isPathActive(pathname, "/settings")} onClick={close} icon={<GearIcon />}>
              settings
            </SidebarLink>
          )}
          <div className="wiki-sidebar-footer-row">
            <div className="wiki-sidebar-footer-copy">
              <span>{articleCount.toLocaleString()} pages</span>
              <span aria-hidden="true">·</span>
              <span>v{config.version}</span>
            </div>
            <div className="wiki-sidebar-footer-actions">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </aside>

      <CommandPalette />
    </>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="wiki-sidebar-section" aria-labelledby={`sidebar-${title}`}>
      <h2 id={`sidebar-${title}`} className="wiki-sidebar-section-title">
        {title}
      </h2>
      <div className="wiki-sidebar-section-links">{children}</div>
    </section>
  );
}

/**
 * Open/closed state for a space, persisted per category id. The default is
 * rendered on the server (top level open, deeper levels closed); the stored
 * value is read only after mount so hydration never mismatches.
 */
function usePersistedOpen(id: string, defaultOpen: boolean): [boolean, () => void] {
  const [open, setOpen] = useState(defaultOpen);
  const key = openStateKey(id);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === "1") setOpen(true);
      else if (stored === "0") setOpen(false);
    } catch {
      // Storage may be unavailable (private mode, blocked); keep the default.
    }
  }, [key]);

  const toggle = () => {
    setOpen((current) => {
      const next = !current;
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        // Ignore quota or availability errors; the state still toggles.
      }
      return next;
    });
  };

  return [open, toggle];
}

function SidebarCategory({
  category,
  pathname,
  onNavigate,
  depth = 0,
}: {
  category: Category;
  pathname: string;
  onNavigate: () => void;
  depth?: number;
}) {
  const href = categoryPath(category);
  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const [open, toggle] = usePersistedOpen(category.id, depth === 0);
  const childrenId = `sidebar-space-${category.id}-children`;
  const active = isPathActive(pathname, href);

  return (
    <div className="wiki-sidebar-category">
      <div
        className={clsx("wiki-sidebar-row", active && "wiki-sidebar-row-active")}
        style={{ "--depth": depth } as CSSProperties}
      >
        {hasChildren ? (
          <button
            type="button"
            className={clsx("wiki-sidebar-chevron", open && "wiki-sidebar-chevron-open")}
            aria-expanded={open}
            aria-controls={childrenId}
            aria-label={`${open ? "collapse" : "expand"} ${category.name}`}
            onClick={toggle}
          >
            <ChevronIcon />
          </button>
        ) : (
          <span className="wiki-sidebar-chevron-spacer" aria-hidden="true" />
        )}
        <SidebarLink href={href} active={active} onClick={onNavigate} icon={<FolderIcon />}>
          {category.name}
        </SidebarLink>
      </div>
      {hasChildren && open && (
        <div id={childrenId} className="wiki-sidebar-category-children">
          {children.map((child) => (
            <SidebarCategory
              key={child.id}
              category={child}
              pathname={pathname}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  href,
  active,
  onClick,
  children,
  icon,
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={clsx("wiki-sidebar-link", active && "wiki-sidebar-link-active")}
    >
      {icon && <span className="wiki-sidebar-link-icon">{icon}</span>}
      <span className="wiki-sidebar-link-label">{children}</span>
    </Link>
  );
}
