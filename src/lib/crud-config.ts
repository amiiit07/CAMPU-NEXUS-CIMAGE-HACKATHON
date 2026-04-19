import type { FilterQuery } from "mongoose";
import {
  Application,
  Department,
  Event,
  Message,
  Notification,
  Profile,
  Project,
  Rating,
  Report,
  Room,
  Skill,
  Task,
  Team,
  Tenant,
  User
} from "@/lib/models";
import type { Resource, Scope } from "@/lib/rbac";
import { sanitizeText } from "@/lib/security-api";

export type CrudResourceConfig = {
  model: any;
  ownerField?: string;
  defaultSort?: Record<string, 1 | -1>;
  searchableFields?: string[];
  sanitizeFields?: string[];
  forceTenant?: boolean;
  createFields?: string[];
  updateFields?: string[];
  ownUpdateFields?: string[];
};

export const CRUD_CONFIG: Record<Resource, CrudResourceConfig> = {
  users: {
    model: User,
    ownerField: "_id",
    defaultSort: { createdAt: -1 },
    searchableFields: ["name", "email"],
    createFields: ["name", "email", "password", "role", "status", "departmentId", "avatarUrl", "authProvider", "isVerified"],
    updateFields: ["name", "email", "password", "role", "status", "departmentId", "avatarUrl", "authProvider", "isVerified"],
    ownUpdateFields: ["name", "avatarUrl"]
  },
  profiles: { model: Profile, ownerField: "userId", defaultSort: { updatedAt: -1 }, searchableFields: ["headline", "bio"] },
  skills: { model: Skill, defaultSort: { trendingScore: -1 }, searchableFields: ["name", "category"] },
  projects: { model: Project, ownerField: "ownerId", defaultSort: { createdAt: -1 }, searchableFields: ["title", "summary", "type", "stage"] },
  applications: { model: Application, ownerField: "userId", defaultSort: { createdAt: -1 } },
  teams: { model: Team, ownerField: "ownerId", defaultSort: { createdAt: -1 }, searchableFields: ["name"] },
  tasks: { model: Task, ownerField: "creatorId", defaultSort: { createdAt: -1 }, searchableFields: ["title", "description", "status"] },
  rooms: {
    model: Room,
    ownerField: "creatorId",
    defaultSort: { createdAt: -1 },
    searchableFields: ["title", "type"],
    createFields: ["title", "type", "projectId", "participantIds", "creatorId"],
    updateFields: ["title", "type", "projectId", "participantIds"]
  },
  messages: { model: Message, ownerField: "senderId", defaultSort: { createdAt: -1 }, searchableFields: ["text"] },
  ratings: { model: Rating, ownerField: "raterId", defaultSort: { createdAt: -1 }, searchableFields: ["category"] },
  notifications: { model: Notification, ownerField: "userId", defaultSort: { createdAt: -1 }, searchableFields: ["title", "body"] },
  events: { model: Event, ownerField: "createdBy", defaultSort: { createdAt: -1 }, searchableFields: ["title", "description", "eventType"] },
  tenants: {
    model: Tenant,
    defaultSort: { createdAt: -1 },
    searchableFields: ["name", "slug", "subdomain"],
    forceTenant: false,
    createFields: ["slug", "name", "logoUrl", "brandColor", "subdomain", "isolationMode", "status", "subscriptionPlan", "contactEmail"],
    updateFields: ["name", "logoUrl", "brandColor", "subdomain", "isolationMode", "status", "subscriptionPlan", "contactEmail"]
  },
  departments: { model: Department, defaultSort: { createdAt: -1 }, searchableFields: ["name", "code", "description"] },
  reports: { model: Report, ownerField: "reporterId", defaultSort: { createdAt: -1 }, searchableFields: ["reason", "targetType", "status"] }
};

const RESERVED_WRITE_FIELDS = new Set([
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "passwordHash",
  "resetTokenHash",
  "resetTokenExpiresAt",
  "failedLoginCount",
  "lastLoginAt"
]);

export function buildSearchFilter(resource: Resource, q: string | null): FilterQuery<any> {
  if (!q?.trim()) {
    return {};
  }
  const cfg = CRUD_CONFIG[resource];
  if (!cfg.searchableFields?.length) {
    return {};
  }
  const regex = new RegExp(q.trim(), "i");
  return {
    $or: cfg.searchableFields.map((field) => ({ [field]: regex }))
  };
}

export function sanitizePayload(resource: Resource, payload: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...payload };
  const cfg = CRUD_CONFIG[resource];
  const keys = cfg.sanitizeFields ?? Object.keys(payload);

  for (const key of keys) {
    const value = out[key];
    if (typeof value === "string") {
      out[key] = sanitizeText(value);
    }
    if (Array.isArray(value)) {
      out[key] = value.map((entry) => (typeof entry === "string" ? sanitizeText(entry) : entry));
    }
  }

  return out;
}

export function writablePayload(resource: Resource, payload: Record<string, unknown>, scope: Scope, mode: "create" | "update") {
  const cfg = CRUD_CONFIG[resource];
  const allowedFields =
    mode === "create"
      ? cfg.createFields
      : scope === "own" && cfg.ownUpdateFields?.length
        ? cfg.ownUpdateFields
        : cfg.updateFields;

  const filteredEntries = Object.entries(payload).filter(([key]) => {
    if (RESERVED_WRITE_FIELDS.has(key)) {
      return false;
    }
    return allowedFields ? allowedFields.includes(key) : true;
  });

  return sanitizePayload(resource, Object.fromEntries(filteredEntries));
}
