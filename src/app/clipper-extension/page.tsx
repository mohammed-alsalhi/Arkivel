import Link from "next/link";
import { InlineCode, Page, PageHeader, SectionPanel } from "@/components/ui";

export default function ClipperExtensionPage() {
  return (
    <Page>
      <PageHeader
        title="Web Clipper Extension"
        description="The Wiki Clipper is a browser extension for Chrome, Edge, and Brave that lets you save any web page or selected text directly into your wiki as a draft article."
      />

      <SectionPanel className="mb-5" title="Install" bodyClassName="text-[13px] space-y-2">
        <ol className="list-decimal list-inside space-y-2 text-[13px]">
          <li>
            Download the <InlineCode>extension/</InlineCode> folder from the wiki repository.
          </li>
          <li>
            Open <InlineCode>chrome://extensions</InlineCode> and enable{" "}
            <strong>Developer mode</strong>.
          </li>
          <li>
            Click <strong>Load unpacked</strong> and select the{" "}
            <InlineCode>extension/</InlineCode> folder.
          </li>
          <li>Click the extension icon, open <strong>Settings</strong>, and enter your wiki URL.</li>
          <li>Make sure you are logged in to this wiki in the same browser.</li>
        </ol>
      </SectionPanel>

      <SectionPanel className="mb-5" title="How it works" bodyClassName="text-[13px] space-y-1">
        <p>1. Navigate to any webpage you want to save.</p>
        <p>2. Optionally highlight text to clip just that portion.</p>
        <p>3. Click the <strong>Wiki Clipper</strong> toolbar icon.</p>
        <p>4. Edit the title if needed, then click <strong>Save as draft</strong>.</p>
        <p>5. Click <strong>Open editor</strong> to review, edit, and publish the article.</p>
        <p className="text-muted text-[12px] pt-1">
          Auth uses your existing session cookie — no separate login needed if you are already signed in.
        </p>
      </SectionPanel>

      <div className="wiki-notice text-[12px]">
        Prefer not to install an extension?{" "}
        <Link href="/bookmarklet" className="underline">Use the bookmarklet instead</Link> — no installation required.
      </div>
    </Page>
  );
}

export const dynamic = "force-dynamic";
