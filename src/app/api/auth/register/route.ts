import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { Profile, User } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { createToken, limitByIp, sanitizeText, setAuthCookie, tenantFromRequest } from "@/lib/security-api";
import { resolveTenantRecord } from "@/lib/tenant-db";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const throttled = limitByIp(request, "auth-register", 20, 60_000);
    if (throttled) {
      return throttled;
    }

    const body = await safeJson(request);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid request body", 400, parsed.error.flatten());
    }

    const requestedRole = parsed.data.role ?? "student";
    if (["super_admin", "college_admin"].includes(requestedRole)) {
      return fail("Role is not allowed for self-registration", 403);
    }

    await connectToDatabase();
    const tenant = await resolveTenantRecord(tenantFromRequest(request));
    const existing = await User.findOne({ tenantId: tenant._id, email: parsed.data.email.toLowerCase() }).lean();
    if (existing) {
      return fail("User already exists", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await User.create({
      tenantId: tenant._id,
      email: parsed.data.email.toLowerCase(),
      name: sanitizeText(parsed.data.name),
      passwordHash,
      role: requestedRole,
      authProvider: "credentials",
      status: "active"
    });

    await Profile.create({
      tenantId: tenant._id,
      userId: user._id,
      headline: "",
      bio: "",
      skills: [],
      portfolioLinks: [],
      badges: [],
      availability: "open"
    });

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
    }, 201);
  } catch (error) {
    return fail("Register failed", 500, error instanceof Error ? error.message : "unknown");
  }
}
