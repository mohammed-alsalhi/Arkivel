"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { IntelligenceConstellationNode, IntelligenceReport } from "@/lib/intelligence";

type PressureKey = keyof IntelligenceReport["pressures"];

type Lever = {
  key: PressureKey;
  label: string;
  gain: number;
  href: string;
};

const levers: Lever[] = [
  { key: "stubs", label: "Expand stubs", gain: 9, href: "/articles" },
  { key: "orphans", label: "Rescue orphans", gain: 9, href: "/graph" },
  { key: "brokenLinks", label: "Repair dead links", gain: 12, href: "/coverage" },
  { key: "stale", label: "Refresh stale canon", gain: 7, href: "/admin/staleness" },
  { key: "taxonomyDebt", label: "Organize taxonomy", gain: 8, href: "/categories" },
  { key: "unverified", label: "Verify facts", gain: 7, href: "/admin/quality" },
];

function shortTitle(value: string): string {
  return value.length > 16 ? `${value.slice(0, 14)}...` : value;
}

function radarPoint(index: number, total: number, value: number): string {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  const radius = 39 * (value / 100);
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function ringPoints(total: number, value: number): string {
  return Array.from({ length: total }, (_, index) => radarPoint(index, total, value)).join(" ");
}

export default function IntelligenceCockpit({ report }: { report: IntelligenceReport }) {
  const fallbackNodes = useMemo(() => {
    const cards = report.sections.flatMap((section) => section.cards).slice(0, 12);
    const count = Math.max(1, cards.length - 1);

    return cards.map((card, index): IntelligenceConstellationNode => {
      const angle = -Math.PI / 2 + ((Math.max(0, index - 1) / count) * Math.PI * 2);
      const orbit = index === 0 ? 0 : index <= 5 ? 30 : 42;

      return {
        id: `engine-${card.id}`,
        title: card.title,
        href: card.href,
        label: card.label,
        value: index === 0 ? report.readinessScore : index + 1,
        x: index === 0 ? 50 : Math.round((50 + Math.cos(angle) * orbit) * 10) / 10,
        y: index === 0 ? 50 : Math.round((50 + Math.sin(angle) * orbit) * 10) / 10,
        radius: index === 0 ? 8.5 : 5.8,
        tone: card.tone,
      };
    });
  }, [report.readinessScore, report.sections]);
  const atlasNodes = report.constellation.nodes.length > 0 ? report.constellation.nodes : fallbackNodes;
  const atlasLinks = report.constellation.nodes.length > 0
    ? report.constellation.links
    : fallbackNodes.slice(1).map((node) => ({ source: fallbackNodes[0]?.id ?? "", target: node.id }));
  const atlasMode = report.constellation.nodes.length > 0 ? "article" : "engine";
  const [selectedNodeId, setSelectedNodeId] = useState(atlasNodes[0]?.id ?? "");
  const [projection, setProjection] = useState<Record<PressureKey, number>>({
    stubs: 0,
    orphans: 0,
    brokenLinks: 0,
    stale: 0,
    taxonomyDebt: 0,
    reviewDue: 0,
    unverified: 0,
    cleanupTagged: 0,
  });

  const nodeById = useMemo(
    () => new Map(atlasNodes.map((node) => [node.id, node])),
    [atlasNodes]
  );
  const selectedNode = nodeById.get(selectedNodeId) ?? atlasNodes[0];
  const visibleLinks = atlasLinks
    .map((link) => ({ source: nodeById.get(link.source), target: nodeById.get(link.target) }))
    .filter((link): link is { source: IntelligenceConstellationNode; target: IntelligenceConstellationNode } => Boolean(link.source && link.target));

  const projectedGain = levers.reduce((sum, lever) => {
    const max = report.pressures[lever.key];
    if (max <= 0) return sum;
    return sum + (projection[lever.key] / max) * lever.gain;
  }, 0);
  const projectedScore = Math.min(100, report.readinessScore + Math.round(projectedGain));
  const radarPolygon = report.radar.map((metric, index) => radarPoint(index, report.radar.length, metric.value)).join(" ");

  return (
    <section className="intelligence-cockpit" aria-label="Operational cockpit">
      <div className="intelligence-atlas-panel">
        <div className="intelligence-cockpit-heading">
          <div>
            <span>Live atlas</span>
            <h2>{atlasMode === "article" ? "Knowledge constellation" : "Engine constellation"}</h2>
          </div>
          <strong>{atlasNodes.length} nodes</strong>
        </div>

        {atlasNodes.length > 0 ? (
          <div className="intelligence-atlas-stage">
            <svg className="intelligence-atlas" viewBox="0 0 100 100" role="img" aria-label={atlasMode === "article" ? "Top connected articles in the wiki" : "Command-center engines arranged as a constellation"}>
              <circle className="intelligence-atlas-ring" cx="50" cy="50" r="42" />
              <circle className="intelligence-atlas-ring intelligence-atlas-ring-inner" cx="50" cy="50" r="30" />
              <circle className="intelligence-atlas-pulse" cx="50" cy="50" r="12" />
              {visibleLinks.map((link) => (
                <line
                  key={`${link.source.id}-${link.target.id}`}
                  className="intelligence-atlas-link"
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                />
              ))}
              {atlasNodes.map((node) => (
                <a
                  key={node.id}
                  href={node.href}
                  className="intelligence-atlas-node"
                  data-tone={node.tone}
                  data-selected={node.id === selectedNode?.id}
                  onFocus={() => setSelectedNodeId(node.id)}
                  onMouseEnter={() => setSelectedNodeId(node.id)}
                >
                  <circle cx={node.x} cy={node.y} r={node.radius + 1.4} />
                  <circle cx={node.x} cy={node.y} r={node.radius} />
                  <text x={node.x} y={node.y + node.radius + 4.6}>{shortTitle(node.title)}</text>
                </a>
              ))}
            </svg>
            <div className="intelligence-atlas-readout">
              <span>{atlasMode === "article" ? "Selected article" : "Selected engine"}</span>
              {selectedNode ? (
                <>
                  <Link href={selectedNode.href}>{selectedNode.title}</Link>
                  <p>{selectedNode.label} / {selectedNode.value.toLocaleString("en-US")} {atlasMode === "article" ? "graph signals" : "signal weight"}</p>
                </>
              ) : (
                <p>No atlas nodes yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="intelligence-empty-cockpit">
            <strong>No constellation yet</strong>
            <p>Publish articles with wiki links to light up the live atlas.</p>
            <Link href="/articles/new" className="ui-button ui-button-primary">Create article</Link>
          </div>
        )}
      </div>

      <div className="intelligence-cockpit-side">
        <div className="intelligence-radar-panel">
          <div className="intelligence-cockpit-heading">
            <div>
              <span>Signal shape</span>
              <h2>Readiness radar</h2>
            </div>
            <strong>{report.readinessScore}%</strong>
          </div>
          <div className="intelligence-radar-grid">
            <svg className="intelligence-radar" viewBox="0 0 100 100" role="img" aria-label="Readiness radar by wiki dimension">
              {[25, 50, 75, 100].map((ring) => (
                <polygon key={ring} points={ringPoints(report.radar.length, ring)} />
              ))}
              {report.radar.map((metric, index) => {
                const outer = radarPoint(index, report.radar.length, 100).split(",");
                const inner = radarPoint(index, report.radar.length, 0).split(",");
                return (
                  <line
                    key={metric.label}
                    x1={inner[0]}
                    y1={inner[1]}
                    x2={outer[0]}
                    y2={outer[1]}
                  />
                );
              })}
              <polygon className="intelligence-radar-fill" points={radarPolygon} />
              {report.radar.map((metric, index) => {
                const [x, y] = radarPoint(index, report.radar.length, metric.value).split(",");
                return <circle key={metric.label} className="intelligence-radar-dot" cx={x} cy={y} r="2" />;
              })}
            </svg>
            <div className="intelligence-radar-list">
              {report.radar.map((metric) => (
                <div key={metric.label} className="intelligence-radar-row">
                  <span>{metric.label}</span>
                  <strong>{metric.value}%</strong>
                  <em>{metric.detail}</em>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="intelligence-simulator-panel">
          <div className="intelligence-cockpit-heading">
            <div>
              <span>Impact model</span>
              <h2>Readiness simulator</h2>
            </div>
            <strong>{projectedScore}%</strong>
          </div>
          <div className="intelligence-score-delta">
            <span>Now {report.readinessScore}%</span>
            <span>Projected +{Math.max(0, projectedScore - report.readinessScore)} pts</span>
          </div>
          <div className="intelligence-lever-list">
            {levers.map((lever) => {
              const max = report.pressures[lever.key];
              const value = projection[lever.key];

              return (
                <label key={lever.key} className="intelligence-lever">
                  <span>
                    <Link href={lever.href}>{lever.label}</Link>
                    <strong>{value.toLocaleString("en-US")} / {max.toLocaleString("en-US")}</strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, max)}
                    value={value}
                    disabled={max === 0}
                    onChange={(event) => {
                      const nextValue = Math.min(max, Number(event.target.value));
                      setProjection((current) => ({ ...current, [lever.key]: nextValue }));
                    }}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
