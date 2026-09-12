# Fixora Properties

A commission-based real-estate brokerage platform. Buyers and sellers never
contact each other directly — every enquiry is routed through Fixora's
authorized representatives. See [docs/SECURITY.md](docs/SECURITY.md) for how
that rule is enforced, and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for
the full system design and current build status.

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI, Framer Motion, React Hook Form + Zod, TanStack Query
- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB
- **Auth**: JWT in httpOnly cookies, bcrypt, centralized RBAC

## Monorepo layout

```
apps/web           Next.js app — public site + buyer/seller/broker/admin dashboards
apps/api           Express REST API
packages/types      Shared roles, permissions, enums, API envelope types
packages/validation  Shared Zod schemas
packages/config      Shared constants (cookie names, pagination defaults)
docs/                Architecture, database, API, AI, WhatsApp, security, deployment docs
```

## Local setup

```bash
# 1. Environment
cp .env.example apps/api/.env
# fill in MONGODB_URI (a local `mongodb://localhost:27017/fixora_dev` works),
# JWT_ACCESS_SECRET, JWT_REFRESH_SECRET at minimum — everything else is optional.

# 2. Install
npm install

# 3. Build shared packages (required before the API/web will typecheck)
npm run build --workspace=packages/types
npm run build --workspace=packages/validation
npm run build --workspace=packages/config

# 4. Run
npm run dev:api    # http://localhost:4000
npm run dev:web    # http://localhost:3000
```

## Scripts

```bash
npm run typecheck   # both apps
npm run lint        # both apps
npm run test        # API test suite
npm run build       # full production build
npm run seed        # seed script (see apps/api/src/scripts/seed.ts once implemented)
```

## Current status

Foundation, auth, and RBAC are implemented and smoke-tested. Property
listings, search, the brokerage CRM (leads/negotiations/transactions/
commissions), WhatsApp handoff, the AI assistant, and all frontend UI are in
progress — see the status table in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#status-living-document--updated-as-modules-land).

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
