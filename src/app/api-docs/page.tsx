import type { Metadata } from "next";
import { config } from "@/lib/config";
import {
  createPublicApiV1OpenApiSpec,
  PUBLIC_API_V1_EXAMPLE_BASE_URL,
} from "@/lib/public-api-v1";
import { TRAIL_ROOTS } from "@/lib/trail";
import { requireModule } from "@/modules/enabled";
import {
  Chip,
  CodeBlock,
  DataTable,
  InlineCode,
  Page,
  PageHeader,
  Section,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "api reference",
  description: "the generated arkivel public api v1 reference.",
};

export default async function ApiDocsPage() {
  await requireModule("api");
  const baseUrl = config.siteMode === "product"
    ? PUBLIC_API_V1_EXAMPLE_BASE_URL
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const spec = createPublicApiV1OpenApiSpec(baseUrl);
  const operations = Object.entries(spec.paths).flatMap(([path, pathItem]) =>
    Object.entries(pathItem).map(([method, operation]) => ({
      method: method.toUpperCase(),
      path,
      ...operation,
    }))
  );

  return (
    <Page
      className={config.siteMode === "product" ? "product-docs-page" : undefined}
      trail={[TRAIL_ROOTS.reference, { label: "api reference" }]}
      width="wide"
    >
      <PageHeader
        kicker="reference"
        title="api reference"
        description={
          <>
            <InlineCode>{spec.info.title}</InlineCode>{" "}
            <InlineCode>{spec.info.version}</InlineCode>. {spec.info.description}
          </>
        }
      />

      <div className="space-y-8 text-[13px]">
        <Section title="schema">
          <p className="text-muted">
            this page is generated from the same OpenAPI document served at{" "}
            <a href="/api/v1/openapi.json"><InlineCode>/api/v1/openapi.json</InlineCode></a>.
            contract and client metadata are available at{" "}
            <a href="/api/v1/contract"><InlineCode>/api/v1/contract</InlineCode></a>{" "}
            and <a href="/api/v1/sdk"><InlineCode>/api/v1/sdk</InlineCode></a>.
          </p>
          <p className="font-semibold">server</p>
          <CodeBlock><code>{spec.servers[0].url}</code></CodeBlock>
          <p className="text-muted">
            OpenAPI <InlineCode>{spec.openapi}</InlineCode> · {operations.length} operations
          </p>
        </Section>

        <Section title="operations">
          <div className="divide-y divide-border">
            {operations.map((operation) => {
              const headingId = `operation-${operation.operationId}`;

              return (
                <article
                  aria-labelledby={headingId}
                  className="space-y-3 py-6 first:pt-2 last:pb-2"
                  key={operation.operationId}
                >
                  <header className="flex min-w-0 flex-wrap items-center gap-2">
                    <InlineCode className="font-semibold">{operation.method}</InlineCode>
                    <h3 id={headingId} className="min-w-0 font-semibold">
                      <InlineCode className="break-all">{operation.path}</InlineCode>
                    </h3>
                  </header>

                  <div className="flex flex-wrap gap-2">
                    {operation.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
                    <Chip className="font-mono">{operation["x-arkivel-auth"]}</Chip>
                  </div>

                  <p className="text-muted">{operation.summary}</p>

                  {operation.parameters.length > 0 ? (
                    <DataTable className="text-[12px]">
                      <caption className="pb-2 text-left font-semibold">parameters</caption>
                      <thead>
                        <tr>
                          <th scope="col">name</th>
                          <th scope="col">location</th>
                          <th scope="col">type</th>
                          <th scope="col">requirement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operation.parameters.map((parameter) => (
                          <tr key={`${parameter.in}-${parameter.name}`}>
                            <td><InlineCode>{parameter.name}</InlineCode></td>
                            <td>{parameter.in}</td>
                            <td>{parameter.schema.type}</td>
                            <td>{parameter.required ? "required" : "optional"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </DataTable>
                  ) : null}

                  <details>
                    <summary className="cursor-pointer font-semibold">
                      responses ({Object.keys(operation.responses).length})
                    </summary>
                    <div className="mt-3">
                      <DataTable className="text-[12px]">
                        <caption className="ui-sr-only">
                          responses for {operation.method} {operation.path}
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">status</th>
                            <th scope="col">description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(operation.responses).map(([status, response]) => (
                            <tr key={status}>
                              <td><InlineCode>{status}</InlineCode></td>
                              <td>{response.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </DataTable>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        </Section>
      </div>
    </Page>
  );
}
