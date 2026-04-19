import Link from "next/link";

const footerLinks = [
  { title: "Product", items: ["Features", "Security", "Pricing", "Roadmap"] },
  { title: "Platform", items: ["Multi-tenant", "AI Matchmaking", "Realtime", "Analytics"] },
  { title: "Company", items: ["About", "Careers", "Contact", "Docs"] }
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030712]/70 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-6">
        <div>
          <h4 className="font-heading text-xl font-semibold text-white">Campus Nexus</h4>
          <p className="mt-3 max-w-sm text-sm leading-7 text-slate-300">
            Federated, AI-powered collaboration ecosystem for colleges, students, faculty, startups, and innovators.
          </p>
        </div>

        {footerLinks.map((group) => (
          <div key={group.title}>
            <h5 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{group.title}</h5>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {group.items.map((item) => (
                <li key={item}>
                  <Link href="#" className="transition hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-4 pt-5 text-xs text-slate-400 lg:px-6">
        2026 Campus Nexus. Built for hackathon excellence.
      </div>
    </footer>
  );
}
