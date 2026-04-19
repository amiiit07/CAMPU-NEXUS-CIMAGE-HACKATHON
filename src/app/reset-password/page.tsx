"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message ?? "Reset failed");
        return;
      }

      setMessage(payload?.data?.message ?? "Password reset successful.");
      setPassword("");
    } catch {
      setError("Unable to reset password right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.2),_transparent_34%),linear-gradient(180deg,#030712_0%,#0f172a_100%)] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/15 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Campus Nexus</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white">Reset password</h1>
        <p className="mt-2 text-sm text-slate-300">Paste the reset token and set a new password for your account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Reset token</label>
            <Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste token here" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">New password</label>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {message ? <p className="text-sm text-cyan-100">{message}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
            Back to login
          </Link>
          <Link href="/forgot-password" className="text-cyan-300 hover:text-cyan-200">
            Need a new token?
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.2),_transparent_34%),linear-gradient(180deg,#030712_0%,#0f172a_100%)] px-4 py-16">
          <div className="mx-auto max-w-lg rounded-3xl border border-white/15 bg-white/5 p-8 shadow-glow backdrop-blur-xl text-sm text-slate-300">
            Loading reset form...
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
