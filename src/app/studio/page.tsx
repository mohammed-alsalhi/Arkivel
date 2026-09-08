import Link from "next/link";
import type { Metadata } from "next";
import { getStudioReport } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Studio",
  description: "A live command board that turns wiki articles, links, base views, review pressure, and JSON Canvas export into one workspace.",
};

export const dynamic = "force-dynamic";

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default async function StudioPage() {
  const report = await getStudioReport();
  const generatedAt = new Date(report.generatedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const nodeById = new Map(report.board.nodes.map((node) => [node.id, node]));

  const summaryItems = [
    ["Articles", formatNumber(report.summary.articles)],
    ["Board nodes", formatNumber(report.summary.boardNodes)],
    ["Links", formatNumber(report.summary.links)],
    ["Review queue", formatNumber(report.summary.reviewQueue)],
    ["Surfaces", formatNumber(report.summary.publishableSurfaces)],
    ["Generated", generatedAt],
  ];

  return (
    <div className="studio-page">
      <header className="ui-page-header studio-header">
        <div>
          <p className="ui-page-kicker">Studio</p>
          <h1 className="ui-page-title">Arkivel Studio</h1>
          <p className="ui-page-dek">
            A live operating board for the whole wiki: article canvas, database-style
            lanes, graph links, review pressure, and a portable JSON Canvas export.
          </p>
        </div>
        <div className="ui-page-actions">
          <Link href="/api/studio" className="ui-button">JSON feed</Link>
          <Link href="/api/studio/canvas" className="ui-button">Export .canvas</Link>
          <Link href="/canvas" className="ui-button ui-button-primary">Saved canvases</Link>
        </div>
      </header>

      <section className="studio-command-strip" aria-label="Studio summary">
        <div className="studio-score-panel">
          <span className="studio-score-value">{formatNumber(report.summary.boardNodes)}</span>
          <span className="studio-score-label">Live board nodes</span>
        </div>
        <div className="studio-summary-grid">
          {summaryItems.map(([label, value]) => (
            <div key={label} className="studio-summary-item">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-board-shell" aria-labelledby="studio-board-title">
        <div className="studio-board-heading">
          <div>
            <span>Generated canvas</span>
            <h2 id="studio-board-title">Knowledge board</h2>
          </div>
          <strong>{report.board.edges.length} connections</strong>
        </div>
        <div className="studio-board-scroll" role="region" aria-label="Live Studio canvas" tabIndex={0}>
          <div
            className="studio-board"
            style={{ width: report.board.width, height: report.board.height }}
          >
            <svg
              className="studio-board-links"
              viewBox={`0 0 ${report.board.width} ${report.board.height}`}
              aria-hidden="true"
            >
              {report.board.edges.map((edge) => {
                const source = nodeById.get(edge.source);
                const target = nodeById.get(edge.target);
                if (!source || !target) return null;

                const x1 = source.x + source.width / 2;
                const y1 = source.y + source.height / 2;
                const x2 = target.x + target.width / 2;
                const y2 = target.y + target.height / 2;

                return (
                  <g key={edge.id} className="studio-board-edge" data-tone={edge.tone}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} />
                    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2}>{edge.label}</text>
                  </g>
                );
              })}
            </svg>

            {report.board.nodes.map((node) => (
              <Link
                key={node.id}
                href={node.href}
                className="studio-board-node"
                data-tone={node.tone}
                data-type={node.type}
                style={{
                  height: node.height,
                  left: node.x,
                  top: node.y,
                  width: node.width,
                }}
              >
                <span className="studio-node-kicker">{node.type}</span>
                <span className="studio-node-title">{node.title}</span>
                <span className="studio-node-subtitle">{node.subtitle}</span>
                <span className="studio-node-meta">
                  <strong>{node.metric}</strong>
                  <em>{node.meta}</em>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="studio-section">
        <div className="studio-section-heading">
          <div>
            <h2>Base views</h2>
            <p>Structured lanes generated from review signals, stubs, orphan pages, taxonomy gaps, and stale work.</p>
          </div>
          <Link href="/api/studio" className="studio-section-link">Inspect feed</Link>
        </div>
        <div className="studio-base-grid">
          {report.bases.map((base) => (
            <article key={base.id} className="studio-base-card" data-tone={base.tone}>
              <div className="studio-base-topline">
                <Link href={base.href}>{base.title}</Link>
                <strong>{formatNumber(base.count)}</strong>
              </div>
              <p>{base.description}</p>
              <ol className="studio-base-items">
                {base.items.length === 0 ? (
                  <li>
                    <span>No queued items</span>
                    <em>clear</em>
                  </li>
                ) : (
                  base.items.map((item) => (
                    <li key={`${base.id}-${item.href}-${item.title}`}>
                      <Link href={item.href}>{item.title}</Link>
                      <em>{item.meta}</em>
                    </li>
                  ))
                )}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="studio-section">
        <div className="studio-section-heading">
          <div>
            <h2>Studio moves</h2>
            <p>Next actions that make the knowledge base more portable, connected, and publishable.</p>
          </div>
          <Link href="/graph" className="studio-section-link">Open graph</Link>
        </div>
        <div className="studio-action-grid">
          {report.actions.map((action) => (
            <Link key={action.title} href={action.href} className="studio-action-card" data-tone={action.tone}>
              <span>{action.command}</span>
              <strong>{action.title}</strong>
              <p>{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
