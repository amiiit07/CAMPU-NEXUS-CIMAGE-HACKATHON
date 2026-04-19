import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { authContextFromRequest } from "@/lib/security-api";

export type ApiAuth = {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
};

export async function requireApiAuth(request: Request | NextRequest, allowedRoles?: string[]) {
  await connectToDatabase();
  const payload = authContextFromRequest(request);
  if (!payload) {
    return { error: "Unauthorized" as const };
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return { error: "Forbidden" as const };
  }

  const user = await User.findOne({ _id: payload.sub, tenantId: payload.tenantId }).lean();
  if (!user) {
    return { error: "User not found" as const };
  }

  return {
    auth: {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
      name: payload.name
    } satisfies ApiAuth
  };
}
