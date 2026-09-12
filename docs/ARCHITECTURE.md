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
| Public website UI | 🚧 planned |
| Buyer/Seller/Broker/Admin dashboards | 🚧 planned |

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

See also: [DATABASE.md](./DATABASE.md), [API.md](./API.md), [AI.md](./AI.md),
[WHATSAPP.md](./WHATSAPP.md), [SECURITY.md](./SECURITY.md),
[DEPLOYMENT.md](./DEPLOYMENT.md).
