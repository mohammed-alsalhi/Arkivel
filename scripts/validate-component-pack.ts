import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createMarketplaceImportPreview,
  type MarketplaceImportPreview,
} from "../src/lib/marketplace-import";
import { validateComponentPackSlots } from "../src/lib/component-slots";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const manifestPath = process.argv[2] ?? "examples/marketplace/component-pack/manifest.json";
const source = readFileSync(join(process.cwd(), manifestPath), "utf8");
const preview: MarketplaceImportPreview = createMarketplaceImportPreview(source);

if (!preview.valid) {
  fail([
    "Component pack manifest failed marketplace import preview.",
    ...preview.validationErrors,
    ...preview.securityErrors,
  ].join("\n"));
}

if (preview.metadata.kind !== "component-pack") {
  fail(`Expected component-pack manifest, received ${preview.metadata.kind ?? preview.rawKind ?? "unknown"}.`);
}

const slotResult = validateComponentPackSlots(preview.slots);
if (!slotResult.valid) {
  fail(`Unsupported component slots: ${slotResult.incompatibleSlots.join(", ")}`);
}

console.log(`Component pack manifest is valid: ${manifestPath}`);
console.log(`Slots: ${preview.slots.join(", ")}`);
