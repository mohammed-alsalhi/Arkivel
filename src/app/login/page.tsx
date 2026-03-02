"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1
        className="text-[1.5rem] font-normal text-heading border-b border-border pb-1 mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Log in
      </h1>

      <div className="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[12px] text-muted mb-0.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-[12px] text-muted mb-0.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-border bg-surface px-3 py-1.5 text-[14px] text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              placeholder="Password"
            />
          </div>

          {error && <p className="text-[12px] text-wiki-link-broken">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent px-4 py-1.5 text-[13px] font-bold text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-[12px] text-muted mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create account
          </Link>
        </p>

        <p className="text-[12px] text-muted mt-2">
          Admin?{" "}
          <Link href="/admin" className="text-accent hover:underline">
            Use admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
