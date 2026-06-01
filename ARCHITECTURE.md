# Flavr Architecture and Operations

Last updated: 2026-06-01

## 1. System Overview

Flavr consists of three runtime layers:

1. Frontend
- Platform: Cloudflare Pages
- Stack: Nuxt 4 SPA
- Public URL: https://flavr-nuxt.pages.dev
- Source path: frontend/

2. Backend API
- Platform: Render Web Service
- Stack: Node.js + Express + Hono
- Public URL: https://flavr-3m5v.onrender.com
- Source path: backend/

3. Data and Auth
- Platform: Supabase
- Services: Postgres, Auth, RLS

## 2. Runtime Responsibilities

Frontend handles:
- Routing and UI pages
- Authentication flows via Supabase
- Calls to backend API for AI, Bring, and image proxy features

Backend handles:
- Health endpoint
- Claude proxy endpoint
- Bring integration proxy endpoints
- Image proxy endpoint
- Error capture and API safeguards

Supabase handles:
- User authentication
- Persistent data storage
- Access control via RLS

## 3. API Endpoints

Base URL: https://flavr-3m5v.onrender.com

- GET /health
- POST /api/claude
- POST /api/image-proxy
- POST /api/bring/login
- POST /api/bring/lists
- POST /api/bring/items

## 4. Deployment Model

Frontend deployment:
- Trigger: Git push to main
- Builder: Cloudflare Pages (Git integration)
- Root directory: frontend
- Build command: npm run generate
- Output directory: .output/public

Backend deployment:
- Trigger: Render auto deploy from main and optional GitHub deploy hook
- Root directory: backend
- Build command: npm install && npm run build
- Start command: npm start

CI validation:
- GitHub Actions runs tests and frontend build validation on push to main
- Workflow files:
  - .github/workflows/e2e-tests.yml
  - .github/workflows/deploy.yml

## 5. Required Environment Variables

Cloudflare Pages:
- NUXT_PUBLIC_BACKEND_URL=https://flavr-3m5v.onrender.com
- NUXT_PUBLIC_SUPABASE_URL=<supabase-url>
- NUXT_PUBLIC_SUPABASE_KEY=<supabase-anon-key>
- NUXT_PUBLIC_SENTRY_DSN=<optional>

Render:
- NODE_ENV=production
- PORT=3000
- CLAUDE_API_KEY=<secret>
- SENTRY_DSN_BACKEND=<optional>
- USE_MOCK_AI=false

GitHub Actions Secrets:
- NUXT_PUBLIC_BACKEND_URL=https://flavr-3m5v.onrender.com
- NUXT_PUBLIC_SUPABASE_URL=<supabase-url>
- NUXT_PUBLIC_SUPABASE_KEY=<supabase-anon-key>
- SENTRY_DSN_FRONTEND=<optional>
- RENDER_DEPLOY_HOOK_URL=<optional>

## 6. Operational Checks

Production smoke checks:
- Frontend: curl -I https://flavr-nuxt.pages.dev
- Backend: curl -sS https://flavr-3m5v.onrender.com/health
- Auth route: https://flavr-nuxt.pages.dev/auth

Expected backend health response:
- status: ok

## 7. Security and Maintenance

- Keep all secrets out of git-tracked files.
- Rotate exposed keys immediately if ever pasted or leaked.
- Keep frontend and CI backend URL values aligned.
- Use this file as the only architecture and deployment source of truth.
