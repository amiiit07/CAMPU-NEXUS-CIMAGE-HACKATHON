export const ROLES = ["student", "faculty", "college_admin", "super_admin"] as const;

export type Role = (typeof ROLES)[number] | "startup";

export const RESOURCES = [
  "users",
  "profiles",
  "skills",
  "projects",
  "applications",
  "teams",
  "tasks",
  "rooms",
  "messages",
  "ratings",
  "notifications",
  "events",
  "tenants",
  "departments",
  "reports"
] as const;

export type Resource = (typeof RESOURCES)[number];
export type CrudAction = "create" | "read" | "update" | "delete";
export type Scope = "none" | "own" | "tenant" | "global";

type Matrix = Record<Role, Record<Resource, Record<CrudAction, Scope>>>;

const own = { create: "own", read: "own", update: "own", delete: "own" } as const;
const tenant = { create: "tenant", read: "tenant", update: "tenant", delete: "tenant" } as const;
const none = { create: "none", read: "none", update: "none", delete: "none" } as const;

const STUDENT: Record<Resource, Record<CrudAction, Scope>> = {
  users: { create: "none", read: "tenant", update: "own", delete: "none" },
  profiles: { create: "own", read: "tenant", update: "own", delete: "none" },
  skills: { create: "none", read: "tenant", update: "none", delete: "none" },
  projects: { create: "tenant", read: "tenant", update: "own", delete: "own" },
  applications: own,
  teams: { create: "own", read: "tenant", update: "own", delete: "own" },
  tasks: { create: "own", read: "tenant", update: "own", delete: "own" },
  rooms: { create: "own", read: "tenant", update: "own", delete: "own" },
  messages: own,
  ratings: own,
  notifications: { create: "none", read: "own", update: "own", delete: "own" },
  events: { create: "none", read: "tenant", update: "none", delete: "none" },
  tenants: none,
  departments: { create: "none", read: "tenant", update: "none", delete: "none" },
  reports: own
};

const FACULTY: Record<Resource, Record<CrudAction, Scope>> = {
  ...STUDENT,
  projects: tenant,
  applications: tenant,
  teams: tenant,
  tasks: tenant,
  rooms: tenant,
  messages: tenant,
  ratings: tenant,
  events: tenant,
  reports: tenant
};

const COLLEGE_ADMIN: Record<Resource, Record<CrudAction, Scope>> = {
  users: tenant,
  profiles: tenant,
  skills: tenant,
  projects: tenant,
  applications: tenant,
  teams: tenant,
  tasks: tenant,
  rooms: tenant,
  messages: tenant,
  ratings: tenant,
  notifications: tenant,
  events: tenant,
  tenants: { create: "none", read: "tenant", update: "tenant", delete: "none" },
  departments: tenant,
  reports: tenant
};

const SUPER_ADMIN: Record<Resource, Record<CrudAction, Scope>> = {
  users: { create: "global", read: "global", update: "global", delete: "global" },
  profiles: { create: "global", read: "global", update: "global", delete: "global" },
  skills: { create: "global", read: "global", update: "global", delete: "global" },
  projects: { create: "global", read: "global", update: "global", delete: "global" },
  applications: { create: "global", read: "global", update: "global", delete: "global" },
  teams: { create: "global", read: "global", update: "global", delete: "global" },
  tasks: { create: "global", read: "global", update: "global", delete: "global" },
  rooms: { create: "global", read: "global", update: "global", delete: "global" },
  messages: { create: "global", read: "global", update: "global", delete: "global" },
  ratings: { create: "global", read: "global", update: "global", delete: "global" },
  notifications: { create: "global", read: "global", update: "global", delete: "global" },
  events: { create: "global", read: "global", update: "global", delete: "global" },
  tenants: { create: "global", read: "global", update: "global", delete: "global" },
  departments: { create: "global", read: "global", update: "global", delete: "global" },
  reports: { create: "global", read: "global", update: "global", delete: "global" }
};

const STARTUP: Record<Resource, Record<CrudAction, Scope>> = {
  ...STUDENT,
  projects: tenant,
  applications: tenant
};

export const permissionMatrix: Matrix = {
  student: STUDENT,
  faculty: FACULTY,
  college_admin: COLLEGE_ADMIN,
  super_admin: SUPER_ADMIN,
  startup: STARTUP
};

export function scopeFor(role: Role, resource: Resource, action: CrudAction): Scope {
  return permissionMatrix[role]?.[resource]?.[action] ?? "none";
}

export function can(role: Role, resource: Resource, action: CrudAction) {
  return scopeFor(role, resource, action) !== "none";
}
