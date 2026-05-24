import { config } from "@/lib/config";
import {
  CodeBlock,
  DataTable,
  InlineCode,
  Notice,
  Page,
  PageHeader,
  Section,
} from "@/components/ui";

export default function ApiDocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <Page>
      <PageHeader title={`${config.name} API Documentation`} />

      <Notice className="mb-4">
        <strong>Authentication:</strong> All API v1 endpoints require an API key
        passed in the <InlineCode>X-API-Key</InlineCode> header.
        API keys can be managed from your user account settings.
      </Notice>

      <div className="text-[13px] space-y-6">
        {/* Base URL */}
        <Section title="Base URL">
          <CodeBlock>{baseUrl}/api/v1</CodeBlock>
        </Section>

        {/* Articles */}
        <Section title="Articles">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/articles</h3>
          <p className="text-muted mb-2">
            List published articles with pagination and optional filters.
          </p>

          <DataTable className="mb-3 text-[12px]">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">page</td>
                <td>integer</td>
                <td>Page number (default: 1)</td>
              </tr>
              <tr>
                <td className="font-mono">limit</td>
                <td>integer</td>
                <td>Items per page, max 100 (default: 20)</td>
              </tr>
              <tr>
                <td className="font-mono">category</td>
                <td>string</td>
                <td>Filter by category slug</td>
              </tr>
              <tr>
                <td className="font-mono">tag</td>
                <td>string</td>
                <td>Filter by tag slug</td>
              </tr>
            </tbody>
          </DataTable>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/articles?page=1&limit=10&category=people"`}
          </CodeBlock>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <CodeBlock>
{`{
  "articles": [
    {
      "title": "Example Article",
      "slug": "example-article",
      "excerpt": "A brief description...",
      "content": "<p>HTML content...</p>",
      "category": { "name": "People", "slug": "people" },
      "tags": [{ "name": "History", "slug": "history" }],
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}`}
          </CodeBlock>
        </Section>

        {/* Search */}
        <Section title="Search">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/search</h3>
          <p className="text-muted mb-2">
            Search articles by title and content. Multi-word queries use AND logic.
          </p>

          <DataTable className="mb-3 text-[12px]">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">q</td>
                <td>string</td>
                <td>Search query (min 2 characters)</td>
              </tr>
              <tr>
                <td className="font-mono">limit</td>
                <td>integer</td>
                <td>Max results, max 100 (default: 20)</td>
              </tr>
            </tbody>
          </DataTable>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/search?q=kingdom&limit=5"`}
          </CodeBlock>
        </Section>

        {/* Categories */}
        <Section title="Categories">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/categories</h3>
          <p className="text-muted mb-2">
            List all categories with article counts and parent info.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/categories"`}
          </CodeBlock>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <CodeBlock>
{`{
  "categories": [
    {
      "name": "People",
      "slug": "people",
      "description": null,
      "icon": "person",
      "sortOrder": 0,
      "parent": null,
      "articleCount": 15,
      "childCount": 3
    }
  ]
}`}
          </CodeBlock>
        </Section>

        {/* Tags */}
        <Section title="Tags">

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/tags</h3>
          <p className="text-muted mb-2">
            List all tags with article counts.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/tags"`}
          </CodeBlock>
        </Section>

        {/* Feeds */}
        <Section title="RSS / Atom Feeds">
          <p className="text-muted mb-2">
            Public feeds are available without authentication:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>RSS 2.0:</strong>{" "}
              <InlineCode>/feed.xml</InlineCode>
            </li>
            <li>
              <strong>Atom:</strong>{" "}
              <InlineCode>/feed/atom</InlineCode>
            </li>
          </ul>
        </Section>

        {/* Stats */}
        <Section title="Statistics">

          <h3 className="font-semibold mt-3 mb-1">GET /api/stats</h3>
          <p className="text-muted mb-2">
            Get wiki-wide statistics. No authentication required.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <CodeBlock>
{`curl "${baseUrl}/api/stats"`}
          </CodeBlock>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <CodeBlock>
{`{
  "articles": 42,
  "categories": 6,
  "tags": 15,
  "users": 3,
  "revisions": 128,
  "discussions": 24,
  "recentEditsThisWeek": 12
}`}
          </CodeBlock>
        </Section>

        {/* Sitemap */}
        <Section title="Sitemap & SEO">
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>
              <strong>Sitemap:</strong>{" "}
              <InlineCode>/sitemap.xml</InlineCode> &mdash; Dynamic sitemap with all articles and categories
            </li>
            <li>
              <strong>Robots:</strong>{" "}
              <InlineCode>/robots.txt</InlineCode> &mdash; Crawler instructions
            </li>
            <li>
              <strong>API Sitemap:</strong>{" "}
              <InlineCode>/api/sitemap</InlineCode> &mdash; XML sitemap via API route
            </li>
          </ul>
        </Section>

        {/* Operational feeds */}
        <Section title="Operational Feeds">
          <p className="text-muted mb-2">
            These app feeds are designed for dashboards, demos, and local automation.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted">
            <li>
              <InlineCode>GET /api/studio</InlineCode> — Arkivel Studio summary, generated board nodes, graph edges, base views, and action queue
            </li>
            <li>
              <InlineCode>GET /api/studio/canvas</InlineCode> — JSON Canvas export of the generated Studio board
            </li>
            <li>
              <InlineCode>GET /api/atlas</InlineCode> — Canon Atlas territories, signals, threads, dossier, continuity pressure, and next moves
            </li>
            <li>
              <InlineCode>GET /api/trails</InlineCode> — Canon Trails guided routes, stop reasons, reading estimates, word totals, and link totals
            </li>
            <li>
              <InlineCode>GET /api/intelligence</InlineCode> — Knowledge cockpit score, radar, constellation, pressure model, engines, and action queue
            </li>
            <li>
              <InlineCode>GET /api/customization</InlineCode> — Public self-host manifest for grouped customization, supported env vars, style presets, color themes, layouts, reusable UI components including accessibility primitives, plugin manifests, theme packs, marketplace metadata, per-space preview metadata, and theme hooks
            </li>
          </ul>
        </Section>

        {/* Errors */}
        <Section title="Error Responses">
          <p className="text-muted mb-2">
            All errors return a JSON object with an <InlineCode>error</InlineCode> field:
          </p>
          <CodeBlock>
{`// 401 Unauthorized
{ "error": "Invalid or missing API key. Include X-API-Key header." }

// 400 Bad Request
{ "error": "Description of what went wrong" }

// 404 Not Found
{ "error": "Resource not found" }`}
          </CodeBlock>

          <DataTable className="mt-3 text-[12px]">
            <thead>
              <tr>
                <th>Status Code</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">200</td>
                <td>Success</td>
              </tr>
              <tr>
                <td className="font-mono">400</td>
                <td>Bad Request (missing or invalid parameters)</td>
              </tr>
              <tr>
                <td className="font-mono">401</td>
                <td>Unauthorized (missing or invalid API key)</td>
              </tr>
              <tr>
                <td className="font-mono">404</td>
                <td>Not Found</td>
              </tr>
              <tr>
                <td className="font-mono">500</td>
                <td>Internal Server Error</td>
              </tr>
            </tbody>
          </DataTable>
        </Section>
      </div>
    </Page>
  );
}
