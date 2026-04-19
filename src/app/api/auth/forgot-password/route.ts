import { connectToDatabase } from "@/lib/db";
import { fail, ok, safeJson } from "@/lib/http";
import { User } from "@/lib/models";
import { createPasswordResetToken, limitByIp, tenantFromRequest } from "@/lib/security-api";
import { resolveTenantRecord } from "@/lib/tenant-db";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const throttled = limitByIp(request, "auth-forgot-password", 15, 60_000);
    if (throttled) {
      return throttled;
    }

    const body = await safeJson(request);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid request body", 400, parsed.error.flatten());
    }

    await connectToDatabase();
    const tenant = await resolveTenantRecord(tenantFromRequest(request));
    const user = await User.findOne({ tenantId: tenant._id, email: parsed.data.email.toLowerCase() }).select("_id email status");

    if (!user || user.status !== "active") {
      return ok({ message: "If this email exists, a reset link has been generated." });
    }

    const token = createPasswordResetToken(30);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetTokenHash: token.tokenHash,
          resetTokenExpiresAt: token.expiresAt
        }
      }
    );

    return ok({
      message: "If this email exists, a reset link has been generated.",
      resetToken: process.env.NODE_ENV === "production" ? undefined : token.rawToken
    });
  } catch (error) {
    return fail("Forgot password failed", 500, error instanceof Error ? error.message : "unknown");
  }
}
