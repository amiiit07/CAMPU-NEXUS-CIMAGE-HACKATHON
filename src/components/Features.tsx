"use client";

import { BarChart3, Building2, CheckCircle2, Lock, ShieldCheck, Sparkles, Workflow, Zap } from "lucide-react";
import { FadeInSection, StaggerGrid, StaggerItem } from "@/components/animations";

const trusted = ["Alpha Tech", "Northstar", "Nova Campus", "VentureU", "Future Labs", "Zenith College"];

const bentoCards = [
  {
    title: "Federated Multi-College",
    text: "Each college operates independently with custom identity and secure tenancy.",
    icon: Building2,
    className: "md:col-span-2"
  },
  {
    title: "AI Team Matchmaking",
    text: "Find the right teammates, mentors, and projects through compatibility scoring.",
    icon: Sparkles,
    className: "md:col-span-1"
  },
  {
    title: "Realtime Collaboration",
    text: "Chat, rooms, Kanban, notifications, and live coordination for execution velocity.",
    icon: Workflow,
    className: "md:col-span-1"
  },
  {
    title: "Project Lifecycle",
    text: "Idea to proposal to sprint to demo day with complete progress visibility.",
    icon: Zap,
    className: "md:col-span-2"
  }
];

const timeline = [
  "Idea posted in innovation marketplace",
  "AI suggests best collaborators and mentors",
  "Team forms and enters sprint mode",
  "Demo day, ratings, and trust reputation updates"
];

const testimonials = [
  {
    quote: "Campus Nexus helped us run a cross-college hackathon with execution quality we never had before.",
    name: "Dr. Meera Iyer",
    role: "Dean of Innovation, Alpha Tech"
  },
  {
    quote: "The AI match system found teammates who complemented my skills perfectly.",
    name: "Nina Patel",
    role: "Student Builder"
  },
  {
    quote: "This is the first product that feels like ERP discipline with startup velocity.",
    name: "Aarav Shah",
    role: "Incubator Mentor"
  }
];

export default function Features() {
  return (
    <>
      <FadeInSection className="mx-auto mt-4 max-w-7xl px-4 lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-3">
          <div className="flex animate-[marquee_18s_linear_infinite] gap-10 whitespace-nowrap px-8 text-sm text-slate-300">
            {trusted.concat(trusted).map((name, index) => (
              <span key={`${name}-${index}`} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </FadeInSection>

      <FadeInSection id="features" className="mx-auto max-w-7xl px-4 pb-8 pt-20 lg:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-cyan">Platform Modules</p>
          <h2 className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl">Purpose-built for modern campus innovation ecosystems</h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Every module is designed to look premium and execute fast, from secure tenancy and AI recommendations to collaboration and delivery workflows.
          </p>
        </div>

        <StaggerGrid className="mt-8 grid gap-4 md:grid-cols-3">
          {bentoCards.map((card) => (
            <StaggerItem key={card.title} className={card.className}>
              <article className="surface-glass card-hover h-full rounded-2xl p-6">
                <card.icon className="h-5 w-5 text-brand-cyan" />
                <h3 className="mt-4 font-heading text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{card.text}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </FadeInSection>

      <FadeInSection className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 pt-10 lg:grid-cols-2 lg:px-6">
        <article className="surface-glass card-hover rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-cyan">
            <BarChart3 className="h-4 w-4" />
            AI Matchmaking Engine
          </div>
          <h3 className="mt-4 font-heading text-2xl font-semibold text-white">Live recommendation intelligence</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Resume parsing, skill graphs, mentor alignment, and compatibility scoring produce high-confidence suggestions.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Teammate Fit", "94%"],
              ["Project Match", "89%"],
              ["Mentor Coverage", "91%"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/15 bg-[#0f172a]/80 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </article>

        <article id="security" className="surface-glass card-hover rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-emerald">
            <ShieldCheck className="h-4 w-4" />
            Multi-Tenant Security
          </div>
          <h3 className="mt-4 font-heading text-2xl font-semibold text-white">Isolation-first architecture</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Tenant-aware middleware, audit tracking, role and attribute controls, and risk detection keep data secure across institutions.
          </p>
          <div className="mt-6 space-y-3">
            {["Tenant-scoped APIs", "IP and device activity checks", "Audit logs and suspicious activity scoring"].map((item) => (
              <div key={item} className="rounded-xl border border-white/15 bg-[#0f172a]/80 px-4 py-3 text-sm text-slate-200">
                <Lock className="mr-2 inline h-4 w-4 text-brand-emerald" />
                {item}
              </div>
            ))}
          </div>
        </article>
      </FadeInSection>

      <FadeInSection id="timeline" className="mx-auto max-w-7xl px-4 pb-10 pt-12 lg:px-6">
        <div className="surface-glass rounded-3xl p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-cyan">How It Works</p>
          <h3 className="mt-3 font-heading text-3xl font-bold text-white">Innovation lifecycle from idea to outcome</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {timeline.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/15 bg-[#0f172a]/70 p-4">
                <div className="text-xs font-semibold text-brand-cyan">STEP {index + 1}</div>
                <p className="mt-2 text-sm leading-7 text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="mx-auto max-w-7xl px-4 pb-8 pt-8 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((entry) => (
            <article key={entry.name} className="surface-glass card-hover rounded-2xl p-6">
              <p className="text-sm leading-7 text-slate-200">"{entry.quote}"</p>
              <p className="mt-5 font-heading text-base font-semibold text-white">{entry.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.role}</p>
            </article>
          ))}
        </div>
      </FadeInSection>

      <FadeInSection className="mx-auto max-w-7xl px-4 pb-8 pt-8 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["10k+", "Active Users"],
            ["50+", "Colleges Onboarded"],
            ["1k+", "Projects Delivered"]
          ].map(([value, label]) => (
            <div key={label} className="surface-glass rounded-2xl p-6 text-center card-hover">
              <p className="font-heading text-4xl font-bold text-white">{value}</p>
              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </FadeInSection>

      <FadeInSection id="pricing" className="mx-auto max-w-7xl px-4 pb-14 pt-10 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Starter", "Free", "For 1 college pilot", ["Core collaboration", "Basic AI matching", "Community support"]],
            ["Hackathon Pro", "$49/mo", "Best for winning teams", ["Advanced AI scoring", "Realtime workflows", "Priority onboarding"]],
            ["Enterprise", "Custom", "For multi-college networks", ["Hybrid isolation", "Dedicated infra", "SLA and security reviews"]]
          ].map(([name, price, subtitle, points]) => (
            <article key={name as string} className="surface-glass card-hover rounded-2xl p-6">
              <h4 className="font-heading text-xl font-semibold text-white">{name as string}</h4>
              <p className="mt-2 text-3xl font-bold text-white">{price as string}</p>
              <p className="mt-1 text-sm text-slate-300">{subtitle as string}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-200">
                {(points as string[]).map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-emerald" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </FadeInSection>

      <FadeInSection className="mx-auto max-w-7xl px-4 pb-20 lg:px-6">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-brand-purple/35 via-brand-cyan/25 to-brand-emerald/25 px-8 py-12 text-center backdrop-blur-xl">
          <h3 className="font-heading text-4xl font-bold text-white">Ready to launch a world-class innovation platform?</h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-100">
            Turn your campus network into a high-velocity product ecosystem with AI collaboration and secure multi-tenant architecture.
          </p>
          <a
            href="/dashboard"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.02]"
          >
            Launch Campus Nexus
          </a>
        </div>
      </FadeInSection>
    </>
  );
}
