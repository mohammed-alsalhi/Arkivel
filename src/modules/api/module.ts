import type { ModuleDefinition } from "../types";

const api: ModuleDefinition = {
  id: "api",
  name: "api",
  description: "the public read-only v1 api and its generated reference, contract, openapi document, and sdk metadata.",
  routes: ["/api/v1", "/api-docs"],
  nav: [],
  commands: [{ label: "api reference", href: "/api-docs", keywords: ["api", "openapi", "docs", "reference"] }],
  docs: {
    help: "read the generated [api reference](/api-docs) for the public read-only v1 endpoints.",
    features: [
      "api v1 — read published articles, categories, tags, and search results. the generated [api reference](/api-docs), [contract](/api/v1/contract), and [openapi document](/api/v1/openapi.json) describe the live surface.",
    ],
  },
  defaultEnabled: true,
};

export default api;
