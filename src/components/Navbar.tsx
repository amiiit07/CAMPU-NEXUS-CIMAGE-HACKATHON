"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const links = [
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "Timeline", href: "#timeline" },
  { label: "Pricing", href: "#pricing" }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/65 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="group inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan shadow-glow-purple">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-heading text-base font-semibold text-white">Campus Nexus</div>
            <div className="text-xs tracking-[0.2em] text-slate-400">FEDERATED INNOVATION CLOUD</div>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="group relative text-sm text-slate-300 transition hover:text-white">
              {link.label}
              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-5 py-2.5 text-sm font-semibold text-white shadow-glow-purple"
          >
            Launch App
          </Link>
        </motion.div>
      </nav>
    </header>
  );
}
