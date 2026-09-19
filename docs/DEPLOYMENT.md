# Fixora Properties — Deployment

## Target infrastructure

| Layer | Provider |
|---|---|
| Frontend (`frontend/`) | Vercel |
| Backend (`backend/`) | Render (or any Node host) |
| Database | MongoDB Atlas |
| Media storage | Cloudinary (or S3) |
| Cache | Redis (managed — Upstash/Redis Cloud/provider add-on) |

`backend/` and `frontend/` are independent projects (see the repo-layout
section in the root [README](../README.md)) — each is deployed as its own
service from its own folder, with no monorepo build step or shared-package
install required on either platform.

## Backend on Render

1. New Web Service → connect the repo → **Root Directory: `backend`**.
2. Build command: `npm install && npm run build`. Start command: `npm start`.
3. Set every variable from `backend/.env.example` in Render's environment
   settings — `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` at
   minimum (see `backend/src/config/env.ts` for the full validated schema;
   startup fails fast with a readable message if a required one is missing).
   `OPENAI_*`, `WHATSAPP_*`, `CLOUDINARY_*`, `RESEND_API_KEY`, `REDIS_URL`
   are optional — those integrations degrade to a clearly-logged disabled
   state rather than crashing the app.
4. Set `WEB_APP_URL` to your Vercel deployment's URL (exact origin, e.g.
   `https://fixora.vercel.app`) — this is the CORS allowlist, and it must be
   exact for authenticated requests to work at all.
5. Leave `COOKIE_DOMAIN` empty unless the frontend and backend later share a
   parent domain (see "Cookies across domains" below).
6. `NODE_ENV=production` — this also switches auth cookies to
   `Secure; SameSite=None`, required for them to survive a cross-site
   request from Vercel to Render at all (see below).

## Frontend on Vercel

1. New Project → connect the repo → **Root Directory: `frontend`**. Vercel
   auto-detects Next.js; no custom build command needed.
2. Set every variable from `frontend/.env.example` in Vercel's environment
   settings: `NEXT_PUBLIC_API_URL` pointed at the deployed backend's
   `/api/v1` base (e.g. `https://fixora-backend.onrender.com/api/v1`), and
   `NEXT_PUBLIC_SITE_URL` set to the frontend's own deployed URL.

## Cookies across domains (read this before deploying)

The API sets `httpOnly` auth cookies. Render's default URL
(`*.onrender.com`) and Vercel's default URL (`*.vercel.app`) are **different
sites**, not subdomains of one domain, which affects both cookie attributes
required to make auth work at all:

- **`SameSite`**: a cross-site `fetch`/XHR (the frontend calling the
  backend) only carries a cookie back when it's `SameSite=None; Secure`.
  `backend/src/modules/auth/auth.cookies.ts` already sets this
  automatically based on `NODE_ENV` — `None` in production, `Lax` for local
  dev (where `Secure` cookies wouldn't survive plain `http://localhost`
  anyway). This fails silently, not loudly, if it's ever wrong: login still
  returns a 200 and sets the cookie, every following request just 401s
  because the browser never sends it back.
- **`Domain`**: a cookie's `Domain` attribute must be the exact host that
  set it, or a true parent domain of it — anything else and the browser
  **rejects the cookie outright** (login silently does nothing). Leave
  `COOKIE_DOMAIN` empty for the default Render/Vercel URLs. Only set it
  (e.g. `.fixora.com`) once you've put both services under one custom
  parent domain (`app.fixora.com` for the frontend, `api.fixora.com` for
  the backend).

If you do move to a shared custom domain later, `SameSite=Lax` would work
again since the request becomes same-site — but there's no need to change
the code for that; `None; Secure` continues to work fine same-site too.

## Local development

See the root [README](../README.md#local-setup) — each folder is run with
its own `npm install` / `npm run dev`, no root install step.

## Build & release checklist

Run in each folder before deploying:

```bash
cd backend && npm run typecheck && npm run lint && npm run test && npm run build
cd frontend && npm run typecheck && npm run lint && npm run build
```

All must pass before a deploy. CI wiring (GitHub Actions or equivalent) is
not yet set up — add it once useful (e.g. one workflow per folder, triggered
on changes under that folder's path).
