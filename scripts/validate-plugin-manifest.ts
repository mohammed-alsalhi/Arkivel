import { readFile } from "fs/promises";
import {
  PLUGIN_HOOKS,
  PLUGIN_PERMISSION_SCOPES,
  PLUGIN_WEBHOOK_EVENTS,
  pluginCompatibilityMatrix,
  pluginManifestSchema,
  validateArkivelPluginManifest,
} from "../src/lib/plugin-manifest";

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--list-surfaces")) {
    console.log(JSON.stringify({
      compatibilityMatrix: pluginCompatibilityMatrix,
      hooks: PLUGIN_HOOKS,
      permissions: PLUGIN_PERMISSION_SCOPES,
      schema: pluginManifestSchema,
      webhookEvents: PLUGIN_WEBHOOK_EVENTS,
    }, null, 2));
    return;
  }

  const manifestPath = args[0];
  if (!manifestPath) {
    console.error("Usage: npm run plugin:validate -- path/to/plugin.json");
    console.error("       npm run plugin:validate -- --list-surfaces");
    process.exitCode = 1;
    return;
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const result = validateArkivelPluginManifest(manifest);
  if (result.valid) {
    console.log(`Valid plugin manifest: ${manifest.id ?? manifestPath}`);
    return;
  }

  console.error(`Invalid plugin manifest: ${manifestPath}`);
  for (const issue of result.issues) {
    console.error(`- [${issue.severity}] ${issue.field}: ${issue.message}`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
