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
  icon: string | null;
  _count: { articles: number };
  children?: Category[];
};

export default function Sidebar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = useAdmin();

  const navItems = [
    { href: "/", label: "Main Page" },
    { href: "/articles", label: "All articles" },
    { href: "/categories", label: "Categories" },
    { href: "/recent-changes", label: "Recent changes" },
    { href: "/random", label: "Random article" },
    { href: "/graph", label: "Article graph" },
    ...(config.mapEnabled ? [{ href: "/map", label: config.mapLabel }] : []),
    { href: "/search", label: "Search" },
    { href: "/help", label: "Help" },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-1.5 left-2 z-50 bg-surface border border-border p-1.5 text-sm text-foreground md:hidden"
      >
        {mobileOpen ? "\u2715" : "\u2630"}
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
          <Link href="/" className="block text-center hover:no-underline">
            <h1
              className="text-lg font-bold text-heading"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {config.name}
            </h1>
          </Link>
        </div>

        {/* Navigation section */}
        <SidebarSection title="Navigation">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              active={pathname === item.href}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </SidebarLink>
          ))}
        </SidebarSection>

        {/* Contribute section (admin only) */}
        {isAdmin && (
          <SidebarSection title="Contribute">
            <SidebarLink href="/articles/new" onClick={() => setMobileOpen(false)}>
              Create new article
            </SidebarLink>
            <SidebarLink href="/import" onClick={() => setMobileOpen(false)}>
              Import articles
            </SidebarLink>
          </SidebarSection>
        )}

        {/* Tools section */}
        <SidebarSection title="Tools">
          <SidebarLink
            href="/export"
            active={pathname === "/export"}
            onClick={() => setMobileOpen(false)}
          >
            Export
          </SidebarLink>
          <SidebarLink
            href="/admin"
            active={pathname === "/admin"}
            onClick={() => setMobileOpen(false)}
          >
            {isAdmin ? "Admin (logged in)" : "Admin login"}
          </SidebarLink>
          {isAdmin && (
            <SidebarLink
              href="/admin/metrics"
              active={pathname === "/admin/metrics"}
              onClick={() => setMobileOpen(false)}
            >
              Metrics
            </SidebarLink>
          )}
          {isAdmin && (
            <SidebarLink
              href="/admin/plugins"
              active={pathname === "/admin/plugins"}
              onClick={() => setMobileOpen(false)}
            >
              Plugins
            </SidebarLink>
          )}
        </SidebarSection>

        {/* Categories section */}
        <SidebarSection title="Categories">
          {categories.map((cat) => (
            <SidebarCategoryItem
              key={cat.id}
              category={cat}
              pathname={pathname}
              depth={0}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </SidebarSection>

        {/* Version label */}
        <div className="mt-auto px-3 py-2 text-[10px] text-muted text-center">
          v{process.env.NEXT_PUBLIC_APP_VERSION}
        </div>
      </aside>
    </>
  );
}

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
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-muted w-4 flex-shrink-0 hover:text-foreground"
          >
            {expanded ? "\u25BC" : "\u25B6"}
          </button>
        )}
        {!hasChildren && <span className="w-4 flex-shrink-0" />}
        <SidebarLink
          href={`/categories/${category.slug}`}
          active={pathname === `/categories/${category.slug}`}
          onClick={onNavigate}
        >
          <span className="flex items-center justify-between w-full">
            <span>{category.icon} {category.name}</span>
            {category._count.articles > 0 && (
              <span className="text-[10px] text-muted">
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

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border">
      <h3
        className="bg-infobox-header px-3 py-1 text-[11px] font-bold text-foreground uppercase tracking-wider"
      >
        {title}
      </h3>
      <div className="px-2 py-1">
        {children}
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "block px-2 py-[3px] text-[13px] transition-colors",
        active
          ? "font-bold text-heading"
          : "text-wiki-link hover:underline"
      )}
    >
      {children}
    </Link>
  );
}
