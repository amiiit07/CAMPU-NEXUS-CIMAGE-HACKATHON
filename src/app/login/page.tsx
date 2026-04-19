"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const tenantOptions = [
  { value: "cimage", label: "CIMAGE" },
  { value: "bia-patna", label: "BIA PATNA" },
  { value: "aia-patna", label: "AIA PATNA" },
  { value: "iit-patna", label: "IIT PATNA" },
  { value: "ibm", label: "IBM" }
];

export default function LoginPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState("cimage");
  const [email, setEmail] = useState("superadmin@campusnexus.dev");
  const [password, setPassword] = useState("Campus@2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json", "x-tenant-id": tenantId },
        body: JSON.stringify({ email, password })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message ?? "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.25),_transparent_42%),linear-gradient(180deg,#030712_0%,#0f172a_100%)] px-4 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-white/15 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Campus Nexus</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white">Login to Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">Sign in to manage projects, chats, and collaboration workflows.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">College / Tenant</label>
            <select
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
            >
              {tenantOptions.map((tenant) => (
                <option key={tenant.value} value={tenant.value}>
                  {tenant.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
            />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-5 py-3 text-sm font-semibold text-white shadow-glow-purple transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
          Super admin default: <span className="font-semibold text-white">superadmin@campusnexus.dev</span> on <span className="font-semibold text-white">CIMAGE</span>
          <br />
          Shared demo password: <span className="font-semibold text-white">Campus@2026</span>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Need a quick entry point? Go back to <Link href="/" className="text-cyan-300 hover:text-cyan-200">home</Link>.
        </p>
      </div>
    </main>
  );
}
