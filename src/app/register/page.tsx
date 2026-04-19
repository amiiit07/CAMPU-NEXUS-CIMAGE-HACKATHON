"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { TENANT_OPTIONS } from "@/lib/tenant-config";

type RegisterRole = "student" | "faculty" | "startup";

export default function RegisterPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState("cimage");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegisterRole>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json", "x-tenant-id": tenantId },
        body: JSON.stringify({
          name,
          email,
          password,
          role
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message ?? "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_38%),linear-gradient(180deg,#030712_0%,#0f172a_100%)] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/15 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Campus Nexus</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-300">Students, faculty, and startups can self-register inside the selected college tenant.</p>

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
            <label className="mb-1 block text-sm text-slate-300">Full name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@campusnexus.dev" required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Password</label>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as RegisterRole)}
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="startup">Startup</option>
            </select>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
            Already have an account?
          </Link>
          <Link href="/forgot-password" className="text-cyan-300 hover:text-cyan-200">
            Forgot password
          </Link>
        </div>
      </div>
    </main>
  );
}
