import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = packageJson.version;

const requiredFiles = [
  "package-lock.json",
  "CHANGELOG.md",
  "ROADMAP.md",
  "README.md",
  "docs/help.md",
  "docs/features.md",
  "src/app/help/page.tsx",
  "src/app/features/page.tsx",
  "src/app/api-docs/page.tsx",
];

const failures = [];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${file} is missing`);
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf8");
  if (file === "package-lock.json") {
    const lock = JSON.parse(content);
    if (lock.version !== version || lock.packages?.[""]?.version !== version) {
      failures.push("package-lock.json version does not match package.json");
    }
    continue;
  }

  if ((file === "CHANGELOG.md" || file === "ROADMAP.md") && !content.includes(version)) {
    failures.push(`${file} does not mention ${version}`);
  }
}

if (failures.length > 0) {
  console.error("Docs sync check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Docs sync check passed for ${version}.`);
