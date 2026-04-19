import { NextResponse } from "next/server";
import { generateMatchRecommendation } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const recommendation = generateMatchRecommendation({
    userId: body.userId ?? "demo-user",
    skills: body.skills ?? ["Next.js", "MongoDB", "UI"],
    projectSkills: body.projectSkills ?? ["Next.js", "AI", "Security"],
    interests: body.interests ?? ["innovation", "hackathons", "research"]
  });

  return NextResponse.json({ recommendation });
}
