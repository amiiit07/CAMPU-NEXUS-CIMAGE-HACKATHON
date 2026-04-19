# Campus Nexus

Campus Nexus is a federated, AI-powered, multi-tenant collaboration platform for colleges, students, faculty, startups, and innovators.

## What is included
- Next.js App Router with TypeScript
- Tailwind-based premium landing page and dashboards
- Tenant-aware middleware and auth scaffolding
- MongoDB/Mongoose data models
- Redis cache and queue helpers
- Socket.IO realtime scaffold
- Cloudinary and S3 upload helpers
- Seed data and deployment files
- Centralized RBAC matrix for Student, Faculty, College Admin, Super Admin
- Unified role-scoped CRUD APIs for core platform entities
- Password recovery and secure password update flows

## Getting started
1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies with `npm install`.
3. Run the app with `npm run dev`.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run seed`

## Enterprise RBAC and CRUD
- RBAC policy and scopes are defined in `src/lib/rbac.ts`.
- Generic CRUD API with role and tenant enforcement is in `src/app/api/crud/[resource]/route.ts` and `src/app/api/crud/[resource]/[id]/route.ts`.
- Full architecture blueprint is in `docs/enterprise-rbac-blueprint.md`.

### Role dashboards
- Student: `/dashboard/student`
- Faculty: `/dashboard/faculty`
- College Admin: `/dashboard/admin`
- Super Admin: `/dashboard/super-admin`
- Unified CRUD workspace: `/dashboard/workspace`

## Architecture
The app is structured as a modular monolith with tenant-aware request handling, reusable UI primitives, and isolated service layers for auth, database access, realtime collaboration, and recommendations.
