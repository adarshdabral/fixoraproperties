# Fixora Properties — Deployment

## Target infrastructure

| Layer | Provider |
|---|---|
| Frontend (`apps/web`) | Vercel |
| Backend (`apps/api`) | Railway / Render / AWS |
| Database | MongoDB Atlas |
| Media storage | Cloudinary (or S3) |
| Cache | Redis (managed — Upstash/Redis Cloud/provider add-on) |

## Environment variables

Copy `.env.example` at the repo root; the API reads its own `apps/api/.env`
(see `apps/api/src/config/env.ts` for the full validated schema — startup
fails fast with a readable message if a required variable is missing).
Required at minimum: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
Everything else (`OPENAI_*`, `WHATSAPP_*`, `CLOUDINARY_*`, `RESEND_API_KEY`,
`REDIS_URL`) is optional — those integrations degrade to a clearly-logged
disabled state rather than crashing the app (see `integrations` in
`config/env.ts`).

`apps/web` needs `NEXT_PUBLIC_API_URL` pointed at the deployed API's
`/api/v1` base, and `NEXT_PUBLIC_MAP_PROVIDER_KEY` if maps are enabled.

## Local development

```bash
cp .env.example apps/api/.env   # fill in MONGODB_URI + JWT secrets at minimum
npm install
npm run build --workspace=packages/types --workspace=packages/validation --workspace=packages/config
npm run dev:api     # http://localhost:4000
npm run dev:web     # http://localhost:3000
```

A local MongoDB works fine for development
(`MONGODB_URI=mongodb://localhost:27017/fixora_dev`); use Atlas for staging/prod.

## Build & release checklist

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

All four must pass before a deploy. CI wiring (GitHub Actions or
equivalent) is not yet set up — add it once the repository has a remote.

## Cookies across domains

The API sets `httpOnly` auth cookies scoped to `COOKIE_DOMAIN`. In
production, `apps/web` and `apps/api` should share a parent domain (e.g.
`fixora.com` / `api.fixora.com` with `COOKIE_DOMAIN=.fixora.com`) so the
cookie is sent on API requests from the frontend; if they end up on
unrelated domains, this needs revisiting (either a proxy/rewrite on the
frontend or a cross-site cookie policy change) before launch.
