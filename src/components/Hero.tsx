"use client";

import { ArrowRight, Sparkles, ShieldCheck, Brain } from "lucide-react";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";

const socialProof = ["Trusted by 50+ colleges", "10k+ active innovators", "1k+ projects shipped"];

export default function Hero() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const cardX = useTransform(x, [-100, 100], [-8, 8]);
  const cardY = useTransform(y, [-100, 100], [-8, 8]);

  return (
    <section className="relative overflow-hidden pb-20 pt-16 lg:pb-24 lg:pt-20">
      <div className="absolute inset-0 bg-aurora opacity-90" />
      <div className="absolute inset-0 grid-noise opacity-60" />

      <div
        onMouseMove={(event) => {
          const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
          x.set(event.clientX - rect.left - rect.width / 2);
          y.set(event.clientY - rect.top - rect.height / 2);
        }}
        className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-6"
      >
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
            AI-powered multi-tenant collaboration ecosystem
          </div>

          <h1 className="mt-7 max-w-4xl font-heading text-5xl font-extrabold leading-[1.02] text-white md:text-7xl lg:text-[5.2rem]">
            Build the <span className="text-gradient-brand">future of campus innovation</span> in one intelligent network.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            Campus Nexus connects students, faculty, startups, and colleges through AI matchmaking, secure collaboration,
            real-time execution, and tenant-safe infrastructure built for scale.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-6 py-3 text-sm font-semibold text-white shadow-glow-purple transition hover:scale-[1.02]"
            >
              Open Live Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-brand-cyan/70 hover:bg-white/10"
            >
              Explore Features
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {socialProof.map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div style={{ x: cardX, y: cardY }} className="relative">
          <div className="surface-glass relative rounded-3xl p-5 shadow-glow-cyan">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">AI control plane</p>
                <h3 className="mt-1 font-heading text-xl font-semibold text-white">Campus Command Center</h3>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                Live
              </div>
            </div>

            <div className="space-y-3">
              <div className="surface-glass rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Team chemistry score</p>
                <div className="mt-2 text-4xl font-bold text-white">94%</div>
                <p className="text-sm text-slate-300">AI-balanced skills, mentor availability, and delivery signals.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-glass rounded-2xl p-4">
                  <Brain className="h-5 w-5 text-brand-cyan" />
                  <p className="mt-2 text-sm text-slate-100">8,214 recommendations</p>
                </div>
                <div className="surface-glass rounded-2xl p-4">
                  <ShieldCheck className="h-5 w-5 text-brand-emerald" />
                  <p className="mt-2 text-sm text-slate-100">Strict tenant isolation</p>
                </div>
              </div>

              <div className="surface-glass rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Realtime collaboration rooms</span>
                  <span className="text-white">9,812</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-2 rounded-full bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-emerald"
                  />
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
