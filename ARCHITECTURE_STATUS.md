# Flavr Architecture Status

Last updated: 2026-05-31
Branch: nuxt_js
Goal of this document: single source of truth for current architecture and next work items.

See also: DOCS_INDEX.md for a mobile-friendly documentation entry point.

## 1) Executive Snapshot

- Project state: production running, core features implemented.
- Frontend: Nuxt 4 SPA, deployed on Cloudflare Pages.
- Backend: Express host + Hono API proxy, deployed on Railway.
- Data/Auth: Supabase (Postgres + Auth + RLS).
- AI: Claude API via backend proxy, image generation via Pollinations proxy.
- Integrations: Bring shopping list integration implemented.
- Testing: Playwright E2E suite exists and CI workflow is configured.

## 2) System Architecture

## 2.1 Runtime Components

1. Frontend (Nuxt SPA)
- Path: frontend/
- Important config: frontend/nuxt.config.ts
- Modules: @nuxtjs/supabase, @vite-pwa/nuxt
- Runtime public config:
  - NUXT_PUBLIC_BACKEND_URL
  - NUXT_PUBLIC_SENTRY_DSN
  - NUXT_PUBLIC_SUPABASE_URL
  - NUXT_PUBLIC_SUPABASE_KEY

2. Backend API Proxy (Express + Hono)
- Path: backend/
- Entry point: backend/src/index.ts
- Provides endpoints for:
  - Health
  - Claude proxy
  - Pollinations image proxy
  - Bring API proxy
- Includes:
  - CORS allowlist
  - in-memory rate limiting
  - Sentry error/performance capture

3. Supabase
- Auth: Google OAuth + email/password
- Data model guarded by RLS policies
- User metadata stores Bring auth/list selection data

4. External APIs
- Anthropic Claude Messages API
- Bring API
- Pollinations image API

## 2.2 Frontend Domain Structure

Main pages (frontend/pages):
- / (index)
- /recipes
- /recipe/[id]
- /ai
- /import (new: Claude Chat recipe import)
- /settings
- /auth

Main composables (frontend/composables):
- useRecipes.ts
- useAI.ts
- useBring.ts
- useImageGeneration.ts
- useCategories.ts

## 2.3 Backend Endpoint Map

From backend/src/index.ts:

- GET /health
  - Service health probe.

- POST /api/claude
  - Proxies Claude requests.
  - Applies in-memory IP-based rate limit (20 req/min).
  - Supports mock mode when no key or USE_MOCK_AI=true.

- POST /api/image-proxy
  - Fetches and returns allowed image resources.
  - URL allowlist currently includes image.pollinations.ai and fonts.googleapis.

- POST /api/bring/login
  - Bring login.

- POST /api/bring/lists
  - Fetch user shopping lists.

- POST /api/bring/items
  - Add recipe items to selected Bring list.

## 3) Data and Control Flows

## 3.1 Recipe + AI flow

1. User action in Nuxt page/composable.
2. Frontend calls backendUrl/api/claude.
3. Backend rate-limits and forwards to Claude.
4. Frontend parses JSON result and maps to recipe object.
5. Recipe is persisted via Supabase flow in composables.

## 3.2 Bring export flow

1. User logs in to Bring from settings.
2. Frontend stores Bring data in Supabase user metadata.
3. User selects a Bring list.
4. Recipe detail exports ingredients via /api/bring/items.

## 3.3 Claude iOS import flow (new)

1. User opens /import page with query payload (base64 JSON).
2. Page decodes recipe data, renders preview.
3. User confirms save to persist into app recipes.

## 4) Deployment and CI/CD

## 4.1 Deployment Targets

- Frontend production: Cloudflare Pages (flavr-nuxt.pages.dev)
- Backend production: Railway (flavr-production.up.railway.app)

## 4.2 CI Workflows

- .github/workflows/e2e-tests.yml
  - Trigger: push/PR on main and nuxt_js
  - Runs Playwright suite
  - Stores reports/videos as artifacts

- .github/workflows/deploy.yml
  - Legacy/secondary deploy workflow targeting Netlify + Railway
  - Important note: this workflow can drift from actual Cloudflare-first setup

## 5) Current Reality Check (important)

The repository contains historical docs from migration phases and previous deployment states. Some docs are stale or overlapping.

Most reliable source right now:
1. Actual code in frontend/ and backend/
2. Recent git commits on nuxt_js
3. This file (keep updated)

## 6) Open Work - Prioritized

## 6.1 High priority

1. Architecture doc hygiene
- Consolidate old status docs into one canonical status path.
- Mark historical docs clearly as archived.

2. Security hardening
- Move Bring API key usage review to secure handling policy.
- Review CORS allowlist and remove unused origins.
- Add stronger backend request validation schemas.

3. Reliability
- Replace in-memory rate limiter with shared persistent store if scaling beyond single instance.
- Add uptime/error dashboard checks for Railway + Cloudflare + Supabase.

4. Monitoring
- Verify frontend and backend Sentry coverage end-to-end.
- Add release/version tagging consistency for deployments.

## 6.2 Medium priority

1. Tests
- Expand E2E assertions for import page and Bring flows.
- Add backend endpoint tests for bring and image proxy edge cases.

2. Performance
- Audit PWA caching strategy and stale data behavior.
- Review bundle size and route-level loading.

3. Product features
- Improved search (fulltext)
- Favorites/ratings/tags
- Meal planning

## 6.3 Low priority / cleanup

1. Archive obsolete deployment docs.
2. Remove unused environment variables in Railway.
3. Reduce duplicate operational docs.

## 7) Suggested Working Agreement (for Claude iOS)

When you start a mobile coding session, use this checklist:

1. Read this file first.
2. Confirm active branch (expected: nuxt_js).
3. Check latest 5 commits for drift.
4. Implement one focused change.
5. Update this file section 8 before commit.

## 8) Change Log for This Status File

- 2026-05-31:
  - Added architecture snapshot and endpoint map.
  - Added deployment/CI reality check.
  - Added prioritized backlog aligned to current codebase.
