import { config } from "@/lib/config";

export default function ApiDocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {config.name} API Documentation
      </h1>

      <div className="wiki-notice mb-4">
        <strong>Authentication:</strong> All API v1 endpoints require an API key
        passed in the <code className="bg-surface-hover px-1 text-[12px]">X-API-Key</code> header.
        API keys can be managed from your user account settings.
      </div>

      <div className="text-[13px] space-y-6">
        {/* Base URL */}
        <section>
          <h2
            className="text-lg font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Base URL
          </h2>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto">
            {baseUrl}/api/v1
          </pre>
        </section>

        {/* Articles */}
        <section>
          <h2
            className="text-lg font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Articles
          </h2>

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/articles</h3>
          <p className="text-muted mb-2">
            List published articles with pagination and optional filters.
          </p>

          <table className="w-full border border-border text-[12px] mb-3">
            <thead>
              <tr className="bg-surface-hover">
                <th className="text-left px-2 py-1 border-b border-border">Parameter</th>
                <th className="text-left px-2 py-1 border-b border-border">Type</th>
                <th className="text-left px-2 py-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">page</td>
                <td className="px-2 py-1 border-b border-border">integer</td>
                <td className="px-2 py-1 border-b border-border">Page number (default: 1)</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">limit</td>
                <td className="px-2 py-1 border-b border-border">integer</td>
                <td className="px-2 py-1 border-b border-border">Items per page, max 100 (default: 20)</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">category</td>
                <td className="px-2 py-1 border-b border-border">string</td>
                <td className="px-2 py-1 border-b border-border">Filter by category slug</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">tag</td>
                <td className="px-2 py-1 border-b border-border">string</td>
                <td className="px-2 py-1 border-b border-border">Filter by tag slug</td>
              </tr>
            </tbody>
          </table>

          <p className="font-semibold mb-1">Example:</p>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap">
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/articles?page=1&limit=10&category=people"`}
          </pre>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap">
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
          </pre>
        </section>

        {/* Search */}
        <section>
          <h2
            className="text-lg font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Search
          </h2>

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/search</h3>
          <p className="text-muted mb-2">
            Search articles by title and content. Multi-word queries use AND logic.
          </p>

          <table className="w-full border border-border text-[12px] mb-3">
            <thead>
              <tr className="bg-surface-hover">
                <th className="text-left px-2 py-1 border-b border-border">Parameter</th>
                <th className="text-left px-2 py-1 border-b border-border">Type</th>
                <th className="text-left px-2 py-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">q</td>
                <td className="px-2 py-1 border-b border-border">string</td>
                <td className="px-2 py-1 border-b border-border">Search query (min 2 characters)</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">limit</td>
                <td className="px-2 py-1 border-b border-border">integer</td>
                <td className="px-2 py-1 border-b border-border">Max results, max 100 (default: 20)</td>
              </tr>
            </tbody>
          </table>

          <p className="font-semibold mb-1">Example:</p>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap">
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/search?q=kingdom&limit=5"`}
          </pre>
        </section>

        {/* Categories */}
        <section>
          <h2
            className="text-lg font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Categories
          </h2>

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/categories</h3>
          <p className="text-muted mb-2">
            List all categories with article counts and parent info.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap">
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/categories"`}
          </pre>

          <p className="font-semibold mt-3 mb-1">Response:</p>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap">
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
          </pre>
        </section>

        {/* Tags */}
        <section>
          <h2
            className="text-lg font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Tags
          </h2>

          <h3 className="font-semibold mt-3 mb-1">GET /api/v1/tags</h3>
          <p className="text-muted mb-2">
            List all tags with article counts.
          </p>

          <p className="font-semibold mb-1">Example:</p>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap">
{`curl -H "X-API-Key: YOUR_KEY" \\
  "${baseUrl}/api/v1/tags"`}
          </pre>
        </section>

        {/* Feeds */}
        <section>
          <h2
            className="text-lg font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            RSS / Atom Feeds
          </h2>
          <p className="text-muted mb-2">
            Public feeds are available without authentication:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>RSS 2.0:</strong>{" "}
              <code className="bg-surface-hover px-1 text-[12px]">/feed.xml</code>
            </li>
            <li>
              <strong>Atom:</strong>{" "}
              <code className="bg-surface-hover px-1 text-[12px]">/feed/atom</code>
            </li>
          </ul>
        </section>

        {/* Errors */}
        <section>
          <h2
            className="text-lg font-normal text-heading border-b border-border pb-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Error Responses
          </h2>
          <p className="text-muted mb-2">
            All errors return a JSON object with an <code className="bg-surface-hover px-1 text-[12px]">error</code> field:
          </p>
          <pre className="bg-surface-hover border border-border p-3 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap">
{`// 401 Unauthorized
{ "error": "Invalid or missing API key. Include X-API-Key header." }

// 400 Bad Request
{ "error": "Description of what went wrong" }

// 404 Not Found
{ "error": "Resource not found" }`}
          </pre>

          <table className="w-full border border-border text-[12px] mt-3">
            <thead>
              <tr className="bg-surface-hover">
                <th className="text-left px-2 py-1 border-b border-border">Status Code</th>
                <th className="text-left px-2 py-1 border-b border-border">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">200</td>
                <td className="px-2 py-1 border-b border-border">Success</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">400</td>
                <td className="px-2 py-1 border-b border-border">Bad Request (missing or invalid parameters)</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">401</td>
                <td className="px-2 py-1 border-b border-border">Unauthorized (missing or invalid API key)</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">404</td>
                <td className="px-2 py-1 border-b border-border">Not Found</td>
              </tr>
              <tr>
                <td className="px-2 py-1 border-b border-border font-mono">500</td>
                <td className="px-2 py-1 border-b border-border">Internal Server Error</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
