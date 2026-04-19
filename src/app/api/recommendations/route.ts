import { NextResponse } from "next/server";
import { generateMatchRecommendation } from "@/lib/ai";
import { requireApiAuth } from "@/lib/api-auth";
import { safeJson, fail } from "@/lib/http";
import { z } from "zod";

const recommendationSchema = z.object({
  userId: z.string().optional(),
  skills: z.array(z.string()).max(40).optional(),
  projectSkills: z.array(z.string()).max(40).optional(),
  interests: z.array(z.string()).max(40).optional()
});

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = recommendationSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return fail("Invalid recommendation payload", 400, parsed.error.flatten());
    }

    const recommendation = generateMatchRecommendation({
      userId: parsed.data.userId ?? authResult.auth.userId,
      skills: parsed.data.skills ?? ["Next.js", "MongoDB", "UI"],
      projectSkills: parsed.data.projectSkills ?? ["Next.js", "AI", "Security"],
      interests: parsed.data.interests ?? ["innovation", "hackathons", "research"]
    });

    return NextResponse.json({ ok: true, data: { recommendation } });
  } catch (error) {
    return fail("Failed to generate recommendation", 500, error instanceof Error ? error.message : "unknown");
  }
}
