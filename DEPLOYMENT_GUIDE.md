# Production Deployment Guide

Last updated: 2026-06-01
Canonical status: ARCHITECTURE_STATUS.md
Docs entry point: DOCS_INDEX.md

## Target Architecture

- Frontend: Cloudflare Pages (Nuxt static output)
- Backend: Render (Node service from backend/)
- Data/Auth: Supabase

## Required Accounts

- Cloudflare account with Pages enabled
- Render account
- Supabase project
- GitHub repository access

## 1. Cloudflare Pages Setup (Frontend)

Create or update a Pages project:

- Repository: oshuki/flavr
- Branch: main (or your release branch)
- Framework preset: Nuxt.js
- Root directory: frontend
- Build command: npm run generate
- Build output directory: .output/public
- Node version: 20

Set environment variables in Cloudflare Pages:

```text
NUXT_PUBLIC_BACKEND_URL=https://<your-backend-domain-or-railway-url>
NUXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your-supabase-anon-key>
NUXT_PUBLIC_SENTRY_DSN=<optional>
```

## 2. Render Setup (Backend)

Create or update a Render Web Service:

- Service root: backend
- Build command: npm install && npm run build
- Start command: npm start

Set Render environment variables:

```text
NODE_ENV=production
PORT=3000
CLAUDE_API_KEY=<your-claude-api-key>
SENTRY_DSN_BACKEND=<optional>
USE_MOCK_AI=false
```

Save the public backend URL, for example:

```text
https://flavr-backend.onrender.com
```

Then update Cloudflare Pages variable NUXT_PUBLIC_BACKEND_URL accordingly.

## 3. GitHub Actions Setup

Repository secrets needed for the current deploy workflow:

```text
RENDER_DEPLOY_HOOK_URL=<render-deploy-hook-url>
NUXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your-supabase-anon-key>
NUXT_PUBLIC_BACKEND_URL=https://<your-backend-domain-or-railway-url>
SENTRY_DSN_FRONTEND=<optional>
```

Notes:

- Frontend deployment is handled by Cloudflare Pages Git integration.
- The workflow validates frontend build output and triggers backend deployment on Render via deploy hook.

## 4. Deployment Flow

1. Push to the release branch used by Cloudflare Pages and GitHub Actions.
2. GitHub Actions runs tests, validates frontend static build, and triggers Render deploy.
3. Cloudflare Pages builds and publishes frontend from Git.
4. Verify both public URLs.

## 5. Verification Checklist

- Frontend URL loads and routes work.
- Backend health endpoint returns 200.
- Login works (Google + email/password).
- AI request via /api/claude works.
- Bring export works.

Quick checks:

```bash
curl -I https://<your-frontend-domain>
curl -sS https://<your-backend-domain>/health
```

## 6. Troubleshooting

Frontend build fails:

- Verify Root directory is frontend.
- Verify Build output directory is .output/public.
- Verify required NUXT_PUBLIC_* variables exist in Cloudflare Pages.

Backend deploy fails:

- Check Render logs.
- Check RENDER_DEPLOY_HOOK_URL in GitHub secrets.
- Check CLAUDE_API_KEY in Render environment variables.

Auth redirect issues:

- Update Supabase Site URL and Redirect URLs to your frontend domain.
- Keep Google OAuth redirect URI set to Supabase callback.

