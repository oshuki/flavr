# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Flavr is a recipe and meal-planning PWA. Three runtime layers:

- `frontend/` — Nuxt 4 SPA (`ssr: false`, static generation), Vue 3, Pinia, `@nuxtjs/supabase`, `@vite-pwa/nuxt`. Deployed to Cloudflare Pages.
- `backend/` — Node.js API on Render. A single `src/index.ts` defines a **Hono app for all routes, wrapped in Express**: an Express catch-all middleware converts incoming requests to Hono requests. New endpoints are added as Hono routes, not Express routes.
- Supabase — Postgres, Auth, RLS. Schema/migration SQL lives in `supabase/` and `supabase-*.sql` in the repo root. Every user-data table needs RLS policies (users only access their own rows).

**ARCHITECTURE.md is the single source of truth** for endpoints, data model, env vars, and deployment. Update it when any of those change.

The root-level `index.html`, `js/`, `styles.css`, `sw.js` are the legacy pre-Nuxt app — do not develop there; the current frontend is `frontend/`.

Frontend ↔ backend coupling: the frontend calls the backend via `NUXT_PUBLIC_BACKEND_URL` (runtimeConfig `public.backendUrl`). Data access on the frontend goes through composables (`frontend/composables/use*.ts`), which wrap Supabase and backend calls — follow that pattern for new features.

## Commands

Backend (run in `backend/`):
- `npm run dev` — dev server (tsx watch)
- `npm run build` — TypeScript compile (must pass; this is the deploy build)
- `npm test` — Vitest; single test: `npx vitest run -t "<test name>"`
- `npm run lint` / `npm run lint:fix` — ESLint (0 errors required; `any` warnings tolerated)

Frontend (run in `frontend/`):
- `npm run dev` — dev server on port 3002
- `npm run generate` — static build (must pass; this is the CI/deploy build)
- `npm run test:e2e` — Playwright E2E tests; single file: `npx playwright test tests/e2e/<file>`

## AI agent team

`.claude/agents/` defines a role-based team (business-analyst → solution-architect → frontend-developer + backend-developer → qa-tester), orchestrated by the `/team` slash command. Use `/team <task>` for features that span spec, implementation, and testing. The quality bar for all changes is `docs/definition-of-done.md`.

## Conventions

- German is the language of the app UI and team communication; commit messages are English.
- New backend endpoints: validate input, return structured errors (no stack traces to clients), and add Vitest coverage alongside in `src/index.test.ts`.
- New env vars must be read via `process.env` (backend) or `runtimeConfig` (frontend) and documented in ARCHITECTURE.md section 5.
