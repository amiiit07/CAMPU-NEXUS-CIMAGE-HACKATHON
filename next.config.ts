import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep dev and production build artifacts separate to avoid stale chunk collisions.
  distDir: process.env.NODE_ENV === "production" ? ".next-prod" : ".next-dev",
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
