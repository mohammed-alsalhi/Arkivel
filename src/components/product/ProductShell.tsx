import type { ReactNode } from "react";
import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

const githubUrl = "https://github.com/mohammed-alsalhi/arkivel";

function ExternalArrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 3h8v8M13 3 3 13" />
    </svg>
  );
}

export default function ProductShell({ children }: { children: ReactNode }) {
  return (
    <div className="product-site-shell">
      <header className="product-site-header">
        <div className="product-site-header-inner">
          <Link href="/" className="product-site-brand" aria-label="Arkivel home">
            <BrandMark className="product-site-brand-mark" imageSize={32} priority />
            <span>Arkivel</span>
          </Link>
          <nav className="product-site-nav" aria-label="Product navigation">
            <Link href="/#product">Product</Link>
            <Link href="/docs">Docs</Link>
            <a href={githubUrl}>GitHub</a>
          </nav>
          <a className="product-button product-button-primary product-header-cta" href={githubUrl}>
            View on GitHub
            <ExternalArrow />
          </a>
        </div>
      </header>
      <main id="main-content" className="product-site-main">{children}</main>
      <footer className="product-site-footer">
        <div className="product-site-footer-inner">
          <Link href="/" className="product-site-brand product-site-footer-brand">
            <BrandMark className="product-site-brand-mark" imageSize={28} />
            <span>Arkivel</span>
          </Link>
          <nav aria-label="Footer navigation">
            <Link href="/#product">Product</Link>
            <Link href="/docs">Docs</Link>
            <a href={githubUrl}>GitHub</a>
            <a href={`${githubUrl}/blob/main/LICENSE`}>MIT License</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
