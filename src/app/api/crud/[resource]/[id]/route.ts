import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { fail, ok, safeJson } from "@/lib/http";
import { requireApiAuth } from "@/lib/api-auth";
import { CRUD_CONFIG, writablePayload } from "@/lib/crud-config";
import { scopeFor, type Resource, type Scope } from "@/lib/rbac";

function isResource(value: string): value is Resource {
  return Object.prototype.hasOwnProperty.call(CRUD_CONFIG, value);
}

function baseFilterByScope(scope: Scope, auth: { userId: string; tenantId: string }, resource: Resource) {
  if (scope === "global") {
    return {};
  }

  if (resource === "tenants") {
    return { _id: auth.tenantId };
  }

  if (scope === "tenant") {
    return { tenantId: auth.tenantId };
  }

  if (scope === "own") {
    const ownerField = CRUD_CONFIG[resource].ownerField;
    if (!ownerField) {
      return { tenantId: auth.tenantId };
    }
    return { tenantId: auth.tenantId, [ownerField]: auth.userId };
  }

  return null;
}

export async function GET(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const { resource: resourceRaw, id } = await params;
    if (!isResource(resourceRaw)) {
      return fail("Unknown resource", 404);
    }

    const scope = scopeFor(authResult.auth.role as never, resourceRaw, "read");
    if (scope === "none") {
      return fail("Forbidden", 403);
    }

    await connectToDatabase();

    const baseFilter = baseFilterByScope(scope, authResult.auth, resourceRaw);
    if (!baseFilter) {
      return fail("Forbidden", 403);
    }

    const objectFilter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { _id: id };
    const filter = { ...baseFilter, ...objectFilter };
    const item = await CRUD_CONFIG[resourceRaw].model.findOne(filter).lean();

    if (!item) {
      return fail("Not found", 404);
    }

    return ok({ item, resource: resourceRaw, scope });
  } catch (error) {
    return fail("Failed to fetch resource", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const { resource: resourceRaw, id } = await params;
    if (!isResource(resourceRaw)) {
      return fail("Unknown resource", 404);
    }

    const scope = scopeFor(authResult.auth.role as never, resourceRaw, "update");
    if (scope === "none") {
      return fail("Forbidden", 403);
    }

    const body = await safeJson(request);
    if (!body || typeof body !== "object") {
      return fail("Invalid payload", 400);
    }

    await connectToDatabase();

    const baseFilter = baseFilterByScope(scope, authResult.auth, resourceRaw);
    if (!baseFilter) {
      return fail("Forbidden", 403);
    }

    const filter = { ...baseFilter, _id: id };
    const payload = writablePayload(resourceRaw, body as Record<string, unknown>, scope, "update");

    if (scope !== "global") {
      delete payload.tenantId;
    }

    if (resourceRaw === "rooms" && Array.isArray(payload.participantIds)) {
      payload.participantIds = Array.from(new Set([authResult.auth.userId, ...payload.participantIds]));
    }

    const item = await CRUD_CONFIG[resourceRaw].model.findOneAndUpdate(filter, { $set: payload }, { new: true }).lean();
    if (!item) {
      return fail("Not found", 404);
    }

    return ok({ item, resource: resourceRaw });
  } catch (error) {
    return fail("Failed to update resource", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const { resource: resourceRaw, id } = await params;
    if (!isResource(resourceRaw)) {
      return fail("Unknown resource", 404);
    }

    const scope = scopeFor(authResult.auth.role as never, resourceRaw, "delete");
    if (scope === "none") {
      return fail("Forbidden", 403);
    }

    await connectToDatabase();

    const baseFilter = baseFilterByScope(scope, authResult.auth, resourceRaw);
    if (!baseFilter) {
      return fail("Forbidden", 403);
    }

    const filter = { ...baseFilter, _id: id };
    const item = await CRUD_CONFIG[resourceRaw].model.findOneAndDelete(filter).lean();
    if (!item) {
      return fail("Not found", 404);
    }

    return ok({ deleted: true, id, resource: resourceRaw });
  } catch (error) {
    return fail("Failed to delete resource", 500, error instanceof Error ? error.message : "unknown");
  }
}
