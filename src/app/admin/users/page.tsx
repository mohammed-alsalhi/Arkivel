"use client";

import { useState, useEffect } from "react";

type User = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
  _count: { articles: number; revisions: number; discussions: number };
};

const ROLES = ["viewer", "editor", "admin"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function changeRole(userId: string, role: string) {
    setSaving(userId);
    setError("");
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
      );
    } else {
      setError("Failed to update role");
    }
    setSaving(null);
  }

  if (loading) {
    return <div className="py-8 text-center text-muted italic text-[13px]">Loading…</div>;
  }

  return (
    <div>
      <h1
        className="text-[1.5rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        User management
      </h1>

      {error && <p className="text-[12px] text-wiki-link-broken mb-3">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border bg-surface text-[13px]">
          <thead>
            <tr className="bg-surface-hover">
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">User</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading">Email</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-24">Articles</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-24">Edits</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-32">Joined</th>
              <th className="border border-border px-3 py-1.5 text-left font-bold text-heading w-36">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-hover">
                <td className="border border-border px-3 py-1.5">
                  <div className="font-medium">{user.displayName || user.username}</div>
                  <div className="text-[11px] text-muted">@{user.username}</div>
                </td>
                <td className="border border-border px-3 py-1.5 text-muted">{user.email}</td>
                <td className="border border-border px-3 py-1.5 text-center">{user._count.articles}</td>
                <td className="border border-border px-3 py-1.5 text-center">{user._count.revisions}</td>
                <td className="border border-border px-3 py-1.5 text-muted text-[12px]">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="border border-border px-3 py-1.5">
                  <select
                    value={user.role}
                    disabled={saving === user.id}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="border border-border bg-surface px-2 py-0.5 text-[12px] text-foreground focus:outline-none focus:border-accent disabled:opacity-50 w-full"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="text-[13px] text-muted mt-4">No users found.</p>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
