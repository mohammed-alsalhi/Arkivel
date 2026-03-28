"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div>
      <h1 className="text-xl font-semibold text-heading mb-4">User Activity Log</h1>

      <div className="flex gap-4 items-start">
        {/* User list */}
        <div className="w-60 flex-shrink-0 border border-border rounded overflow-hidden">
          <div className="bg-surface-hover px-3 py-2 text-[11px] text-muted font-medium uppercase tracking-wide">Users</div>
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
            <p className="text-[13px] text-muted italic">No edits found for {selectedUser.displayName || selectedUser.username}.</p>
          ) : (
            <div>
              <h2 className="text-[13px] font-semibold text-heading mb-2">
                Activity for {selectedUser.displayName || selectedUser.username} ({revisions.length} most recent edits)
              </h2>
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="text-[11px] text-muted text-left border-b border-border">
                    <th className="pb-1 pr-3">Article</th>
                    <th className="pb-1 pr-3">Summary</th>
                    <th className="pb-1">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-surface-hover">
                      <td className="py-1.5 pr-3">
                        {r.article ? (
                          <Link href={`/articles/${r.article.slug}`} className="text-wiki-link hover:underline">
                            {r.article.title}
                          </Link>
                        ) : (
                          <span className="text-muted italic">deleted</span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3 text-muted">{r.editSummary || "—"}</td>
                      <td className="py-1.5 text-muted whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
