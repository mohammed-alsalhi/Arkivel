import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import DocumentTitle from "@/components/layout/DocumentTitle";
import LayoutShell from "@/components/layout/LayoutShell";
import { AdminProvider } from "@/components/AdminContext";
import { ToastProvider } from "@/components/Toast";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import ReadOnlyBanner from "@/components/ReadOnlyBanner";
import { config } from "@/lib/config";
import { unstable_cache } from "next/cache";
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

// Apply the persisted theme before first paint so dark-mode readers do not get
// a white flash. The focused shell itself has no persisted layout state.
const bootstrapScript = `(function(){try{var r=document.documentElement;var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);r.setAttribute("data-theme",d?"dark":"light");}catch(e){}})();`;

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
          children: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }).catch(() => []),
      prisma.article.count({ where: { published: true, status: "published" } }).catch(() => 0),
      prisma.systemSetting.findUnique({ where: { id: "maintenance_mode" } }).catch(() => null),
      prisma.systemSetting.findUnique({ where: { id: "read_only_mode" } }).catch(() => null),
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
      data-style="simplesque"
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
          <LayoutShell>
            <Sidebar
              articleCount={articleCount}
              brandName={config.name}
              categories={categories}
              logoMark={config.logoMark}
            />

            <div className="wiki-content-shell">
              {maintenanceMode && <MaintenanceBanner />}
              {readOnlyMode && <ReadOnlyBanner />}
              <main id="main-content" className="wiki-main-content">
                {children}
              </main>
            </div>
          </LayoutShell>
          <DocumentTitle appName={config.name} />
        </ToastProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
