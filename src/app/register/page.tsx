"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Field, Input, Page, PageHeader } from "@/components/ui";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Auto-login after registration
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (loginRes.ok) {
          router.push("/");
          router.refresh();
        } else {
          router.push("/login");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader title="Create account" />
      <div className="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field htmlFor="register-username" label="Username *">
            <Input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              placeholder="Choose a username"
            />
          </Field>

          <Field htmlFor="register-email" label="Email *">
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </Field>

          <Field htmlFor="register-password" label="Password *">
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </Field>

          <Field htmlFor="register-confirm-password" label="Confirm password *">
            <Input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Re-enter password"
            />
          </Field>

          {error && <p className="text-[12px] text-danger">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-[12px] text-muted mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </Page>
  );
}
