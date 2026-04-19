import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { fail, ok, safeJson } from "@/lib/http";
import { User } from "@/lib/models";
import { hashPasswordResetToken, limitByIp } from "@/lib/security-api";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const throttled = limitByIp(request, "auth-reset-password", 20, 60_000);
    if (throttled) {
      return throttled;
    }

    const body = await safeJson(request);
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid request body", 400, parsed.error.flatten());
    }

    const tokenHash = hashPasswordResetToken(parsed.data.token);

    await connectToDatabase();
    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() }
    }).select("_id");

    if (!user) {
      return fail("Invalid or expired reset token", 400);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          failedLoginCount: 0
        },
        $unset: {
          resetTokenHash: "",
          resetTokenExpiresAt: ""
        }
      }
    );

    return ok({ message: "Password reset successful" });
  } catch (error) {
    return fail("Reset password failed", 500, error instanceof Error ? error.message : "unknown");
  }
}
