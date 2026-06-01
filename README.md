# Flavr Recipe App

Production-ready recipe app with Nuxt frontend, backend API proxy, Supabase auth/data, and AI-assisted workflows.

Primary status and architecture docs:
- ARCHITECTURE_STATUS.md
- DOCS_INDEX.md

## Current Stack

- Frontend: Nuxt 4 SPA (frontend/)
- Backend: Express + Hono API proxy (backend/)
- Database/Auth: Supabase
- AI: Claude via backend proxy, Pollinations image generation
- Hosting: Cloudflare Pages (frontend), Railway (backend)
- Testing: Playwright E2E (frontend), Vitest (backend)

## Main Features

- Recipes CRUD (create, edit, delete, detail)
- AI chef suggestions from ingredients
- Photo analysis for ingredient extraction
- Bring integration (list export)
- Google OAuth + email/password login
- PWA installability and offline support
- Claude chat recipe import page (/import)

## Project Structure

```text
rezepte-project/
|- frontend/                # Nuxt app
|- backend/                 # API proxy and integrations
|- supabase/                # SQL, functions, auth-related assets
|- .github/workflows/       # CI workflows
|- ARCHITECTURE_STATUS.md   # Canonical architecture + priorities
|- DOCS_INDEX.md            # Mobile-friendly docs entry point
```

## Local Development

Prerequisites:
- Node.js 20+
- npm

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: http://localhost:3002

Backend:

```bash
cd backend
npm install
npm run dev
```

Backend default URL: http://localhost:3000

Health check:

```bash
curl http://localhost:3000/health
```

## Environment Variables

Frontend (public runtime):
- NUXT_PUBLIC_BACKEND_URL
- NUXT_PUBLIC_SUPABASE_URL
- NUXT_PUBLIC_SUPABASE_KEY
- NUXT_PUBLIC_SENTRY_DSN (optional)

Backend (server secrets/runtime):
- CLAUDE_API_KEY
- NODE_ENV
- SENTRY_DSN_BACKEND (optional)
- USE_MOCK_AI (optional; true for mock mode)

Templates and examples:
- frontend/.env.example
- backend/.env.example

## Testing

Frontend E2E (Playwright):

```bash
cd frontend
npm run test:e2e
npm run test:e2e:ui
```

Backend tests (Vitest):

```bash
cd backend
npm test
npm run test:coverage
```

## Deployment

- Frontend production target: Cloudflare Pages
- Backend production target: Railway

Reference docs:
- DEPLOYMENT.md
- DEPLOYMENT_GUIDE.md
- DEPLOY_NOW.md
- CLOUDFLARE_MIGRATION.md

## Documentation Policy

- Canonical source for architecture and priorities: ARCHITECTURE_STATUS.md
- Fast navigation, especially on mobile: DOCS_INDEX.md
- Historical docs for context only:
	- PROJECT_STATUS.md
	- STATUS.md
	- NEXT_STEPS.md
