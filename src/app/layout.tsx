import type { Metadata, Viewport } from "next";
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
import ServiceWorkerManager from "@/components/ServiceWorkerManager";
import { ToastProvider } from "@/components/Toast";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import ReadOnlyBanner from "@/components/ReadOnlyBanner";
import { config } from "@/lib/config";
import { unstable_cache } from "next/cache";
import { Analytics } from "@vercel/analytics/next";
import ProductShell from "@/components/product/ProductShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#181a1b" },
  ],
};

// Applies persisted theme and sidebar preferences before first paint so
// dark-mode users don't get a white flash and the shell doesn't shift.
const bootstrapScript = `(function(){try{var r=document.documentElement;var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);r.setAttribute("data-theme",d?"dark":"light");r.setAttribute("data-sidebar-side",localStorage.getItem("wiki_sidebar_position")==="right"?"right":"left");r.setAttribute("data-sidebar-open",localStorage.getItem("wiki_sidebar_desktop_open")!=="false"?"true":"false");}catch(e){}})();`;

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(config.baseUrl),
    title: {
      default: config.name,
      template: `${config.name} - %s`,
    },
    description: config.description,
    icons: {
      icon: [{ url: "/brand/arkivel-favicon.svg", sizes: "any", type: "image/svg+xml" }],
      apple: [{ url: config.appIcon, sizes: "512x512", type: "image/png" }],
    },
    openGraph: {
      title: config.name,
      description: config.description,
      images: [{ url: config.logo, width: 1254, height: 1254, alt: `${config.name} logo` }],
    },
  };
}

// These run on every request for every page; the data is global (not
// per-user) and changes rarely, so cache it briefly across requests.
const getShellData = unstable_cache(
  async () => {
    const { default: prisma } = await import("@/lib/prisma");
    const [allCategories, articleCount, maintenanceRecord, readOnlyRecord] = await Promise.all([
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { articles: true } },
          children: {
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { articles: true } } },
          },
        },
      }).catch(() => []),
      prisma.article.count({ where: { published: true } }).catch(() => 0),
      prisma.pluginState.findUnique({ where: { id: "maintenance_mode" } }).catch(() => null),
      prisma.pluginState.findUnique({ where: { id: "read_only_mode" } }).catch(() => null),
    ]);
    return {
      categories: allCategories.filter((category) => !category.parentId),
      articleCount,
      maintenanceMode: maintenanceRecord?.enabled ?? false,
      readOnlyMode: readOnlyRecord?.enabled ?? false,
    };
  },
  ["layout-shell-data"],
  { revalidate: 60 },
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (config.siteMode === "product") {
    return (
      <html lang="en" data-site-mode="product" data-scroll-behavior="smooth">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <a href="#main-content" className="skip-to-content">Skip to content</a>
          <ProductShell>{children}</ProductShell>
          <Analytics />
        </body>
      </html>
    );
  }

  const { getSession, isAdmin } = await import("@/lib/auth");
  const [{ categories, articleCount, maintenanceMode, readOnlyMode }, initialAdmin, initialSession] =
    await Promise.all([
      getShellData().catch(() => ({
        categories: [],
        articleCount: 0,
        maintenanceMode: false,
        readOnlyMode: false,
      })),
      isAdmin().catch(() => false),
      getSession().catch(() => null),
    ]);
  const initialAuth = { admin: initialAdmin, loggedIn: Boolean(initialSession) };

  return (
    <html
      lang="en"
      data-style={config.stylePreset.themeAttribute}
      data-color-theme={config.colorTheme.themeAttribute}
      data-layout={config.layoutPreset.envValue}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
        <link rel="alternate" type="application/rss+xml" title={`${config.name} RSS Feed`} href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title={`${config.name} Atom Feed`} href="/feed/atom" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <AdminProvider initialAuth={initialAuth}>
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
            <Sidebar
              articleCount={articleCount}
              brandName={config.name}
              categories={categories}
              logoMark={config.logoMark}
              styleId={config.styleId}
            />

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
          <ServiceWorkerManager />
        </ToastProvider>
        </AdminProvider>
        <Analytics />
      </body>
    </html>
  );
}
