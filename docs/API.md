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

### `GET /users?role=&search=` (permission: `USERS_VIEW` — ADMIN/SUPER_ADMIN)
`search` matches name or email (case-insensitive substring) — this is the
lookup the admin "assign role" UI uses; there's no separate username field,
email is the unique login identifier.

### `PATCH /users/:id/status` (permission: `USERS_MANAGE`)
Body: `{ isActive }`. Activates/deactivates an account; records
`USER_DEACTIVATED` audit entry.

### `PATCH /users/:id/role` (permission: `USERS_MANAGE`)
Body: `{ role }`. `USERS_MANAGE` (ADMIN + SUPER_ADMIN) lets you move a user
between `BUYER`/`SELLER`/`BROKER`. Touching the `ADMIN`/`SUPER_ADMIN` tier
— either as the new role or the target's current role — requires
`ADMINS_MANAGE` (SUPER_ADMIN only); enforced in `user.service.ts`, not just
the route, so it can't be bypassed. Self-role-change is blocked outright
(400) to avoid accidental lockout. Records a `ROLE_CHANGED` audit entry
with `{ from, to }`.

### `POST /auth/forgot-password` / `POST /auth/reset-password`
Always returns the same success message regardless of whether the email
exists (prevents account enumeration). The reset token is a random 32-byte
value; only its SHA-256 hash is persisted (`resetPasswordTokenHash`,
`resetPasswordExpiresAt`, both `select: false`), expires in 1 hour, and is
single-use. Successful reset bumps `tokenVersion`, invalidating every
outstanding session. Delivery goes through `utils/email.ts`, which logs
the reset link instead of sending when `RESEND_API_KEY` isn't configured
(`integrations.email` is `false`) — verified in development via the
server log.

**Verified via smoke test (2026-09-12):** ADMIN can promote a BUYER to
BROKER but gets `403` promoting to `SUPER_ADMIN`; ADMIN changing their own
role gets `400`; SUPER_ADMIN can promote across any tier. Full forgot/reset
cycle: token logged in dev → reset succeeds → old password rejected → new
password works → reusing the same token fails.

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

### `POST /shortlists/:propertyId` / `DELETE /shortlists/:propertyId` (role: BUYER)
Add/remove a published property. Duplicate adds are rejected with `409`
(unique compound index on `(buyerId, propertyId)`).

### `GET /shortlists` (role: BUYER)
The caller's shortlisted properties, `PublicPropertyDTO[]`.

### `POST /inquiries` (role: BUYER)
Body: `{ propertyId, message }`. This is the controlled-communication entry
point: it creates a `Lead` (which resolves broker assignment via
`assignBroker()`), then an `Inquiry` referencing it. Response message is
literally "Your enquiry has been received by Fixora" — never a seller
contact detail. 404s if the property isn't published.

### `GET /inquiries/mine` / `GET /inquiries/mine/:id` (role: BUYER)
Own inquiries only — ownership checked against `req.user.id`, not a
client-supplied id.

### `GET /inquiries/assigned` (role: BROKER)
Inquiries whose linked lead is assigned to the caller.

### `GET /inquiries` (permission: `INQUIRIES_VIEW`, role: ADMIN/SUPER_ADMIN)
All inquiries.

### `GET /leads/mine` (role: BROKER)
Leads assigned to the caller. A broker requesting another broker's lead by
id elsewhere (`getOwnedLead`) gets `403`, not the lead.

### `GET /leads?status=&assignedTo=` (permission: `LEADS_VIEW` + role ADMIN/SUPER_ADMIN)
All leads — deliberately gated to staff even though `BROKER` also holds
`LEADS_VIEW` in the permission map (that permission covers a broker's own
`/leads/mine`, not the cross-broker list).

### `PATCH /leads/:id/status` / `POST /leads/:id/notes` (permission: `LEADS_EDIT`)
Owning broker or staff.

### `PATCH /leads/:id/assign` (permission: `LEADS_ASSIGN` — ADMIN/SUPER_ADMIN)
Manual override of `LeadAssignmentService`'s automatic assignment; records
a `LEAD_REASSIGNED` audit entry with the previous and new broker.

**Verified via smoke test (2026-09-12):** buyer enquiry → lead auto-created
→ assigned to the (only) active broker → visible in that broker's
`/leads/mine` and `/inquiries/assigned` — with no seller contact field
anywhere in any response along the way.

## Planned (mounted in `src/routes/index.ts` as each module lands)

```
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
