import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { createToken, limitByIp, setAuthCookie, tenantFromRequest } from "@/lib/security-api";
import { resolveTenantRecord } from "@/lib/tenant-db";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const throttled = limitByIp(request, "auth-login", 40, 60_000);
    if (throttled) {
      return throttled;
    }

    const body = await safeJson(request);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid request body", 400, parsed.error.flatten());
    }

    await connectToDatabase();
    const tenant = await resolveTenantRecord(tenantFromRequest(request));
    const user = await User.findOne({ tenantId: tenant._id, email: parsed.data.email.toLowerCase() }).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return fail("Invalid credentials", 401);
    }

    const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!passwordOk) {
      return fail("Invalid credentials", 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = createToken({
      sub: user._id.toString(),
      tenantId: tenant._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    });

    await setAuthCookie(token);

    return ok({
      user: {
        id: user._id.toString(),
        tenantId: tenant._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return fail("Login failed", 500, error instanceof Error ? error.message : "unknown");
  }
}
