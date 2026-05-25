import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MAINTAINER_DOC_TOPICS,
  SETUP_PATHS,
  TROUBLESHOOTING_TOPICS,
  createDocumentationOnboardingReport,
  docsTopicIsCovered,
} from "../documentation-onboarding";

const root = process.cwd();

function readDoc(file: string) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("documentation onboarding", () => {
  it("covers maintainer documentation topics", () => {
    const report = createDocumentationOnboardingReport();

    expect(report.contract.apiRoute).toBe("/api/documentation-onboarding");
    expect(report.maintainerDocs.map((item) => item.topic)).toEqual(MAINTAINER_DOC_TOPICS);
    expect(docsTopicIsCovered("marketplace")).toBe(true);
  });

  it("covers setup paths and troubleshooting topics", () => {
    const report = createDocumentationOnboardingReport();

    expect(report.setupPaths.map((item) => item.path)).toEqual(SETUP_PATHS);
    expect(report.troubleshooting.map((item) => item.topic)).toEqual(TROUBLESHOOTING_TOPICS);
  });

  it("keeps the practical docs index links resolvable", () => {
    const report = createDocumentationOnboardingReport();

    for (const file of report.linkTests.practicalScope) {
      expect(fs.existsSync(path.join(root, file))).toBe(true);
    }

    const docsIndex = readDoc("docs/index.md");
    expect(docsIndex).toContain("[Maintainer guide](maintainer-guide.md)");
    expect(docsIndex).toContain("[Setup paths](setup-paths.md)");
    expect(docsIndex).toContain("[Troubleshooting](troubleshooting.md)");
  });

  it("documents every setup and troubleshooting slug in prose", () => {
    const setup = readDoc("docs/setup-paths.md");
    const troubleshooting = readDoc("docs/troubleshooting.md");

    for (const setupPath of SETUP_PATHS) {
      expect(setup).toContain(setupPath);
    }
    for (const topic of TROUBLESHOOTING_TOPICS) {
      expect(troubleshooting).toContain(topic);
    }
  });
});
