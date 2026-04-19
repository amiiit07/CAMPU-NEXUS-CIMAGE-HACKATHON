"use client";

import { useState } from "react";
import { LoaderCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui";

type SeedResponse = {
  ok?: boolean;
  error?: {
    message?: string;
  };
};

export function SeedDemoButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function seedDemo() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/seed", { method: "POST" });
      const payload = (await response.json()) as SeedResponse;

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Demo seed failed.");
      }

      setStatus("Demo tenant refreshed with users, projects, and collaboration room.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Demo seed failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={() => void seedDemo()} className="w-full sm:w-auto">
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {loading ? "Refreshing Demo..." : "Seed Demo Data"}
      </Button>
      {status ? <div className="text-sm text-cyan-100">{status}</div> : null}
    </div>
  );
}
