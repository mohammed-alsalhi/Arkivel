import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function toKebabCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const id = toKebabCase(process.argv[2] ?? "example-component-pack");
const target = join(process.cwd(), "examples", "marketplace", id);

if (existsSync(target)) {
  throw new Error(`Component pack folder already exists: ${target}`);
}

mkdirSync(join(target, "components"), { recursive: true });
mkdirSync(join(target, "screenshots"), { recursive: true });
mkdirSync(join(target, "tests"), { recursive: true });

writeFileSync(
  join(target, "manifest.json"),
  `${JSON.stringify({
    schemaVersion: "arkivel.marketplace.import.v1",
    id,
    kind: "component-pack",
    name: id.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" "),
    version: "0.1.0",
    compatibility: ">=4.78.3",
    author: "Your Name",
    license: "MIT",
    requiredFiles: ["component-pack.json", "slots.json", "README.md"],
    requiredEnvVars: [],
    slots: ["article-card", "metadata-panel", "dashboard-widget"],
  }, null, 2)}\n`,
);

writeFileSync(
  join(target, "README.md"),
  `# ${id}\n\nDescribe the audience, supported slots, screenshots, compatibility notes, accessibility review, and validation evidence for this component pack.\n`,
);
writeFileSync(join(target, "components", "README.md"), "# Components\n\nDocument planned slot components here.\n");
writeFileSync(join(target, "screenshots", "README.md"), "# Screenshots\n\nAdd local preview screenshots for every slot and responsive breakpoint.\n");
writeFileSync(join(target, "tests", "README.md"), "# Tests\n\nRecord import-preview, slot contract, accessibility, responsive, and performance checks.\n");

console.log(`Created ${target}`);
