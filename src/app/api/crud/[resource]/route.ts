import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { fail, ok, safeJson } from "@/lib/http";
import { paginationFromSearch } from "@/lib/pagination";
import { requireApiAuth } from "@/lib/api-auth";
import { buildSearchFilter, CRUD_CONFIG, writablePayload } from "@/lib/crud-config";
import { scopeFor, type Resource, type Scope } from "@/lib/rbac";

function isResource(value: string): value is Resource {
  return Object.prototype.hasOwnProperty.call(CRUD_CONFIG, value);
}

function tenantScopeFilter(
  scope: Scope,
  auth: { userId: string; tenantId: string },
  resource: Resource,
  tenantId?: string | null
) {
  if (scope === "global") {
    if (resource === "tenants") {
      return {};
    }
    return tenantId ? { tenantId } : {};
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

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const { resource: resourceRaw } = await params;
    if (!isResource(resourceRaw)) {
      return fail("Unknown resource", 404);
    }

    const scope = scopeFor(authResult.auth.role as never, resourceRaw, "read");
    if (scope === "none") {
      return fail("Forbidden", 403);
    }

    await connectToDatabase();

    const url = new URL(request.url);
    const tenantIdQuery = url.searchParams.get("tenantId");
    const scopeFilter = tenantScopeFilter(scope, authResult.auth, resourceRaw, tenantIdQuery);
    if (!scopeFilter) {
      return fail("Forbidden", 403);
    }

    const searchFilter = buildSearchFilter(resourceRaw, url.searchParams.get("q"));
    const { limit, page, skip } = paginationFromSearch(url);
    const filter = { ...scopeFilter, ...searchFilter };

    const model = CRUD_CONFIG[resourceRaw].model;
    const sort = CRUD_CONFIG[resourceRaw].defaultSort ?? { createdAt: -1 };

    const [items, total] = await Promise.all([
      model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      model.countDocuments(filter)
    ]);

    return ok({ items, total, page, limit, resource: resourceRaw, scope });
  } catch (error) {
    return fail("Failed to fetch resource", 500, error instanceof Error ? error.message : "unknown");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const authResult = await requireApiAuth(request);
    if ("error" in authResult) {
      return fail(authResult.error, authResult.error === "Unauthorized" ? 401 : 403);
    }

    const { resource: resourceRaw } = await params;
    if (!isResource(resourceRaw)) {
      return fail("Unknown resource", 404);
    }

    const scope = scopeFor(authResult.auth.role as never, resourceRaw, "create");
    if (scope === "none") {
      return fail("Forbidden", 403);
    }

    const body = await safeJson(request);
    if (!body || typeof body !== "object") {
      return fail("Invalid payload", 400);
    }

    await connectToDatabase();

    const payload = writablePayload(resourceRaw, body as Record<string, unknown>, scope, "create");
    const cfg = CRUD_CONFIG[resourceRaw];

    if (resourceRaw === "tenants") {
      if (scope !== "global") {
        return fail("Forbidden", 403);
      }
    } else {
      const tenantId =
        scope === "global" && typeof payload.tenantId === "string" && mongoose.Types.ObjectId.isValid(payload.tenantId)
          ? payload.tenantId
          : authResult.auth.tenantId;

      payload.tenantId = tenantId;
    }

    if (scope === "own" && cfg.ownerField && !payload[cfg.ownerField]) {
      payload[cfg.ownerField] = authResult.auth.userId;
    }

    if (resourceRaw === "rooms") {
      const participantIds = Array.isArray(payload.participantIds) ? payload.participantIds : [];
      payload.participantIds = Array.from(new Set([authResult.auth.userId, ...participantIds]));
    }

    const item = await cfg.model.create(payload);
    return ok({ item, resource: resourceRaw }, 201);
  } catch (error) {
    return fail("Failed to create resource", 500, error instanceof Error ? error.message : "unknown");
  }
}
