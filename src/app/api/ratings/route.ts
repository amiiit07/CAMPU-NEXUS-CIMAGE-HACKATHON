import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Rating } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { ratingSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid rating payload", 400, parsed.error.flatten());
    }

    if (!mongoose.Types.ObjectId.isValid(parsed.data.subjectId)) {
      return fail("Invalid subject id", 400);
    }

    await connectToDatabase();
    const rating = await Rating.create({
      tenantId: authResult.auth.tenantId,
      raterId: authResult.auth.userId,
      subjectId: parsed.data.subjectId,
      score: parsed.data.score,
      category: parsed.data.category
    });

    return ok({ rating }, 201);
  } catch (error) {
    return fail("Failed to submit rating", 500, error instanceof Error ? error.message : "unknown");
  }
}
