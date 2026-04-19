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
    const filter = {
      tenantId: authResult.auth.tenantId,
      raterId: authResult.auth.userId,
      subjectId: parsed.data.subjectId,
      category: parsed.data.category
    };

    const existing = await Rating.findOne(filter).lean();
    const rating = await Rating.findOneAndUpdate(
      filter,
      {
        $set: {
          score: parsed.data.score
        },
        $setOnInsert: filter
      },
      { upsert: true, new: true }
    ).lean();

    return ok({ rating, created: !existing }, existing ? 200 : 201);
  } catch (error) {
    return fail("Failed to submit rating", 500, error instanceof Error ? error.message : "unknown");
  }
}
