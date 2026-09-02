import type { Metadata } from "next";
import Link from "next/link";
import {
  FeatureItem,
  InlineCode,
  LinkButton,
  Page,
  PageHeader,
  SectionPanel,
} from "@/components/ui";
import { TRAIL_ROOTS } from "@/lib/trail";

export const metadata: Metadata = {
  title: "features",
  description: "the focused arkivel wiki feature set.",
};

export default function FeaturesPage() {
  return (
    <Page trail={[TRAIL_ROOTS.reference, { label: "features" }]}>
      <PageHeader
        kicker="reference"
        title="features"
        description="a focused wiki for writing, finding, connecting, and keeping durable pages."
        actions={
          <>
            <LinkButton href="/help">help</LinkButton>
            <LinkButton href="/api-docs">api reference</LinkButton>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionPanel title="write" bodyClassName="text-[13px]">
          <ul className="list-disc space-y-2 pl-5">
            <FeatureItem title="simple editor">
              create and edit pages with focused formatting, headings, lists, links, wiki links,
              tables, code blocks, and images. choose a category, tags, and publication status
              alongside the page.
            </FeatureItem>
            <FeatureItem title="page reader">
              read in the three-pane shell with navigation on the left and the local graph,
              outline, and backlinks on the right.
            </FeatureItem>
          </ul>
        </SectionPanel>

        <SectionPanel title="find and connect" bodyClassName="text-[13px]">
          <ul className="list-disc space-y-2 pl-5">
            <FeatureItem title="search">
              search page titles and content from the <InlineCode>⌘K</InlineCode> command palette or the full{" "}
              <Link href="/search">search page</Link>.
            </FeatureItem>
            <FeatureItem title="skins">
              choose the flat <em>folio</em> interface or the classic framed <em>wiki</em> skin in{" "}
              <Link href="/settings">settings</Link>, in light or dark mode.
            </FeatureItem>
            <FeatureItem title="categories and tags">
              organize pages in hierarchical <Link href="/categories">categories</Link> and browse
              reusable <Link href="/tags">tags</Link>.
            </FeatureItem>
            <FeatureItem title="graph">
              follow wiki-link relationships in each page&apos;s context rail or across the full{" "}
              <Link href="/graph">article graph</Link>.
            </FeatureItem>
          </ul>
        </SectionPanel>

        <SectionPanel title="history" bodyClassName="text-[13px]">
          <ul className="list-disc space-y-2 pl-5">
            <FeatureItem title="revisions">
              every saved edit snapshots the previous page so its history remains inspectable.
            </FeatureItem>
            <FeatureItem title="diff">
              compare any saved revision with another revision or the current page in line or
              inline view.
            </FeatureItem>
            <FeatureItem title="blame">
              trace each paragraph to the revision, editor, date, and edit summary that introduced it.
            </FeatureItem>
          </ul>
        </SectionPanel>

        <SectionPanel title="files and portability" bodyClassName="text-[13px]">
          <ul className="list-disc space-y-2 pl-5">
            <FeatureItem title="local import">
              upload markdown, text, html, json, or mediawiki xml through{" "}
              <Link href="/import">the importer</Link>, backed by{" "}
              <InlineCode>/api/articles/import</InlineCode>.
            </FeatureItem>
            <FeatureItem title="notion and obsidian">
              continue through the dedicated <Link href="/import/notion">notion</Link> or{" "}
              <Link href="/import/obsidian">obsidian</Link> importer.
            </FeatureItem>
            <FeatureItem title="assets">
              upload and browse images, pdfs, audio, video, and other files in the{" "}
              <Link href="/assets">asset library</Link>.
            </FeatureItem>
            <FeatureItem title="export">
              download the full wiki or one category as markdown or a zip archive from{" "}
              <Link href="/export">export</Link>.
            </FeatureItem>
          </ul>
        </SectionPanel>

        <SectionPanel title="access and api" bodyClassName="text-[13px] lg:col-span-2">
          <ul className="list-disc space-y-2 pl-5">
            <FeatureItem title="accounts and admin">
              account sessions protect write operations. administrators manage users, categories,
              tags, redirects, imports, maintenance, read-only mode, and the audit log from{" "}
              <Link href="/admin">admin</Link>.
            </FeatureItem>
            <FeatureItem title="api v1">
              read published articles, categories, tags, and search results. the generated{" "}
              <Link href="/api-docs">api reference</Link>,{" "}
              <Link href="/api/v1/contract">contract</Link>, and{" "}
              <Link href="/api/v1/openapi.json">openapi document</Link> describe the live surface.
            </FeatureItem>
          </ul>
        </SectionPanel>
      </div>
    </Page>
  );
}
