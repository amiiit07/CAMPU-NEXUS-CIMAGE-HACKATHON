import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Campus Nexus",
    short_name: "CampusNexus",
    description: "Federated AI-powered collaboration platform for colleges and innovators.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#7C3AED",
    icons: []
  };
}
