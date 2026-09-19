# Fixora Properties

A direct property marketplace for buyers and sellers, with enquiries reviewed
by an admin team and a transparent, admin-configurable platform fee added to
the seller's ask price for buyer-facing display. See
[docs/SECURITY.md](docs/SECURITY.md) for the seller-contact-protection rule
and how it's enforced, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for
the full system design and current build status.

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI, Framer Motion, React Hook Form + Zod, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB
- **Auth**: JWT in httpOnly cookies, bcrypt, centralized RBAC

## Repo layout

`backend/` and `frontend/` are **independent projects** — each has its own
`package.json`, its own dependencies, and its own copy of the shared
types/validation code (`*/src/shared` or `*/lib/shared`, kept in sync by
hand since there's no shared package between them). Neither folder depends
on the other or on anything outside itself, so each deploys on its own:

```
backend/     Express REST API — deploy this folder on Render (or any Node host)
  src/
    shared/  Local copy of roles, permissions, DTOs, Zod schemas
frontend/    Next.js app — public site + buyer/seller/admin dashboards — deploy this folder on Vercel
  lib/shared/  Local copy of roles, permissions, DTOs, Zod schemas
docs/        Architecture, database, API, AI, WhatsApp, security, deployment docs
```

If you change a role, permission, DTO shape, or Zod schema, update it in
**both** `backend/src/shared` and `frontend/lib/shared` — they must stay
identical. This trade-off (duplication instead of a shared package) is what
makes each folder deployable on its own with zero monorepo configuration on
either platform.

## Local setup

Each folder is set up and run independently.

```bash
# Backend
cd backend
cp .env.example .env
# fill in MONGODB_URI (a local `mongodb://localhost:27017/fixora_dev` works),
# JWT_ACCESS_SECRET, JWT_REFRESH_SECRET at minimum — everything else is optional.
npm install
npm run dev        # http://localhost:4000
npm run seed        # optional: seed a buyer/seller/admin/super-admin account

# Frontend (separate terminal)
cd frontend
cp .env.example .env.local
# fill in NEXT_PUBLIC_API_URL (http://localhost:4000/api/v1 for local dev)
npm install
npm run dev        # http://localhost:3000
```

A root `package.json` offers convenience wrappers (`npm run dev:backend`,
`npm run dev:frontend`, etc.) that just shell out to each folder via
`--prefix` — it installs nothing itself and isn't required.

## Deploying

- **Backend → Render**: point Render at the `backend/` folder (root directory
  = `backend`). Build command `npm install && npm run build`, start command
  `npm start`. Set the env vars from `backend/.env.example` in Render's
  dashboard.
- **Frontend → Vercel**: point Vercel at the `frontend/` folder (root
  directory = `frontend`). Vercel auto-detects Next.js — no custom build
  command needed. Set `NEXT_PUBLIC_API_URL` (and any other vars from
  `frontend/.env.example`) to your deployed backend's URL.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

## Current status

Foundation, auth, RBAC, property listings/search/moderation, enquiries/leads
(admin-managed), shortlists, and the admin dashboard (including the platform
fee setting) are implemented and smoke-tested. The AI assistant and WhatsApp
handoff are in progress — see the status table in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#status-living-document--updated-as-modules-land).
