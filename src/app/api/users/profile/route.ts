import { fail, ok, safeJson } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import { Profile } from "@/lib/models";
import { requireApiAuth } from "@/lib/api-auth";
import { profileSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/security-api";

export async function PUT(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid profile payload", 400, parsed.error.flatten());
    }

    await connectToDatabase();

    const payload = {
      ...parsed.data,
      headline: parsed.data.headline ? sanitizeText(parsed.data.headline) : undefined,
      bio: parsed.data.bio ? sanitizeText(parsed.data.bio) : undefined,
      githubHandle: parsed.data.githubHandle ? sanitizeText(parsed.data.githubHandle) : undefined,
      availability: parsed.data.availability ? sanitizeText(parsed.data.availability) : undefined
    };

    const profile = await Profile.findOneAndUpdate(
      { tenantId: authResult.auth.tenantId, userId: authResult.auth.userId },
      { $set: payload },
      { upsert: true, new: true }
    ).lean();

    return ok({ profile });
  } catch (error) {
    return fail("Failed to update profile", 500, error instanceof Error ? error.message : "unknown");
  }
}
