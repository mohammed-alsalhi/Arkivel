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
      <h1 className="ui-page-title">Log in</h1>

      <div className="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="ui-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="ui-input"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="ui-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="ui-input"
              placeholder="Password"
            />
          </div>

          {error && <p className="text-[12px] text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="ui-button ui-button-primary disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-[12px] text-muted mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
}
