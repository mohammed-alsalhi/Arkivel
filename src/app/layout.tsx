import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BrandMark from "@/components/brand/BrandMark";
import Sidebar from "@/components/layout/Sidebar";
import DocumentTitle from "@/components/layout/DocumentTitle";
import LayoutShell from "@/components/layout/LayoutShell";
import MobileNavigation from "@/components/layout/MobileNavigation";
import SearchBar from "@/components/layout/SearchBar";
import UserMenu from "@/components/layout/UserMenu";
import { AdminProvider } from "@/components/AdminContext";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import CommandPalette from "@/components/CommandPalette";
import BackToTop from "@/components/BackToTop";
import QuickCapture from "@/components/QuickCapture";
import { ToastProvider } from "@/components/Toast";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import ReadOnlyBanner from "@/components/ReadOnlyBanner";
import prisma from "@/lib/prisma";
import { config } from "@/lib/config";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(config.baseUrl),
    title: {
      default: config.name,
      template: `${config.name} - %s`,
    },
    description: config.description,
    icons: {
      icon: [
        { url: config.appIcon, sizes: "512x512", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: [{ url: config.appIcon, sizes: "512x512", type: "image/png" }],
    },
    openGraph: {
      title: config.name,
      description: config.description,
      images: [{ url: config.logo, width: 1254, height: 1254, alt: `${config.name} logo` }],
    },
  };
}

async function getCategories() {
  try {
    const all = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { articles: true } },
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { articles: true } },
          },
        },
      },
    });
    // Return only root categories (no parent) with children nested
    return all.filter((c) => !c.parentId);
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();
  const articleCount = await prisma.article.count({ where: { published: true } }).catch(() => 0);
  const [maintenanceRecord, readOnlyRecord] = await Promise.all([
    prisma.pluginState.findUnique({ where: { id: "maintenance_mode" } }).catch(() => null),
    prisma.pluginState.findUnique({ where: { id: "read_only_mode" } }).catch(() => null),
  ]);
  const maintenanceMode = maintenanceRecord?.enabled ?? false;
  const readOnlyMode = readOnlyRecord?.enabled ?? false;

  return (
    <html
      lang="en"
      data-style={config.stylePreset.themeAttribute}
      data-color-theme={config.colorTheme.themeAttribute}
      data-layout={config.layoutPreset.envValue}
      suppressHydrationWarning
    >
      <head>
        <link rel="alternate" type="application/rss+xml" title={`${config.name} RSS Feed`} href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title={`${config.name} Atom Feed`} href="/feed/atom" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <AdminProvider>
        <ToastProvider>
          {/* Top banner bar */}
          <header className="bg-surface border-b border-border">
            <div className="wiki-topbar-inner flex min-h-10 items-center justify-between gap-2 sm:gap-3">
              <Link href="/" className="wiki-top-brand md:hidden" aria-label={`${config.name} home`}>
                <BrandMark className="wiki-top-brand-mark" imageSize={24} priority />
                <span>{config.name}</span>
              </Link>
              <div className="hidden min-w-0 md:block">
                <span className="block truncate text-[12px] text-muted">{config.tagline}</span>
              </div>
              <div className="ml-auto flex min-w-0 shrink items-center gap-1.5">
                <NotificationBell />
                <ThemeToggle />
                <SearchBar />
                <UserMenu />
              </div>
            </div>
          </header>

          <LayoutShell>
            {/* Sidebar */}
            <Sidebar categories={categories} articleCount={articleCount} />

            {/* Content area */}
            <div className="wiki-content-shell flex-1 min-w-0 bg-surface border-l border-border">
              <AnnouncementBanner />
              {maintenanceMode && <MaintenanceBanner />}
              {readOnlyMode && <ReadOnlyBanner />}
              <main id="main-content" className="wiki-main-content w-full max-w-none px-4 py-4 sm:px-6">
                {children}
              </main>
              <footer className="wiki-footer border-t border-border px-6 py-3 text-center text-[11px] text-muted">
                {config.name} &mdash; {config.footerText}
              </footer>
            </div>
          </LayoutShell>
          <MobileNavigation />
          <KeyboardShortcuts />
          <CommandPalette />
          <DocumentTitle appName={config.name} />
          <BackToTop />
          <QuickCapture />
        </ToastProvider>
        </AdminProvider>
        <Analytics />
      </body>
    </html>
  );
}
