# Fixora Properties — Security

## The one rule that overrides everything else

**Buyers must never receive a seller's direct contact number.** Every
enquiry is routed through Fixora's authorized representatives (`BROKER`
accounts). This is enforced by never sending seller contact fields to
buyer-facing API responses — not by hiding them in the UI.

### How it's enforced

- Every module that returns user/property data goes through a `*.dto.ts`
  file that whitelists fields per audience, e.g. `user.dto.ts`:
  `PublicUserDTO` (id, name, role only) vs `PrivateUserDTO` (adds email,
  phone — only ever returned for the authenticated user themself, or to
  ADMIN/SUPER_ADMIN/BROKER contexts that legitimately need it).
  `PublicPropertyDTO` / `BuyerPropertyDTO` / `SellerPropertyDTO` /
  `BrokerPropertyDTO` / `AdminPropertyDTO` follow the same pattern as the
  property module lands.
- Controllers never do `res.json(mongooseDoc)` — they always map through a
  DTO function first, so a field can't leak by accident when a schema gains
  a new field later.

## Authentication

- Passwords hashed with bcrypt (cost factor 12), never stored or logged.
- Access + refresh tokens are JWTs delivered as `httpOnly`, `sameSite=lax`
  cookies (`apps/api/src/modules/auth/auth.cookies.ts`) — never exposed to
  JS, never stored in `localStorage`. The refresh cookie is scoped to
  `/api/v1/auth` only.
- `requireAuth()` re-verifies the user against the database on **every**
  request (active status + `tokenVersion`), not just the token signature —
  so deactivation and forced logout take effect immediately.
- Auth endpoints are rate-limited (`authRateLimit`: 20 requests / 15 min).

## Authorization (RBAC)

- Never trust the frontend. Every protected API route re-checks
  authorization server-side via `requireAuth()` + `requirePermission()` /
  `requireRole()` / `requireOwnership()`. Frontend route guards exist only
  as a UX convenience.
- Permissions are centralized in `packages/types/src/permissions.ts`
  (`ROLE_PERMISSIONS`) — this is the single source of truth. Do not add
  role checks anywhere else.
- `SUPER_ADMIN` cannot be created through public registration
  (`PUBLICLY_REGISTERABLE_ROLES = ["BUYER", "SELLER"]`, enforced by the Zod
  schema on `/auth/register`, not just the UI).
- Ownership is always re-derived server-side via `requireOwnership()`,
  which loads the resource from the database and compares its owner field
  to `req.user.id`. Client-supplied `ownerId`/`sellerId`/`assignedTo`
  fields in a request body are never trusted for authorization decisions.

## Input handling

- Every request body/query is parsed through a Zod schema
  (`packages/validation`) via the `validate()` middleware before it reaches
  a controller. Unvalidated input never reaches business logic.
- Mongoose schemas provide a second layer of type/enum enforcement at the
  database boundary.
- `helmet()` sets secure headers; `cors()` is locked to `WEB_APP_URL` with
  credentials; body size is capped at 1mb; `express-rate-limit` protects
  both general API traffic and auth/AI endpoints specifically.

## Error handling

- `errorHandler` (central Express error middleware) never leaks stack
  traces, Mongo driver errors, or internal messages to the client in
  production — only in `NODE_ENV=development`. Zod validation errors are
  translated into a clean `{ path, message }[]` list.

## Audit logging

- `recordAudit()` (`apps/api/src/modules/audit/audit.service.ts`) writes to
  the `audit_logs` collection for sensitive actions (see
  `AUDIT_ACTIONS` in `packages/types`). Currently wired: `LOGIN`, `LOGOUT`,
  `USER_DEACTIVATED`. Wired incrementally as each module
  (property approval, lead assignment, negotiations, transactions,
  commissions, admin actions) lands.
- Audit recording failures are caught and logged — they must never break
  the business operation that triggered them.

## Verified via smoke test (2026-09-12)

- ✅ Registering with `"role": "SUPER_ADMIN"` is rejected by the Zod schema
  (`Invalid enum value. Expected 'BUYER' | 'SELLER'`).
- ✅ Unauthenticated request to an admin-only route → `401`.
- ✅ Authenticated buyer request to an admin-only route → `403`.

## Planned test coverage (as each module lands)

Per the client's critical-test list (docs/API.md will track endpoint-level
detail as each module ships):

- Seller A cannot read or modify Seller B's property.
- Buyer cannot read another buyer's inquiry, or any seller phone/email field.
- Broker cannot read another broker's lead.
- Client-supplied `ownerId`/`assignedTo` in a request body never changes
  authorization outcome.
- Direct calls to admin/broker APIs without the right role are rejected.

## Known accepted risk

`npm audit` currently flags a moderate/high PostCSS advisory bundled inside
Next.js's own build toolchain (`next/node_modules/postcss`). This affects
processing of attacker-supplied CSS/source maps at **build time**, not a
runtime HTTP-reachable path in this application (we don't accept arbitrary
CSS input), and the only available fix is a major, very-recently-released
Next 16 upgrade. Re-evaluate this trade-off before each production deploy —
see `npm audit --omit=dev`.
