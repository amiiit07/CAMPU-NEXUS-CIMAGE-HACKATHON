# Campus Nexus Enterprise RBAC Blueprint

## 1) Folder Structure

```txt
src/
  app/
    api/
      auth/
        login/
        logout/
        register/
        me/
        forgot-password/
        reset-password/
        update-password/
      crud/
        [resource]/
        [resource]/[id]/
      rbac/matrix/
      projects/
      users/
      notifications/
      tenants/
    dashboard/
      page.tsx
      student/
      faculty/
      admin/
      super-admin/
      workspace/
  components/
    dashboard-shell.tsx
    RoleNav.tsx
    AuthActions.tsx
    ui.tsx
  lib/
    models.ts
    rbac.ts
    crud-config.ts
    api-auth.ts
    security-api.ts
    server-auth.ts
    dashboard-guards.ts
    validators.ts
```

## 2) DB Schema (Core)

- Tenant: slug, name, branding, status, subscriptionPlan
- User: tenantId, email, role, status, passwordHash, failedLoginCount, resetTokenHash
- Profile: userId, skills, achievements, certificates, socialLinks, photoUrl
- Skill: tenantId, name, category, trendingScore
- Department: tenantId, code, name, headUserId
- Project: ownerId, stage, requiredSkills, summary
- Application: projectId, userId, status
- Team: projectId, ownerId, members
- Task: projectId, creatorId, assigneeId, status
- Room: projectId, participantIds, type
- Message: roomId, senderId, text, attachments
- Rating: raterId, subjectId, score, category
- Notification: userId, read, title, body
- Event: eventType, startAt, endAt, status
- Report: reporterId, targetType, reason, status
- AuditLog: actorId, action, resourceType, riskScore

## 3) Role Permission Matrix (CRUD Scope)

Scope values:
- none: denied
- own: own records only
- tenant: all records in own college
- global: all colleges

Role summary:
- Student: own profile/applications/messages/ratings/tasks; tenant read access for public resources
- Faculty: student capabilities + tenant-wide moderation and project/review controls
- College Admin: full tenant-wide CRUD on users, projects, departments, events, reports
- Super Admin: global CRUD on all resources including tenants

See API matrix endpoint:
- GET /api/rbac/matrix

## 4) Backend APIs

Authentication:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/update-password

Unified CRUD API:
- GET /api/crud/:resource
- POST /api/crud/:resource
- GET /api/crud/:resource/:id
- PUT /api/crud/:resource/:id
- DELETE /api/crud/:resource/:id

Supported resources:
- users, profiles, skills, projects, applications, teams, tasks, rooms, messages, ratings, notifications, events, tenants, departments, reports

## 5) Frontend Role Dashboards

- Student dashboard: /dashboard/student
- Faculty dashboard: /dashboard/faculty
- College admin dashboard: /dashboard/admin
- Super admin dashboard: /dashboard/super-admin
- Shared role-aware overview: /dashboard
- CRUD studio for all resources: /dashboard/workspace

## 6) CRUD Pages

- Unified enterprise page: /dashboard/workspace
- Resource picker + search + table + JSON quick create
- Backed by RBAC-aware `/api/crud/*` endpoints

## 7) Middleware + Auth Logic

- Cookie-based auth token with signed HMAC payload
- Tenant scope from token for API authorization
- Rate limiting for auth-sensitive routes
- Dashboard server-side guard redirects unauthenticated users to /login
- Role-only pages use `requireDashboardRole` for route protection

## 8) Premium UI Components

- Glassmorphism shell cards and metric widgets
- Premium sidebar nav with role-aware links
- Smooth interactions via modern card layouts and polished controls
- Mobile responsive dashboard grids and CRUD tables

## Hackathon Demo Flow

1. Login with each role account.
2. Open /dashboard and show role-based workflow card.
3. Open /dashboard/workspace and switch resource scope.
4. Call /api/rbac/matrix to demonstrate permission contract.
5. Show tenant-safe CRUD behavior by comparing roles.
