import type { Metadata } from "next";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "AI-powered Campus Collaboration",
  description:
    "Discover Campus Nexus: a premium multi-tenant platform for student projects, faculty mentorship, secure collaboration, and cross-college innovation.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Campus Nexus | AI-powered Campus Collaboration",
    description:
      "A futuristic SaaS platform for colleges to run projects, mentorship, and collaboration with secure tenant isolation.",
    url: siteUrl
  },
  twitter: {
    card: "summary",
    title: "Campus Nexus | AI-powered Campus Collaboration",
    description:
      "A futuristic SaaS platform for colleges to run projects, mentorship, and collaboration with secure tenant isolation."
  }
};

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Campus Nexus",
    url: siteUrl,
    description: "Federated AI-powered collaboration platform for colleges, students, faculty, startups, and innovators.",
    sameAs: []
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Campus Nexus",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    description:
      "Multi-tenant collaboration platform with role-based dashboards, project workflows, and secure tenant-aware APIs for campus ecosystems.",
    url: siteUrl
  };

  return (
    <div className="relative overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
