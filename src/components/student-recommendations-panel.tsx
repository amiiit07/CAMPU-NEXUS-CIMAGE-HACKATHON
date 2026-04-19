"use client";

import { useEffect, useState } from "react";
import { Brain, LoaderCircle, Sparkles, Target, Users } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

type Recommendation = {
  userId: string;
  teammateScore: number;
  projectScore: number;
  mentorScore: number;
  reasoning: string[];
};

type RecommendationResponse = {
  ok: boolean;
  data?: {
    recommendation?: Recommendation;
  };
  error?: {
    message?: string;
  };
};

const defaultPayload = {
  skills: ["Next.js", "MongoDB", "UI"],
  projectSkills: ["Next.js", "AI", "Security"],
  interests: ["innovation", "hackathons", "research"]
};

export function StudentRecommendationsPanel() {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRecommendation() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(defaultPayload)
      });

      const payload = (await response.json()) as RecommendationResponse;
      if (!response.ok || !payload.ok || !payload.data?.recommendation) {
        throw new Error(payload.error?.message ?? "Recommendation unavailable right now.");
      }

      setRecommendation(payload.data.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recommendation unavailable right now.");
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecommendation();
  }, []);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-cyan-400/10 via-sky-400/5 to-transparent" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <Brain className="h-3.5 w-3.5" />
                Live AI Recommendation
              </Badge>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">Smart teammate and mentor fit</h3>
            <p className="mt-2 text-sm text-slate-300">
              This panel calls the recommendation API and returns a score-based suggestion using your demo skill profile.
            </p>
          </div>
          <Button onClick={() => void loadRecommendation()} className="min-w-[170px]">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : "Regenerate Match"}
          </Button>
        </div>

        {error ? <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div> : null}

        {recommendation ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Users className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.2em]">Teammate Score</span>
                </div>
                <div className="mt-3 text-3xl font-semibold text-white">{recommendation.teammateScore}%</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Target className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.2em]">Project Score</span>
                </div>
                <div className="mt-3 text-3xl font-semibold text-white">{recommendation.projectScore}%</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Brain className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.2em]">Mentor Score</span>
                </div>
                <div className="mt-3 text-3xl font-semibold text-white">{recommendation.mentorScore}%</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Why this recommendation</div>
              <div className="mt-4 space-y-3">
                {recommendation.reasoning.map((line) => (
                  <div key={line} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Card>
  );
}
