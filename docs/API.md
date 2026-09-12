# Fixora Properties — API

Base URL: `/api/v1`. All responses follow one envelope:

```json
{ "success": true, "data": { }, "message": "optional" }
{ "success": false, "error": { "code": "...", "message": "...", "details": "optional" } }
```

Auth is via `httpOnly` cookies (`fixora_at` / `fixora_rt`) set by the
`/auth` endpoints — the frontend never handles raw tokens. A `Bearer`
header is also accepted (for tooling/tests) as a fallback in
`middleware/auth.ts`.

## Implemented

### `POST /auth/register`
Body: `{ name, email, phone, password, role }` — `role` is restricted to
`BUYER` or `SELLER` by the Zod schema (`PUBLICLY_REGISTERABLE_ROLES`); any
other value is a `400 VALIDATION_ERROR`, not a silent downgrade. Sets auth
cookies on success.

### `POST /auth/login`
Body: `{ email, password }`. Rate-limited. Sets auth cookies.

### `POST /auth/refresh`
Reads the refresh cookie, rotates both tokens.

### `POST /auth/logout` (auth required)
Clears cookies, records a `LOGOUT` audit entry.

### `GET /auth/me` (auth required)
Returns the current user's `PrivateUserDTO`.

### `GET /users` (permission: `USERS_VIEW` — ADMIN/SUPER_ADMIN)
Optional `?role=` filter. Staff directory, not a public user search.

### `PATCH /users/:id/status` (permission: `USERS_MANAGE`)
Body: `{ isActive }`. Activates/deactivates an account; records
`USER_DEACTIVATED` audit entry.

## Planned (mounted in `src/routes/index.ts` as each module lands)

```
/properties       CRUD, moderation (approve/reject/feature/deactivate/mark-sold)
/search           Public property search — filters per §16 of the product spec
/shortlists       Add/remove/list — buyer-only, duplicate-prevented
/inquiries        Buyer creates, broker/admin manage; never exposes seller contact
/leads            Broker pipeline, admin assignment/reassignment
/negotiations     Broker-managed, tied to a lead
/transactions     Broker/admin-managed, drives commission calculation
/commissions      Admin-managed ledger
/ai               Chat endpoint — tool-calling into /search, /properties, /leads
/whatsapp         Webhook + outbound handoff to Vansh Kakkar / Dr. Neeraj Sengar
/notifications    In-app notification feed
/analytics        Admin/seller-facing aggregates
/admin            Cross-cutting admin operations not owned by a single module
/uploads          Cloudinary/S3-backed property media upload
```

Each will get its own section here (request/response shape, required
permission) as it's implemented, plus an OpenAPI/Swagger document served at
`/api/v1/docs` once enough surface area exists to make that useful (per
§57 of the product spec).
