"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Field, Input, Page, PageHeader } from "@/components/ui";

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
    <Page>
      <PageHeader title="Log in" />
      <div className="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field htmlFor="login-username" label="Username">
            <Input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
            />
          </Field>

          <Field htmlFor="login-password" label="Password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </Field>

          {error && <p className="text-[12px] text-danger">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>

        <p className="text-[12px] text-muted mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create account
          </Link>
        </p>

      </div>
    </Page>
  );
}
