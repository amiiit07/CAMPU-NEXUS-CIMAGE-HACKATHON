import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Campus Nexus | Multi-tenant College Collaboration Platform",
    template: "%s | Campus Nexus"
  },
  description: "Campus Nexus is a federated AI-powered collaboration platform for colleges, students, faculty, startups, and innovators.",
  applicationName: "Campus Nexus",
  keywords: [
    "college collaboration platform",
    "multi-tenant saas",
    "student project platform",
    "faculty mentorship dashboard",
    "campus innovation platform",
    "hackathon management"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Campus Nexus",
    title: "Campus Nexus | Multi-tenant College Collaboration Platform",
    description: "AI-powered collaboration, secure tenant isolation, and enterprise workflows for modern campus ecosystems.",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Campus Nexus | Multi-tenant College Collaboration Platform",
    description: "AI-powered collaboration, secure tenant isolation, and enterprise workflows for modern campus ecosystems."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${inter.variable} bg-[#030712] font-body text-[#cbd5e1] antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
