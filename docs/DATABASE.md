# Fixora Properties — Database

MongoDB via Mongoose. One database per environment (`fixora_dev`,
`fixora_test`, production URI from `MONGODB_URI`).

## Collections

| Collection | Status | Notes |
|---|---|---|
| `users` | ✅ implemented | Single collection for all roles (`BUYER`/`SELLER`/`BROKER`/`ADMIN`/`SUPER_ADMIN`), discriminated by `role`. Broker-specific fields live in an embedded `brokerProfile` subdocument. `passwordHash` has `select: false` so it's never returned unless explicitly requested. |
| `audit_logs` | ✅ implemented | Append-only. Indexed on `action`, `(resourceType, resourceId)`, and `createdAt` (descending, for the admin audit log view). |
| `properties` | 🚧 next | See §61 of the product spec for the full field list (location, price, specifications, media, status lifecycle). Planned indexes: compound on `(status, category, "location.city")` for the public search path, plus `price.amount`, `"specifications.bedrooms"`, and a text index on `title`/`description` for free-text search. |
| `shortlists` | 🚧 planned | `(buyerId, propertyId)` unique compound index to prevent duplicates. |
| `inquiries` | 🚧 planned | `buyerId`, `propertyId`, `leadId`, `assignedTo`. |
| `leads` | 🚧 planned | `buyerId`, `propertyId`, `assignedTo`, `status`, `source`. Indexed on `assignedTo` + `status` for the broker pipeline view. |
| `negotiations` | 🚧 planned | `leadId`, `propertyId`, `buyerId`, `sellerId`, `brokerId`. |
| `transactions` | 🚧 planned | `propertyId`, `buyerId`, `sellerId`, `leadId`, `brokerId`, commission fields. |
| `commissions` | 🚧 planned | Denormalized commission ledger keyed by `transactionId` for reporting, separate from the commission fields embedded on `Transaction`. |
| `ai_conversations` / `ai_messages` | 🚧 planned (Phase 3) | Conversation + message history for the AI assistant, including tool-call records. |
| `notifications` | 🚧 planned | In-app notifications, extensible to email/WhatsApp/SMS/push per `NOTIFICATION_TYPES`. |
| `property_views` | 🚧 planned | Analytics event log — property views, shortlist adds, AI clicks, WhatsApp clicks. |
| `subscriptions` | 🚧 future scope | Not implemented in the initial release (see §42 of the product spec) — architecture should leave room for `Subscription`/`UserPlan`/`FeatureEntitlement` without building them now. |

## Indexing philosophy

Index the fields that are actually filtered/sorted on in the search and
dashboard queries (see the table above), not every field. Re-evaluate with
`.explain()` once real query patterns exist rather than guessing upfront.

## Migrations

No migration framework yet — schema changes during Phase 1 are additive
(new optional fields). Introduce a migration tool (e.g. `migrate-mongo`)
before the first schema change that requires backfilling existing
documents.
