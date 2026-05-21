import Link from "next/link";
import type { Metadata } from "next";
import { getCanonTrailsReport } from "@/lib/canon-trails";

export const metadata: Metadata = {
  title: "Canon Trails",
  description: "Guided reading routes through the wiki's canon, recent work, deep pages, and repair paths.",
};

export const dynamic = "force-dynamic";

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default async function TrailsPage() {
  const report = await getCanonTrailsReport();
  const featuredTrail = report.trails[0];

  return (
    <div className="trails-page">
      <header className="ui-page-header trails-header">
        <div>
          <p className="ui-page-kicker">Reader routes</p>
          <h1 className="ui-page-title">Canon Trails</h1>
          <p className="ui-page-dek">
            Guided routes through the wiki that behave like playable reading
            paths: start with the strongest canon route, jump into recent work,
            sink into deep pages, or walk a repair path that improves the wiki
            as you read.
          </p>
        </div>
        <div className="ui-page-actions">
          <Link href="/api/trails" className="ui-button">JSON feed</Link>
          <Link href="/atlas" className="ui-button">Canon atlas</Link>
          <Link href={featuredTrail?.stops[0]?.href ?? "/articles"} className="ui-button ui-button-primary">Start trail</Link>
        </div>
      </header>

      <section className="trails-hero" aria-label="Featured reading trail">
        <div className="trails-reader-panel">
          <div className="trails-panel-heading">
            <div>
              <span>Featured path</span>
              <h2>{featuredTrail?.title ?? "Starter Trail"}</h2>
            </div>
            <strong>{featuredTrail?.estimatedMinutes ?? 1} min</strong>
          </div>
          <div className="trails-path">
            {(featuredTrail?.stops ?? []).map((stop, index) => (
              <article key={stop.id} className="trails-stop" data-index={index + 1}>
                <div className="trails-stop-marker">
                  <span>{index + 1}</span>
                </div>
                <div className="trails-stop-body">
                  <Link href={stop.href} className="trails-stop-title">{stop.title}</Link>
                  <div className="trails-stop-meta">
                    <span>{stop.category}</span>
                    <span>{formatNumber(stop.words)} words</span>
                    <span>{formatNumber(stop.wikiLinks)} links</span>
                  </div>
                  <p>{stop.excerpt.length > 220 ? `${stop.excerpt.slice(0, 220)}...` : stop.excerpt}</p>
                  <em>{stop.reason}</em>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="trails-command-panel" aria-label="Trail overview">
          <div className="trails-panel-heading">
            <div>
              <span>Route system</span>
              <h2>Reading engine</h2>
            </div>
            <strong>{formatNumber(report.summary.trails)}</strong>
          </div>
          <div className="trails-summary-grid">
            <div>
              <strong>{formatNumber(report.summary.stops)}</strong>
              <span>Unique stops</span>
            </div>
            <div>
              <strong>{formatNumber(report.summary.words)}</strong>
              <span>Routed words</span>
            </div>
            <div>
              <strong>{formatNumber(report.summary.links)}</strong>
              <span>Wiki links</span>
            </div>
            <div>
              <strong>{report.generatedAt.slice(0, 10)}</strong>
              <span>Generated</span>
            </div>
          </div>
          <div className="trails-guide-copy">
            <p>
              Trails are assembled from real article content, wiki links,
              backlinks, categories, freshness, length, and engagement signals.
              They are meant to be read, not monitored.
            </p>
          </div>
        </aside>
      </section>

      <section className="trails-grid" aria-label="Available reading trails">
        {report.trails.map((trail) => (
          <article key={trail.id} className="trails-card" data-tone={trail.tone}>
            <div className="trails-card-top">
              <span>{trail.stops.length} stops</span>
              <strong>{trail.estimatedMinutes} min</strong>
            </div>
            <h2>{trail.title}</h2>
            <p>{trail.subtitle}</p>
            <div className="trails-mini-route">
              {trail.stops.slice(0, 5).map((stop, index) => (
                <Link key={stop.id} href={stop.href} title={stop.title}>
                  {index + 1}
                </Link>
              ))}
            </div>
            <Link href={trail.stops[0]?.href ?? "/articles"} className="trails-card-link">Begin route</Link>
          </article>
        ))}
      </section>
    </div>
  );
}
