# Deployment Guide

Last updated: 2026-05-31
Canonical status: ARCHITECTURE_STATUS.md
Docs entry point: DOCS_INDEX.md

## Deployment Targets

- Frontend: Cloudflare Pages
- Backend: Railway
- Database/Auth: Supabase (hosted)

## Production URLs (current)

- Frontend: https://flavr-nuxt.pages.dev
- Backend: https://flavr-production.up.railway.app

## Frontend Deployment (Cloudflare Pages)

1. Connect repository in Cloudflare Pages.
2. Use branch nuxt_js.
3. Configure build:

```text
Framework preset: Nuxt.js
Root directory: frontend
Build command: npm run generate
Build output directory: .output/public
Node version: 20
```

4. Set environment variables in Cloudflare Pages project:

```text
NUXT_PUBLIC_BACKEND_URL=https://flavr-production.up.railway.app
NUXT_PUBLIC_SUPABASE_URL=<supabase-url>
NUXT_PUBLIC_SUPABASE_KEY=<supabase-anon-key>
NUXT_PUBLIC_SENTRY_DSN=<optional>
```

5. Deploy and verify at flavr-nuxt.pages.dev.

## Backend Deployment (Railway)

1. Connect repository or use Railway service deployment flow.
2. Build/run from backend workspace.
3. Set variables in Railway:

```text
NODE_ENV=production
PORT=3000
CLAUDE_API_KEY=<secret>
SENTRY_DSN_BACKEND=<optional>
```

4. Verify endpoint:

```bash
curl https://flavr-production.up.railway.app/health
```

## CI/CD Workflows in Repository

- .github/workflows/e2e-tests.yml
  - Runs Playwright E2E for main and nuxt_js
  - Uses production base URL by default

- .github/workflows/deploy.yml
  - Runs backend deploy to Railway
  - Validates Nuxt static build for Cloudflare Pages compatibility
  - Frontend publishing itself is handled by Cloudflare Pages Git integration

## Release Flow (recommended)

1. Push changes to nuxt_js.
2. Confirm E2E workflow status in GitHub Actions.
3. Verify Cloudflare Pages deploy succeeded.
4. Verify Railway service health.
5. Smoke test login, recipe CRUD, AI flow, and Bring export.

## Post-Deploy Validation Checklist

- [ ] Frontend loads and routes resolve
- [ ] /auth login works (Google + email/password)
- [ ] Backend /health returns 200
- [ ] AI call via /api/claude works
- [ ] Bring endpoints work for connected account
- [ ] PWA install prompt/manifest is valid

## Troubleshooting

### Frontend build fails on Cloudflare

- Confirm root directory is frontend.
- Confirm output directory is .output/public.
- Confirm env vars exist in Cloudflare project settings.

### Backend errors on Railway

- Check Railway logs for runtime errors.
- Confirm CLAUDE_API_KEY is set.
- Confirm CORS origin list in backend/src/index.ts includes active frontend domain.

### OAuth redirect mismatch

- Update Supabase URL configuration.
- Verify Google OAuth configuration in Google Cloud Console.
- See CUSTOM_DOMAIN_SETUP.md for exact redirect setup.

## Legacy Notes

- Older documents mention Netlify-first deployment and direct app.js edits.
- Current Nuxt architecture uses runtime environment variables instead.

