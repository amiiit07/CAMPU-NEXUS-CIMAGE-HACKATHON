# Campus Nexus - Complete Repository Report

## 1. Project Overview
Campus Nexus ek multi-tenant college collaboration platform hai jisme alag-alag colleges (tenants) ke users apne isolated data ke saath kaam karte hain.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS + Framer Motion UI
- MongoDB + Mongoose
- Custom cookie/JWT style auth helpers
- Role-based access control (RBAC)

Core roles:
- student
- faculty
- college_admin
- super_admin
- startup (compatibility role)

## 2. High-Level Architecture
- Frontend routes: `src/app/**/page.tsx`
- Backend APIs: `src/app/api/**/route.ts`
- Auth/RBAC/Tenant logic: `src/lib/*`
- Shared UI shell/components: `src/components/*`
- Request header security and tenant header injection: `middleware.ts`

Data isolation pattern:
- Har query me `tenantId` filter use hota hai (except allowed global super_admin paths)
- Auth token payload me tenant info preserved rehta hai

## 3. Folder Structure (Important)

```txt
src/
  app/
    layout.tsx
    page.tsx
    login/page.tsx
    dashboard/
      layout.tsx
      page.tsx
      student/page.tsx
      faculty/page.tsx
      admin/page.tsx
      super-admin/page.tsx
      projects/page.tsx
      notifications/page.tsx
      workspace/page.tsx
    api/
      auth/
      projects/
      users/
      chat/
      notifications/
      ratings/
      recommendations/
      tenants/
      seed/
      crud/
      rbac/
      health/
  components/
    Navbar.tsx
    AuthActions.tsx
    dashboard-shell.tsx
    RoleNav.tsx
    ui.tsx
    seed-demo-button.tsx
  lib/
    db.ts
    models.ts
    api-auth.ts
    security-api.ts
    server-auth.ts
    dashboard-guards.ts
    rbac.ts
    crud-config.ts
    validators.ts
    tenant-db.ts
```

## 4. Frontend Route Map (Kaun sa page kya karta hai)

### Public Pages
- `/` (Home)
  - File: `src/app/page.tsx`
  - Kaam: landing page with Navbar, Hero, Features, Footer

- `/login`
  - File: `src/app/login/page.tsx`
  - Kaam: email/password login form, successful auth par `/dashboard` redirect

### Dashboard Pages
- `/dashboard` 
  - File: `src/app/dashboard/page.tsx`
  - Kaam: role-aware overview, stats cards, workflow shortcuts

- `/dashboard/student`
  - File: `src/app/dashboard/student/page.tsx`
  - Kaam: student hub, recommendations and skill growth style layout

- `/dashboard/faculty`
  - File: `src/app/dashboard/faculty/page.tsx`
  - Kaam: faculty metrics (teams/tasks/research/ratings), quick actions
  - Guard: faculty, college_admin, super_admin

- `/dashboard/admin`
  - File: `src/app/dashboard/admin/page.tsx`
  - Kaam: college admin control center
  - Guard: college_admin, super_admin

- `/dashboard/super-admin`
  - File: `src/app/dashboard/super-admin/page.tsx`
  - Kaam: global stats, tenant/user/report controls, demo seed trigger
  - Guard: super_admin

- `/dashboard/projects`
  - File: `src/app/dashboard/projects/page.tsx`
  - Kaam: project workspace placeholder/entry

- `/dashboard/notifications`
  - File: `src/app/dashboard/notifications/page.tsx`
  - Kaam: notification stream UI placeholder

- `/dashboard/workspace`
  - File: `src/app/dashboard/workspace/page.tsx`
  - Kaam: unified CRUD studio (resource picker + list/create/update/delete)

### Dashboard Wrapper
- `src/app/dashboard/layout.tsx`
  - Kaam: auth required, unauthenticated user ko `/login` redirect
  - Shell: `DashboardShell` wrapper apply

## 5. API Route Map (Route + Method + Auth + Purpose)

## Auth APIs
- `/api/auth/login` - `POST`
  - Auth: public
  - Kaam: credentials verify, failedLoginCount handle, auth cookie set

- `/api/auth/register` - `POST`
  - Auth: public
  - Kaam: user register + profile create, admin roles self-register block

- `/api/auth/logout` - `POST`
  - Auth: logged-in
  - Kaam: auth cookie clear

- `/api/auth/me` - `GET`
  - Auth: logged-in
  - Kaam: current session user info return

- `/api/auth/forgot-password` - `POST`
  - Auth: public
  - Kaam: password reset token generate flow

- `/api/auth/reset-password` - `POST`
  - Auth: public (token-based)
  - Kaam: token validate karke new password set

- `/api/auth/update-password` - `POST`
  - Auth: logged-in
  - Kaam: current password check karke password update

- `/api/auth/[...nextauth]`
  - Auth framework integration route scaffold

## User/Profile APIs
- `/api/users` - `GET`
  - Auth roles: super_admin, college_admin, faculty
  - Kaam: tenant-scoped user list

- `/api/users/me` - `GET`
  - Auth: logged-in
  - Kaam: own user + profile bundle

- `/api/users/profile` - `PUT`
  - Auth: logged-in
  - Kaam: own profile update (skills/bio/links etc.)

## Project APIs
- `/api/projects` - `GET`, `POST`
  - Auth: logged-in
  - Kaam: list tenant projects / create project

- `/api/projects/[id]` - `GET`, `PUT`, `DELETE`
  - Auth: logged-in
  - Kaam: single project view/update/delete with tenant and ownership checks

- `/api/projects/[id]/apply` - `POST`
  - Auth: logged-in
  - Kaam: project application create/upsert + notification

- `/api/projects/[id]/accept` - `POST`
  - Auth: logged-in
  - Kaam: project owner applicant accept

## Chat APIs
- `/api/chat/rooms` - `GET`, `POST`
  - Auth: logged-in
  - Kaam: rooms list/create/join (tenant scoped)

- `/api/chat/[roomId]` - `GET`
  - Auth: logged-in
  - Kaam: room messages fetch with participant membership check

- `/api/chat/send` - `POST`
  - Auth: logged-in
  - Kaam: message send + participant notifications + realtime emit

## Notifications APIs
- `/api/notifications` - `GET`, `PUT`
  - Auth: logged-in
  - Kaam: notification list + mark read (selected IDs ya all)

## Ratings & Recommendations
- `/api/ratings` - `POST`
  - Auth: logged-in
  - Kaam: teammate/student rating submit

- `/api/recommendations` - `POST`
  - Auth: logged-in
  - Kaam: AI recommendation score generation

## Tenant/Admin APIs
- `/api/tenants` - `GET`, `POST`
  - Auth roles: super_admin
  - Kaam: tenant list/create

- `/api/rbac/matrix` - `GET`
  - Auth roles: super_admin, college_admin, faculty
  - Kaam: centralized RBAC permission matrix return

- `/api/seed` - `POST`
  - Auth roles: super_admin
  - Kaam: demo seed refresh (users/projects/rooms)

## Generic CRUD APIs
- `/api/crud/[resource]` - `GET`, `POST`
- `/api/crud/[resource]/[id]` - `GET`, `PUT`, `DELETE`
  - Auth: logged-in
  - Kaam: 15 resources ke liye single RBAC-driven CRUD layer
  - Resources: users, profiles, skills, projects, applications, teams, tasks, rooms, messages, ratings, notifications, events, tenants, departments, reports

## System API
- `/api/health` - `GET`
  - Auth: public
  - Kaam: service health status

## 6. Core Backend Modules (Important files)

- `src/lib/db.ts`
  - MongoDB connection singleton, `MONGODB_URI` required

- `src/lib/models.ts`
  - All Mongoose schemas:
  - Tenant, User, Profile, Skill, Department, Project, Team, Application, Task, Room, Message, Rating, Review, Notification, AuditLog, Report, Event, Recommendation

- `src/lib/security-api.ts`
  - token create/verify, auth cookie set/clear, rate-limit, sanitize, password reset token helpers

- `src/lib/api-auth.ts`
  - API guard function `requireApiAuth`, role allow-list checks

- `src/lib/server-auth.ts`
  - server-side auth context extractor from cookie

- `src/lib/dashboard-guards.ts`
  - dashboard role guard + redirect logic

- `src/lib/rbac.ts`
  - role-resource-action-scope matrix (none/own/tenant/global)

- `src/lib/crud-config.ts`
  - generic CRUD resource-to-model mapping, search fields, owner field config

- `src/lib/validators.ts`
  - Zod schemas for register/login/project/chat/rating/password flows etc.

- `src/lib/tenant-db.ts`
  - tenant resolution by id/slug/subdomain with fallback tenant

## 7. UI/Navigation Components (Important)

- `src/components/dashboard-shell.tsx`
  - dashboard layout with sidebar + content panel

- `src/components/RoleNav.tsx`
  - role-based sidebar links (fetches `/api/auth/me`)

- `src/components/AuthActions.tsx`
  - login/logout session-aware buttons

- `src/components/Navbar.tsx`
  - public top navigation + auth action

- `src/components/ui.tsx`
  - shared primitives: Button, Card, Badge, SectionTitle, StatCard

- `src/components/seed-demo-button.tsx`
  - super admin demo data refresh trigger

## 8. Security, Tenanting and RBAC Notes

- Student admin routes access nahi kar sakta
- College admin mostly tenant-level control tak limited
- Super admin global access rakhta hai
- Tenant isolation by `tenantId` filters + token-based auth context
- Rate limiting auth endpoints par active hai
- Input sanitization key text fields par apply hota hai

## 9. Runtime / Environment Notes

- Required env:
  - `MONGODB_URI`
  - `NEXTAUTH_SECRET` (long)

- Build output separation:
  - dev: `.next-dev`
  - prod: `.next-prod`
  - Purpose: stale chunk collision avoid

- Seed command:
  - `npm run seed`
  - Current seeded admins:
    - `admin@campusnexus.dev`
    - `college.admin@campusnexus.dev`
    - `college.admin2@campusnexus.dev`
  - default password: `Password123!`

## 10. Current Project Status Snapshot
- Multi-tenant RBAC foundation implemented
- Role dashboards available
- Generic enterprise CRUD API layer available
- Auth + password lifecycle routes present
- Realtime/chat/notifications baseline implemented
- Seedable demo data and admin accounts available

---

Agar aap chaho to next version me isi report ka v2 generate kar sakte hain jisme:
- endpoint request/response examples
- role-wise test cases
- Postman collection mapping
- DB ER diagram style documentation
