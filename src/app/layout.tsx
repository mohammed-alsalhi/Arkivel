import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/layout/SearchBar";
import { AdminProvider } from "@/components/AdminContext";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import BackToTop from "@/components/BackToTop";
import { ToastProvider } from "@/components/Toast";
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
    title: config.name,
    description: config.description,
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title={`${config.name} RSS Feed`} href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title={`${config.name} Atom Feed`} href="/feed/atom" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <AdminProvider>
        <ToastProvider>
          {/* Top banner bar */}
          <header className="bg-surface border-b border-border">
            <div className="flex items-center justify-between pl-4 pr-6 py-1.5">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted">{config.tagline}</span>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <ThemeToggle />
                <SearchBar />
              </div>
            </div>
          </header>

          <div className="flex min-h-[calc(100vh-40px)]">
            {/* Sidebar */}
            <Sidebar categories={categories} articleCount={articleCount} />

            {/* Content area */}
            <div className="flex-1 min-w-0 bg-surface border-l border-border">
              <main id="main-content" className="max-w-6xl px-6 py-4">
                {children}
              </main>
              <footer className="border-t border-border px-6 py-3 text-center text-[11px] text-muted">
                {config.name} &mdash; {config.footerText}
              </footer>
            </div>
          </div>
        <KeyboardShortcuts />
        <BackToTop />
        </ToastProvider>
        </AdminProvider>
        <Analytics />
      </body>
    </html>
  );
}
