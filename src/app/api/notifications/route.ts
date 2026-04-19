import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Notification, Tenant, User } from "@/lib/models";
import { fail, ok, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { paginationFromSearch } from "@/lib/pagination";
import { sanitizeText } from "@/lib/security-api";

const broadcastSchema = z.object({
  title: z.string().min(2).max(120),
  body: z.string().min(4).max(1000),
  target: z.enum(["my_college", "all_colleges", "specific_college"]),
  tenantId: z.string().optional()
});

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    await connectToDatabase();
    const { page, limit, skip } = paginationFromSearch(new URL(request.url));

    const [items, total] = await Promise.all([
      Notification.find({ tenantId: authResult.auth.tenantId, userId: authResult.auth.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ tenantId: authResult.auth.tenantId, userId: authResult.auth.userId })
    ]);

    return ok({ items, page, limit, total });
  } catch (error) {
    return fail("Failed to fetch notifications", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];

    await connectToDatabase();

    const filter =
      ids.length > 0
        ? {
            tenantId: authResult.auth.tenantId,
            userId: authResult.auth.userId,
            _id: { $in: ids.filter((id) => mongoose.Types.ObjectId.isValid(id)) }
          }
        : {
            tenantId: authResult.auth.tenantId,
            userId: authResult.auth.userId
          };

    const result = await Notification.updateMany(filter, { $set: { read: true } });
    return ok({ updated: result.modifiedCount });
  } catch (error) {
    return fail("Failed to update notifications", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(request, ["college_admin", "super_admin"]);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const body = await safeJson(request);
    const parsed = broadcastSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid notification payload", 400, parsed.error.flatten());
    }

    const isSuperAdmin = authResult.auth.role === "super_admin";
    const target = parsed.data.target;

    if (!isSuperAdmin && target !== "my_college") {
      return fail("College admin can only notify their own college", 403);
    }

    await connectToDatabase();

    let tenantFilter: Record<string, unknown>;
    if (target === "all_colleges") {
      if (!isSuperAdmin) {
        return fail("Forbidden", 403);
      }
      tenantFilter = {};
    } else if (target === "specific_college") {
      if (!isSuperAdmin) {
        return fail("Forbidden", 403);
      }
      if (!parsed.data.tenantId || !mongoose.Types.ObjectId.isValid(parsed.data.tenantId)) {
        return fail("A valid college is required", 400);
      }
      tenantFilter = { _id: parsed.data.tenantId };
    } else {
      tenantFilter = { _id: authResult.auth.tenantId };
    }

    const targetTenants = await Tenant.find(tenantFilter).select("_id name").lean();
    if (targetTenants.length === 0) {
      return fail("No target colleges found", 404);
    }

    const tenantIds = targetTenants.map((tenant) => tenant._id);
    const users = await User.find({ tenantId: { $in: tenantIds }, status: "active" }).select("_id tenantId").lean();

    if (users.length === 0) {
      return fail("No active users found for this target", 404);
    }

    const title = sanitizeText(parsed.data.title);
    const message = sanitizeText(parsed.data.body);
    const notifications = users.map((user) => ({
      tenantId: user.tenantId,
      userId: user._id,
      title,
      body: message
    }));

    await Notification.insertMany(notifications);

    return ok({
      delivered: notifications.length,
      colleges: targetTenants.map((tenant) => ({ id: tenant._id.toString(), name: tenant.name })),
      target
    }, 201);
  } catch (error) {
    return fail("Failed to send notifications", 500, error instanceof Error ? error.message : "unknown");
  }
}
