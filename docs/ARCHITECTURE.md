# Fixora Properties — Architecture

## Overview

Fixora Properties is a commission-based real-estate brokerage platform. Buyers
and sellers never communicate directly — every enquiry is routed through
Fixora's authorized representatives (modeled as `BROKER` accounts). See
[SECURITY.md](./SECURITY.md) for how this is enforced server-side.

## Monorepo layout

```
fixora-properties/            (repo root — this directory)
├── apps/
│   ├── web/                  Next.js 15 (App Router) — public site + all dashboards
│   └── api/                  Express + TypeScript REST API
├── packages/
│   ├── types/                 Shared enums, roles, permissions, API envelope types
│   ├── validation/             Shared Zod schemas (used by both API and web forms)
│   └── config/                 Shared constants (cookie names, pagination defaults)
├── docs/                       This documentation set
└── scripts/                    One-off / operational scripts
```

npm workspaces wire these together; `@fixora/types` and `@fixora/validation`
are built to `dist/` and consumed by both apps so the request/response shape
and the validation rules are defined exactly once.

## Request flow (backend)

```
Route → validate(zodSchema) → requireAuth() → requirePermission()/requireOwnership()
      → Controller → Service → Mongoose Model → MongoDB
```

- **Routes** (`*.routes.ts`) wire middleware and map HTTP verbs to controllers.
- **Controllers** (`*.controller.ts`) parse the already-validated request and
  call services. They contain no business logic and no direct Mongoose calls.
- **Services** (`*.service.ts`) contain business logic and are the only layer
  that talks to Mongoose models. This is what makes rules like broker
  assignment or commission calculation testable in isolation.
- **DTOs** (`*.dto.ts`) shape what leaves the API for a given role — this is
  where seller contact protection is enforced (see SECURITY.md).

## Status (living document — updated as modules land)

| Module | Status |
|---|---|
| Monorepo scaffold, shared packages | ✅ done |
| Env validation, logging, error handling | ✅ done |
| Auth (register/login/refresh/logout, JWT in httpOnly cookies) | ✅ done |
| RBAC middleware (`requireAuth`, `requireRole`, `requirePermission`, `requireOwnership`) | ✅ done |
| Audit logging infrastructure | ✅ done (auth events wired; more actions wired as those modules land) |
| Property CRUD + moderation + search | ✅ done (backend) |
| Shortlists / inquiries | ✅ done (backend) |
| Leads / broker assignment | ✅ done (backend) |
| Negotiations / transactions / commissions | 🚧 planned |
| AI assistant | 🚧 planned (Phase 3 per client roadmap) |
| WhatsApp handoff | 🚧 planned (Phase 2 per client roadmap) |
| Public website UI (home, properties list/detail, about, contact, sell) | ✅ done |
| Auth UI (register with mandatory role select, login, forgot/reset password) | ✅ done |
| Buyer dashboard (overview, shortlist, enquiries) | ✅ done, minimal |
| Seller dashboard (property list, create-listing form, submit for review) | ✅ done, minimal |
| Broker dashboard (assigned leads, status updates) | ✅ done, minimal |
| Admin dashboard (KPIs, user search + role assignment, property moderation) | ✅ done, minimal |
| SEO (metadata, OpenGraph, JSON-LD, sitemap, robots) | ✅ done for implemented pages |

"Minimal" above means the core loop works end-to-end against the real API
(no mock data) but hasn't had a full visual-polish pass — see §62-64 of the
product spec for the bar to raise these to before calling Phase 1 done.

## Key design decisions

- **Roles vs. permissions**: authorization checks always go through the
  centralized `ROLE_PERMISSIONS` map in `packages/types/src/permissions.ts`,
  never ad-hoc role string comparisons scattered across routes. See
  `requirePermission()` in `apps/api/src/middleware/permission.ts`.
- **Ownership is always re-derived server-side.** `requireOwnership()` takes a
  function that loads the resource from the database and compares its owner
  field to `req.user.id` — it never trusts a client-supplied `ownerId`.
- **tokenVersion-based session revocation.** Every `User` has a `tokenVersion`
  counter embedded in both access and refresh tokens. `requireAuth()`
  re-checks the user against the database on every request, so deactivating
  an account or bumping `tokenVersion` (password change, "logout everywhere")
  takes effect immediately rather than waiting for token expiry.
- **Optional third-party integrations degrade gracefully.** `config/env.ts`
  computes an `integrations` flag object (`ai`, `whatsapp`, `media`, `email`,
  `redis`) from which credentials are present. Services that depend on these
  check the flag and return a clear "not configured" response instead of
  crashing the whole API when a credential is missing in development.
- **Next.js 15, not 14 or 16.** create-next-app's `latest` tag currently
  installs Next 16 (very recently released, API surface not yet reflected in
  training data). Next 14 never received backports for several
  since-disclosed advisories (including a critical Image Optimization RCE).
  Next 15.5.25 (the maintained "backport" release line) has the security
  fixes and stable, well-documented App Router APIs — the one relevant
  breaking change from 14 is that route/page `params` and `searchParams` are
  now `Promise`s, which all route handlers in this codebase account for.

## Frontend architecture notes

- **Design system**: Tailwind tokens in `tailwind.config.ts` (`ink`/`paper`/`gold`/`sage`/`line`
  palette), `Fraunces` (display serif) + `Inter` (body) via `next/font/google`. Hand-rolled
  UI primitives in `components/ui/*` (Button, Input, Select, Dialog, Toast, etc.) built on
  Radix primitives + `class-variance-authority` — the same pattern shadcn/ui uses, without the
  CLI, so there's no vendored copy to keep in sync.
- **API client split**: `lib/api.ts` (client components, `credentials: "include"` so the
  httpOnly auth cookies travel with the request) vs `lib/api-server.ts` (Server Components,
  forwards the incoming request's cookies via `next/headers`). Both share parsing/error
  handling from `lib/api-core.ts`. The frontend never reads or stores a JWT itself.
- **`services/*.service.ts`** wrap the API client per domain (auth, properties, buyer,
  broker, admin) so components call a typed function, not a raw path string.
- **Auth state**: `hooks/use-auth.tsx` is a context provider that calls `GET /auth/me` on
  mount and exposes `login`/`register`/`logout`. `components/auth/require-role.tsx` gates
  dashboard routes client-side for UX (avoids flashing a page the user can't use) — this is
  **not** a security boundary; the API re-checks every request regardless (see SECURITY.md).
- **Route groups not yet split**: `/dashboard` (buyer), `/seller`, `/broker`, `/admin` each
  have their own `layout.tsx` wrapping children in `RequireRole`. They currently share the
  root layout's Navbar/Footer; revisit if dashboards want a fully separate chrome later.

See also: [DATABASE.md](./DATABASE.md), [API.md](./API.md), [AI.md](./AI.md),
[WHATSAPP.md](./WHATSAPP.md), [SECURITY.md](./SECURITY.md),
[DEPLOYMENT.md](./DEPLOYMENT.md).
