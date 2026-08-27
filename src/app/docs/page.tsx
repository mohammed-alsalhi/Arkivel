import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Install, configure, secure, and deploy Arkivel.",
};

const githubUrl = "https://github.com/mohammed-alsalhi/arkivel";

export default function DocsPage() {
  return (
    <div className="product-docs-page">
      <header className="product-docs-hero">
        <h1>Build your knowledge space.</h1>
        <p>Install Arkivel, connect PostgreSQL, choose your deployment settings, and keep the operational boundary explicit.</p>
      </header>
      <div className="product-docs-layout">
        <nav aria-label="Documentation sections">
          <a href="#installation">Installation</a>
          <a href="#configuration">Configuration</a>
          <a href="#authentication">Authentication</a>
          <a href="#deployment">Deployment</a>
          <Link href="/api-docs">API reference</Link>
        </nav>
        <div className="product-docs-content">
          <section id="installation">
            <span>01</span><h2>Installation</h2>
            <p>Arkivel requires Node.js, PostgreSQL, and an object store only when you enable file uploads.</p>
            <pre><code>{`git clone https://github.com/mohammed-alsalhi/arkivel.git\ncd arkivel\nnpm install\ncp .env.example .env\nnpx prisma db push\nnpm run dev`}</code></pre>
          </section>
          <section id="configuration">
            <span>02</span><h2>Configuration</h2>
            <p>Set <code>DATABASE_URL</code>, an <code>ADMIN_SECRET</code>, and <code>NEXT_PUBLIC_BASE_URL</code>. Brand copy, logos, layouts, registration, discussions, and uploads are environment-driven.</p>
            <p>Use <code>ARKIVEL_SITE_MODE=product</code> only for a database-free public product and documentation deployment. Omit it for a working wiki.</p>
          </section>
          <section id="authentication">
            <span>03</span><h2>Authentication</h2>
            <p>A production wiki must define <code>ADMIN_SECRET</code>. Missing admin configuration intentionally leaves local development open and must not be used on a public wiki deployment.</p>
            <p>Multi-user installs can add viewer, editor, and admin accounts through Arkivel&apos;s database-backed session system.</p>
          </section>
          <section id="deployment">
            <span>04</span><h2>Deployment</h2>
            <p>Vercel is the native path for the current Next.js application. Back up PostgreSQL and review <code>npx prisma db push</code> as a separate release operation; application builds run <code>npm run build</code> and never mutate the schema or use <code>--accept-data-loss</code>.</p>
            <p>Use separate deployment projects—and separate databases—for independent Arkivel instances. The same public Git repository can remain the source for all of them.</p>
          </section>
          <section id="reference">
            <span>05</span><h2>Reference</h2>
            <div className="product-docs-links">
              <a href={`${githubUrl}/blob/main/docs/help.md`}>Product guide</a>
              <a href={`${githubUrl}/blob/main/docs/features.md`}>Feature reference</a>
              <Link href="/api-docs">API reference</Link>
              <a href={`${githubUrl}/tree/main/docs`}>Maintainer documentation</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
