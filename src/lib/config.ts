import packageJson from "../../package.json";
import { resolveSiteMode } from "./site-mode";

type Env = Record<string, string | undefined>;

function read(env: Env, key: string, fallback: string): string {
  return env[key]?.trim() || fallback;
}

export function createConfig(env: Env = process.env) {
  const name = read(env, "NEXT_PUBLIC_ARKIVEL_NAME", "Arkivel");

  return {
    name,
    version: packageJson.version,
    description: read(env, "NEXT_PUBLIC_ARKIVEL_DESCRIPTION", "A focused, self-hosted home for durable knowledge."),
    welcomeText: read(env, "NEXT_PUBLIC_ARKIVEL_WELCOME_TEXT", `Welcome to ${name}.`),
    logo: read(env, "NEXT_PUBLIC_ARKIVEL_LOGO", "/brand/arkivel-logo.png"),
    logoMark: read(env, "NEXT_PUBLIC_ARKIVEL_LOGO_MARK", "/brand/arkivel-logo.svg"),
    appIcon: read(env, "NEXT_PUBLIC_ARKIVEL_APP_ICON", "/brand/arkivel-icon-512.png"),
    baseUrl: read(env, "NEXT_PUBLIC_BASE_URL", "http://localhost:3000"),
    siteMode: resolveSiteMode(env.ARKIVEL_SITE_MODE),
  };
}

export const config = createConfig();
