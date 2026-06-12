"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataTable, EmptyState, Page, PageHeader, Section } from "@/components/ui";

type User = {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
  createdAt: string;
  _count: { revisions: number };
};

type Revision = {
  id: string;
  createdAt: string;
  editSummary: string | null;
  article: { id: string; title: string; slug: string } | null;
};

export default function UserActivityPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  useEffect(() => {
    fetch("/api/admin/user-activity")
      .then((r) => r.json())
      .then((d) => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function selectUser(user: User) {
    setSelectedUser(user);
    setLoadingRevisions(true);
    const res = await fetch(`/api/admin/user-activity?userId=${user.id}&limit=100`);
    if (res.ok) setRevisions(await res.json());
    setLoadingRevisions(false);
  }

  if (loading) return <p className="text-[13px] text-muted">Loading…</p>;

  return (
    <Page>
      <PageHeader title="User Activity Log" />

      <div className="flex gap-4 items-start">
        {/* User list */}
        <div className="w-60 flex-shrink-0 border border-border rounded overflow-hidden">
          <div className="bg-surface-hover px-3 py-2 text-[11px] text-muted font-medium uppercase">Users</div>
          <ul className="divide-y divide-border">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => selectUser(u)}
                  className={`w-full text-left px-3 py-2 text-[12px] hover:bg-surface-hover transition-colors ${selectedUser?.id === u.id ? "bg-accent/10 text-accent" : "text-foreground"}`}
                >
                  <div className="font-medium">{u.displayName || u.username}</div>
                  <div className="text-muted text-[11px]">{u._count.revisions} edits · {u.role}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Revision list */}
        <div className="flex-1 min-w-0">
          {!selectedUser ? (
            <p className="text-[13px] text-muted italic">Select a user to view their activity.</p>
          ) : loadingRevisions ? (
            <p className="text-[13px] text-muted">Loading activity…</p>
          ) : revisions.length === 0 ? (
            <EmptyState title={`No edits found for ${selectedUser.displayName || selectedUser.username}.`} />
          ) : (
            <Section title={`Activity for ${selectedUser.displayName || selectedUser.username} (${revisions.length} most recent edits)`}>
              <DataTable>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Summary</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((r) => (
                    <tr key={r.id}>
                      <td>
                        {r.article ? (
                          <Link href={`/articles/${r.article.slug}`} className="text-wiki-link hover:underline">
                            {r.article.title}
                          </Link>
                        ) : (
                          <span className="text-muted italic">deleted</span>
                        )}
                      </td>
                      <td className="text-muted">{r.editSummary || "—"}</td>
                      <td className="text-muted whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </Section>
          )}
        </div>
      </div>
    </Page>
  );
}

export const dynamic = "force-dynamic";
