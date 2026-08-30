"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, Page, PageHeader, Section } from "@/components/ui";

const tools = [
  ["users", "/admin/users"],
  ["categories", "/admin/categories"],
  ["tags", "/admin/tags"],
  ["redirects", "/admin/redirects"],
  ["import", "/import"],
  ["maintenance", "/admin/maintenance"],
  ["read-only mode", "/admin/read-only"],
  ["audit log", "/admin/audit-log"],
] as const;

export default function AdminPage() {
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((response) => response.json())
      .then((result) => setAdmin(Boolean(result.admin)))
      .catch(() => setAdmin(false));
  }, []);

  return (
    <Page>
      <PageHeader title="Admin" description="The small set of controls required to operate this wiki." />

      {admin === null ? (
        <p className="text-[13px] text-muted">loading...</p>
      ) : !admin ? (
        <EmptyState
          title="Admin access required"
          description="Log in as an administrator to continue."
          actions={<Link href="/login" className="ui-button ui-button-primary">log in</Link>}
        />
      ) : (
        <Section title="Operations">
          <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {tools.map(([label, href]) => (
              <li key={href} className="bg-surface">
                <Link href={href} className="block px-4 py-3 text-[13px] hover:bg-surface-hover">{label}</Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </Page>
  );
}
