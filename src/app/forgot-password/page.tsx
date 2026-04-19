"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { TENANT_OPTIONS } from "@/lib/tenant-config";

export default function ForgotPasswordPage() {
  const [tenantId, setTenantId] = useState("cimage");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetToken("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json", "x-tenant-id": tenantId },
        body: JSON.stringify({ email })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message ?? "Unable to generate reset link.");
        return;
      }

      setMessage(payload?.data?.message ?? "If the account exists, a reset link has been generated.");
      if (payload?.data?.resetToken) {
        setResetToken(String(payload.data.resetToken));
      }
    } catch {
      setError("Unable to generate reset link right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.25),_transparent_40%),linear-gradient(180deg,#030712_0%,#0f172a_100%)] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/15 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Campus Nexus</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-300">Choose your college tenant and generate a password reset token for the matching user account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">College / Tenant</label>
            <select
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
            >
              {TENANT_OPTIONS.map((tenant) => (
                <option key={tenant.value} value={tenant.value}>
                  {tenant.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@campusnexus.dev" required />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {message ? <p className="text-sm text-cyan-100">{message}</p> : null}

          {resetToken ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              Demo reset token: <span className="break-all font-semibold text-white">{resetToken}</span>
              <div className="mt-2">
                <Link href={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="text-cyan-200 hover:text-white">
                  Open reset form
                </Link>
              </div>
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Generating..." : "Generate Reset Token"}
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
            Back to login
          </Link>
          <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
