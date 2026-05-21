import Link from "next/link";
import type { Metadata } from "next";
import { getCanonAtlasReport } from "@/lib/canon-atlas";

export const metadata: Metadata = {
  title: "Canon Atlas",
  description: "A live atlas for territories, dossiers, story threads, and continuity pressure across the wiki.",
};

export const dynamic = "force-dynamic";

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default async function AtlasPage() {
  const report = await getCanonAtlasReport();
  const signalById = new Map(report.signals.map((signal) => [signal.id, signal]));

  return (
    <div className="atlas-page">
      <header className="ui-page-header atlas-header">
        <div>
          <p className="ui-page-kicker">Atlas</p>
          <h1 className="ui-page-title">Canon Atlas</h1>
          <p className="ui-page-dek">
            A living world map for the wiki: territories, flagship dossiers,
            story threads, continuity pressure, and the next work that makes
            the canon feel bigger than a list of pages.
          </p>
        </div>
        <div className="ui-page-actions">
          <Link href="/api/atlas" className="ui-button">JSON feed</Link>
          <Link href="/graph" className="ui-button">Article graph</Link>
          <Link href="/articles/new" className="ui-button ui-button-primary">Create article</Link>
        </div>
      </header>

      <section className="atlas-hero" aria-label="Canon atlas overview">
        <div className="atlas-map-panel">
          <div className="atlas-panel-heading">
            <div>
              <span>Live map</span>
              <h2>Territories and threads</h2>
            </div>
            <strong>{formatNumber(report.summary.territories)} zones</strong>
          </div>
          <svg className="atlas-map" viewBox="0 0 100 100" role="img" aria-label="Canon atlas map">
            <rect className="atlas-map-frame" x="4" y="4" width="92" height="92" rx="0" />
            <circle className="atlas-map-ring" cx="50" cy="50" r="39" />
            <circle className="atlas-map-ring atlas-map-ring-inner" cx="50" cy="50" r="25" />
            {report.territories.map((territory) => (
              <a key={territory.id} href={territory.href} className="atlas-territory-node" data-tone={territory.tone}>
                <circle cx={territory.x} cy={territory.y} r={territory.radius + 2.2} />
                <circle cx={territory.x} cy={territory.y} r={territory.radius} />
                <text x={territory.x} y={territory.y + 0.8}>{territory.title}</text>
              </a>
            ))}
            {report.threads.map((thread) => {
              const source = signalById.get(thread.sourceId);
              const target = signalById.get(thread.targetId);
              if (!source || !target) return null;

              return (
                <a key={`${thread.sourceId}-${thread.targetId}`} href={thread.sourceHref} className="atlas-thread-link">
                  <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
                </a>
              );
            })}
            {report.signals.map((signal) => (
              <a key={signal.id} href={signal.href} className="atlas-signal-node" data-tone={signal.tone}>
                <circle cx={signal.x} cy={signal.y} r={signal.radius + 1.3} />
                <circle cx={signal.x} cy={signal.y} r={signal.radius} />
              </a>
            ))}
          </svg>
        </div>

        <aside className="atlas-dossier-panel" aria-label="Featured atlas dossier">
          <div className="atlas-panel-heading">
            <div>
              <span>Flagship dossier</span>
              <h2>Atlas anchor</h2>
            </div>
            <strong>{formatNumber(report.dossier.words)}</strong>
          </div>
          <div className="atlas-dossier-body">
            <Link href={report.dossier.href} className="atlas-dossier-title">{report.dossier.title}</Link>
            <div className="atlas-dossier-meta">
              <span>{report.dossier.category}</span>
              <span>{report.dossier.updated}</span>
            </div>
            <p>{report.dossier.excerpt}</p>
          </div>
          <div className="atlas-summary-strip">
            <div>
              <strong>{formatNumber(report.summary.articles)}</strong>
              <span>Articles</span>
            </div>
            <div>
              <strong>{formatNumber(report.summary.signals)}</strong>
              <span>Signals</span>
            </div>
            <div>
              <strong>{formatNumber(report.summary.threads)}</strong>
              <span>Threads</span>
            </div>
            <div>
              <strong>{formatNumber(report.summary.words)}</strong>
              <span>Words</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="atlas-grid">
        <div className="wiki-portal atlas-territory-ledger">
          <div className="wiki-portal-header">
            <span>Territory ledger</span>
            <span className="wiki-portal-header-link">{formatNumber(report.territories.length)} visible</span>
          </div>
          <div className="wiki-portal-body p-0">
            {report.territories.map((territory) => (
              <Link key={territory.id} href={territory.href} className="atlas-ledger-row">
                <span className="atlas-ledger-title">{territory.title}</span>
                <span>{formatNumber(territory.articles)} articles</span>
                <em>{territory.summary}</em>
              </Link>
            ))}
          </div>
        </div>

        <div className="wiki-portal atlas-continuity-panel">
          <div className="wiki-portal-header">Continuity pressure</div>
          <div className="wiki-portal-body p-0">
            {report.continuity.map((metric) => (
              <Link key={metric.label} href={metric.href} className="atlas-continuity-row" data-tone={metric.tone}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <em>{metric.detail}</em>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="atlas-grid atlas-bottom-grid">
        <div className="wiki-portal atlas-thread-panel">
          <div className="wiki-portal-header">
            <span>Story threads</span>
            <span className="wiki-portal-header-link">{formatNumber(report.threads.length)} routes</span>
          </div>
          <div className="wiki-portal-body p-0">
            {report.threads.map((thread) => (
              <div key={`${thread.sourceId}-${thread.targetId}`} className="atlas-thread-row">
                <Link href={thread.sourceHref}>{thread.sourceTitle}</Link>
                <span>links to</span>
                <Link href={thread.targetHref}>{thread.targetTitle}</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="wiki-portal atlas-actions-panel">
          <div className="wiki-portal-header">Atlas moves</div>
          <div className="wiki-portal-body p-0">
            {report.actions.map((action) => (
              <Link key={action.title} href={action.href} className="atlas-action-row" data-priority={action.priority}>
                <span>{action.priority}</span>
                <strong>{action.title}</strong>
                <em>{action.description}</em>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
