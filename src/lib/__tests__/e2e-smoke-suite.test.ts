import { describe, expect, it } from "vitest";
import {
  E2E_PRODUCT_SMOKE_FLOWS,
  E2E_RESPONSIVE_SMOKE_ROUTES,
  createE2eSmokeSuiteReport,
  smokeFlowIsRequired,
} from "../e2e-smoke-suite";

describe("e2e smoke suite", () => {
  it("publishes required product smoke flows", () => {
    const report = createE2eSmokeSuiteReport();

    expect(report.contract.apiRoute).toBe("/api/e2e-smoke-suite");
    expect(report.productSmokePlan.map((item) => item.flow)).toEqual(E2E_PRODUCT_SMOKE_FLOWS);
    expect(report.productSmokePlan.every((item) => item.requiredForV5)).toBe(true);
    expect(smokeFlowIsRequired("admin-health")).toBe(true);
  });

  it("publishes responsive smoke routes and viewports", () => {
    const report = createE2eSmokeSuiteReport();

    expect(report.responsiveSmokePlan.map((item) => item.route)).toEqual(E2E_RESPONSIVE_SMOKE_ROUTES);
    expect(report.responsiveSmokePlan.every((item) => item.requiredViewports.includes("phone"))).toBe(true);
  });

  it("documents fixture seeding and failure artifacts", () => {
    const report = createE2eSmokeSuiteReport();

    expect(report.fixtureSeedPlan.script).toBe("scripts/seed-smoke-fixtures.mjs");
    expect(report.fixtureSeedPlan.idempotent).toBe(true);
    expect(report.failureArtifacts.screenshots).toBe("only-on-failure");
    expect(report.failureArtifacts.traces).toBe("on-first-retry");
    expect(report.runCommands).toContain("npm run qa:seed-smoke");
  });
});
