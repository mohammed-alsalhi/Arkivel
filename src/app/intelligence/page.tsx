import Link from "next/link";
import type { Metadata } from "next";
import IntelligenceCockpit from "@/components/intelligence/IntelligenceCockpit";
import { getIntelligenceReport } from "@/lib/intelligence";

export const metadata: Metadata = {
  title: "Knowledge Command Center",
  description: "A live wiki cockpit with article constellation, readiness radar, impact simulator, and twenty operational intelligence engines.",
};

export const dynamic = "force-dynamic";

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default async function IntelligencePage() {
  const report = await getIntelligenceReport();
  const engineCount = report.sections.reduce((count, section) => count + section.cards.length, 0);

  const summaryItems = [
    ["Published", formatNumber(report.summary.published)],
    ["Drafts", formatNumber(report.summary.drafts)],
    ["Reviews", formatNumber(report.summary.reviews)],
    ["Categories", formatNumber(report.summary.categories)],
    ["Tags", formatNumber(report.summary.tags)],
    ["Wiki links", formatNumber(report.summary.links)],
    ["Words", formatNumber(report.summary.words)],
    ["Revisions", formatNumber(report.summary.revisions)],
  ];

  return (
    <div className="intelligence-page">
      <header className="ui-page-header intelligence-header">
        <div>
          <p className="ui-page-kicker">Intelligence</p>
          <h1 className="ui-page-title">Knowledge Command Center</h1>
          <p className="ui-page-dek">
            A live operational cockpit for the whole wiki: graph constellation,
            readiness radar, impact simulation, quality engines, audience demand,
            and the next best work to do.
          </p>
        </div>
        <div className="ui-page-actions">
          <Link href="/api/intelligence" className="ui-button">JSON feed</Link>
          <Link href="/health" className="ui-button">Wiki health</Link>
          <Link href="/admin/quality" className="ui-button ui-button-primary">Quality queue</Link>
        </div>
      </header>

      <section className="intelligence-command-strip" aria-label="Command center summary">
        <div className="intelligence-score-panel">
          <span className="intelligence-score-value">{report.readinessScore}%</span>
          <span className="intelligence-score-label">Mission readiness</span>
        </div>
        <div className="intelligence-summary-grid">
          {summaryItems.map(([label, value]) => (
            <div key={label} className="intelligence-summary-item">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <IntelligenceCockpit report={report} />

      <section className="wiki-portal intelligence-actions">
        <div className="wiki-portal-header">
          <span>Next best moves</span>
          <span className="wiki-portal-header-link">{engineCount} live engines</span>
        </div>
        <div className="wiki-portal-body p-0">
          <ol className="intelligence-action-list">
            {report.actions.map((action) => (
              <li key={action.title} className="intelligence-action-row">
                <span className="intelligence-priority" data-priority={action.priority}>{action.priority}</span>
                <div className="min-w-0">
                  <Link href={action.href} className="intelligence-action-title">{action.title}</Link>
                  <p>{action.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {report.sections.map((section) => (
        <section key={section.id} className="intelligence-section">
          <div className="intelligence-section-heading">
            <div>
              <h2>{section.title}</h2>
              <p>{section.subtitle}</p>
            </div>
            <span>{section.cards.length} engines</span>
          </div>
          <div className="intelligence-card-grid">
            {section.cards.map((card) => (
              <article key={card.id} className="intelligence-card" data-tone={card.tone}>
                <div className="intelligence-card-topline">
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                </div>
                <p className="intelligence-card-label">{card.label}</p>
                <p className="intelligence-card-description">{card.description}</p>
                <Link href={card.href} className="intelligence-card-link">{card.cta}</Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
