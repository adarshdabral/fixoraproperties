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

### `GET /properties` (public, `optionalAuth`)
Query params validated by `propertySearchSchema`: `q, city, state, category,
listingType, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea,
constructionStatus, negotiable, featured, page, limit, sort`. Only ever
queries `status: "published"`. Returns `PaginatedResult<PublicPropertyDTO>`.

### `GET /properties/slug/:slug` (public)
Single published property by slug, `PublicPropertyDTO`. 404s for any
non-published status — a pending/rejected/draft property is invisible to
the public even if you know its slug.

### `POST /properties` (permission: `PROPERTIES_CREATE` — SELLER)
Creates a `status: "draft"` property owned by `req.user.id` (never a
client-supplied `sellerId`).

### `GET /properties/mine` (role: SELLER)
The caller's own properties in every status, `SellerPropertyDTO[]`.

### `POST /properties/:id/submit` (role: SELLER, ownership enforced)
`draft`/`rejected` → `pending_review`.

### `GET /properties/:id` (auth required)
Owner, or ADMIN/SUPER_ADMIN/BROKER — anyone else gets `403`.

### `PATCH /properties/:id` (permission: `PROPERTIES_EDIT`, ownership enforced for non-staff)
Editing a `published` listing resets it to `pending_review` (documented
assumption — see `property.service.ts`). ADMIN/SUPER_ADMIN bypass both the
ownership check and the editable-status restriction.

### `GET /properties/admin/all?status=` (permission: `PROPERTIES_APPROVE`)
Moderation queue, `SellerPropertyDTO[]` (reused as `AdminPropertyDTO`).

### `PATCH /properties/:id/approve` / `/reject` (permission: `PROPERTIES_APPROVE`)
Only valid from `pending_review`. Reject requires a `reason` in the body.
Both record an audit entry (`PROPERTY_APPROVED` / `PROPERTY_REJECTED`).

### `PATCH /properties/:id/feature` / `/status` (permission: `PROPERTIES_EDIT`)
Toggle `featured`, or set lifecycle status to `sold`/`inactive`/`published`.

### `DELETE /properties/:id` (permission: `PROPERTIES_DELETE` — ADMIN/SUPER_ADMIN only)
Sellers cannot delete their own listings by design (not in their permission set).

**Verified via smoke test (2026-09-12):** full lifecycle draft → submit →
moderation queue → approve → appears in public search; Seller B editing
Seller A's property → `403`; unpublished properties absent from
`/properties` search results.

## Planned (mounted in `src/routes/index.ts` as each module lands)

```
/search           (currently folded into GET /properties — split out if a
                   dedicated search service/index, e.g. Atlas Search, is
                   introduced later per docs/ARCHITECTURE.md)
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
