import Link from "next/link";

const githubUrl = "https://github.com/mohammed-alsalhi/arkivel";

function Arrow({ external = false }: { external?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      {external ? <path d="M7 4h9v9M16 4 5 15" /> : <path d="m4 10 12 0m-5-5 5 5-5 5" />}
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18-6-6 6-6M15 6l6 6-6 6" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 15h6M12 12v6" />
    </svg>
  );
}

export default function ProductHome() {
  const docs = [
    ["01", "Installation", "/docs#installation"],
    ["02", "Configuration", "/docs#configuration"],
    ["03", "Authentication", "/docs#authentication"],
    ["04", "Deployment", "/docs#deployment"],
    ["05", "API reference", "/api-docs"],
  ] as const;

  return (
    <div className="product-home">
      <section className="product-hero" aria-labelledby="product-hero-title">
        <div className="product-hero-copy">
          <h1 id="product-hero-title">Knowledge that stays yours.</h1>
          <p>Arkivel is the open-source, self-hosted knowledge platform for writing, linking, and exploring what matters.</p>
          <div className="product-hero-actions">
            <a className="product-button product-button-primary" href={githubUrl}>
              View on GitHub <Arrow external />
            </a>
            <Link className="product-button product-button-secondary" href="/docs">Read the docs</Link>
          </div>
        </div>

        <figure className="product-app-frame" role="img" aria-label="Arkivel article editor with a linked knowledge graph">
          <aside className="product-app-sidebar" aria-hidden="true">
            <div className="product-app-mini-brand">A</div>
            <div className="product-app-search">Search Arkivel…</div>
            <p>Library</p>
            <ul>
              <li>Inbox</li>
              <li className="is-active">All pages</li>
              <li>Tags</li>
              <li>Graph</li>
            </ul>
            <p>Spaces</p>
            <ul>
              <li>Engineering</li>
              <li className="is-nested">Architecture</li>
              <li className="is-selected">Decisions</li>
              <li>Research</li>
            </ul>
          </aside>
          <article className="product-app-document" aria-hidden="true">
            <div className="product-app-breadcrumb">Engineering / Decisions / Architecture decisions</div>
            <h2>Architecture decisions</h2>
            <p>This page records the key architecture decisions for Arkivel. Each decision links to its ADR and related notes.</p>
            <h3>Decisions</h3>
            <ul>
              <li><span>ADR-001:</span> PostgreSQL as the primary database</li>
              <li><span>ADR-002:</span> API-first platform</li>
              <li><span>ADR-003:</span> Environment-driven deployment boundaries</li>
              <li><span>ADR-004:</span> Portable export formats</li>
            </ul>
            <h3>Context</h3>
            <p>Arkivel is designed to be self-hosted, durable, and straightforward to operate.</p>
          </article>
          <aside className="product-app-graph" aria-hidden="true">
            <div className="product-app-tabs"><span className="is-active">Graph</span><span>Outline</span></div>
            <svg viewBox="0 0 260 360" role="img" aria-label="Architecture decisions link graph">
              <g className="graph-lines">
                <path d="M130 180 130 55M130 180 55 115M130 180 205 115M130 180 55 255M130 180 205 255M130 180 130 315" />
              </g>
              <g className="graph-nodes">
                <circle cx="130" cy="180" r="21" className="graph-node-active" />
                <circle cx="130" cy="55" r="12" />
                <circle cx="55" cy="115" r="12" />
                <circle cx="205" cy="115" r="12" />
                <circle cx="55" cy="255" r="12" />
                <circle cx="205" cy="255" r="12" />
                <circle cx="130" cy="315" r="12" />
              </g>
              <g className="graph-labels">
                <text x="130" y="184" textAnchor="middle">Current</text>
                <text x="130" y="30" textAnchor="middle">System</text>
                <text x="55" y="91" textAnchor="middle">Data</text>
                <text x="205" y="91" textAnchor="middle">API</text>
                <text x="55" y="285" textAnchor="middle">Model</text>
                <text x="205" y="285" textAnchor="middle">Deploy</text>
                <text x="130" y="345" textAnchor="middle">Security</text>
              </g>
            </svg>
          </aside>
        </figure>
      </section>

      <section className="product-proof-rail" aria-label="Arkivel platform summary">
        <h2>Open source. Self-hosted.<br />Built to last.</h2>
        <div><DatabaseIcon /><p><strong>PostgreSQL-backed</strong><span>Your knowledge uses a proven relational data model.</span></p></div>
        <div><LockIcon /><p><strong>Self-hosted by design</strong><span>Run Arkivel on infrastructure you control.</span></p></div>
        <div><CodeIcon /><p><strong>Open API</strong><span>Connect your tools through documented endpoints.</span></p></div>
      </section>

      <section id="product" className="product-workflow" aria-labelledby="workflow-title">
        <div className="product-section-heading">
          <h2 id="workflow-title">From scattered notes to a living system.</h2>
          <p>Write in a focused editor, connect ideas with wiki links, and explore the relationships that emerge.</p>
        </div>
        <div className="product-workflow-grid">
          <article className="product-workflow-step">
            <div className="product-step-heading"><span>01</span><h3>Write</h3></div>
            <div className="product-editor-fragment">
              <div className="product-outline"><small>Outline</small><span>1 Introduction</span><span>2 Core properties</span><span>3 Building in public</span></div>
              <div className="product-editor-body"><small>Saved</small><h4>Introduction</h4><p>Arkivel is an open-source knowledge platform for capturing and connecting your ideas.</p><p>Your notes, your links, your system.</p></div>
            </div>
          </article>
          <article className="product-workflow-step">
            <div className="product-step-heading"><span>02</span><h3>Connect</h3></div>
            <div className="product-link-fragment">
              <p>A knowledge system grows through small, atomic notes connected by meaningful <span>links.</span></p>
              <small>Link to page</small>
              <strong>Knowledge systems</strong>
              <span>/knowledge-systems</span>
              <strong>Atomic notes</strong>
              <span>/atomic-notes</span>
              <strong>Bidirectional linking</strong>
              <span>/bidirectional-linking</span>
            </div>
          </article>
          <article className="product-workflow-step">
            <div className="product-step-heading"><span>03</span><h3>Explore</h3></div>
            <div className="product-graph-fragment">
              <svg viewBox="0 0 440 290" role="img" aria-label="Knowledge systems graph">
                <g className="graph-lines">
                  <path d="M220 145 220 35M220 145 85 70M220 145 355 70M220 145 60 190M220 145 380 190M220 145 125 260M220 145 315 260" />
                </g>
                <g className="graph-nodes">
                  <circle cx="220" cy="145" r="18" className="graph-node-active" />
                  <circle cx="220" cy="35" r="9" /><circle cx="85" cy="70" r="9" /><circle cx="355" cy="70" r="9" />
                  <circle cx="60" cy="190" r="9" /><circle cx="380" cy="190" r="9" /><circle cx="125" cy="260" r="9" /><circle cx="315" cy="260" r="9" />
                </g>
                <g className="graph-labels">
                  <text x="220" y="150" textAnchor="middle">Core</text><text x="220" y="18" textAnchor="middle">Emergence</text>
                  <text x="85" y="50" textAnchor="middle">Properties</text><text x="355" y="50" textAnchor="middle">Atomic notes</text>
                  <text x="60" y="220" textAnchor="middle">Links</text><text x="380" y="220" textAnchor="middle">Context</text>
                  <text x="125" y="282" textAnchor="middle">Models</text><text x="315" y="282" textAnchor="middle">Backlinks</text>
                </g>
              </svg>
            </div>
          </article>
        </div>
      </section>

      <section className="product-ownership" aria-labelledby="ownership-title">
        <div className="product-ownership-copy">
          <h2 id="ownership-title">Own the stack.<br />Keep the context.</h2>
          <p>Run Arkivel on your infrastructure, connect PostgreSQL and object storage, and keep portable exports within reach.</p>
          <ul>
            <li><CodeIcon />Open-source code</li>
            <li><DatabaseIcon />Environment-driven configuration</li>
            <li><ExportIcon />Portable exports</li>
            <li><span className="product-brace-icon">&#123; &#125;</span>Documented API</li>
          </ul>
          <div className="product-hero-actions">
            <Link className="product-button product-button-blue" href="/docs#deployment">Deployment guide</Link>
            <Link className="product-button product-button-dark" href="/api-docs">Explore the API</Link>
          </div>
        </div>
        <div className="product-system-diagram" role="img" aria-label="Browser connects to Arkivel, which connects to PostgreSQL, object storage, and portable exports">
          <div className="system-node system-browser">Browser</div>
          <span className="system-arrow system-arrow-one" aria-hidden="true">→</span>
          <div className="system-node system-arkivel"><strong>A</strong><span>Arkivel</span><small>Web app</small><small>Search &amp; indexing</small><small>Export service</small></div>
          <span className="system-arrow system-arrow-two" aria-hidden="true">→</span>
          <div className="system-destinations">
            <div className="system-node">PostgreSQL</div>
            <div className="system-node">Object storage</div>
            <div className="system-node">Portable exports</div>
          </div>
        </div>
      </section>

      <section className="product-docs-cta" aria-labelledby="docs-cta-title">
        <div className="product-docs-copy">
          <h2 id="docs-cta-title">Start building with Arkivel.</h2>
          <p>Use the guides to deploy, configure, customize, and extend your own knowledge space.</p>
          <div className="product-hero-actions">
            <Link className="product-button product-button-primary" href="/docs">Read the docs</Link>
            <a className="product-text-link" href={githubUrl}>View source on GitHub <Arrow /></a>
          </div>
        </div>
        <div className="product-docs-index">
          {docs.map(([number, label, href]) => (
            <Link href={href} key={number}>
              <span>{number}</span><strong>{label}</strong><Arrow />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
