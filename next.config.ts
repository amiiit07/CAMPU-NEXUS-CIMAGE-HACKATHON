import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  // Vercel expects production output in `.next`.
  // Local dev/prod keep separate directories to avoid stale chunk collisions on Windows.
  distDir: isVercel ? ".next" : process.env.NODE_ENV === "production" ? ".next-prod" : ".next-dev",
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
