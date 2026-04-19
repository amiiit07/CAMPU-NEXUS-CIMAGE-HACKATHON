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

## Getting started
1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies with `npm install`.
3. Run the app with `npm run dev`.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run seed`

## Architecture
The app is structured as a modular monolith with tenant-aware request handling, reusable UI primitives, and isolated service layers for auth, database access, realtime collaboration, and recommendations.
