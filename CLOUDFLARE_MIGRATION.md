# Cloudflare Pages Migration and Operations

Last updated: 2026-05-31
Canonical status: ARCHITECTURE_STATUS.md
Docs entry point: DOCS_INDEX.md

This document explains the Cloudflare-first frontend setup and how it integrates with Railway and Supabase.

## Why Cloudflare Pages

- Fast global CDN
- Automatic deploys from Git
- Straightforward custom domain + SSL flow
- Good fit for Nuxt static generation output

## Current Production Setup

- Frontend: https://flavr-nuxt.pages.dev
- Backend: https://flavr-production.up.railway.app
- Branch for active work: nuxt_js

## Cloudflare Pages Configuration

Use these settings in Cloudflare Pages project:

```text
Framework preset: Nuxt.js
Root directory: frontend
Build command: npm run generate
Build output directory: .output/public
Node version: 20
```

Environment variables (placeholders only):

```text
NUXT_PUBLIC_BACKEND_URL=https://<your-backend-domain-or-railway-url>
NUXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your-supabase-anon-key>
NUXT_PUBLIC_SENTRY_DSN=<optional>
```

## Deployment Flow

1. Push changes to nuxt_js.
2. Cloudflare Pages triggers new deploy.
3. Verify deployed URL.
4. Run smoke checks (auth, recipes, AI, bring export).

Typical command flow:

```bash
git add -A
git commit -m "feat/fix/docs: ..."
git push origin nuxt_js
```

## Custom Domain and OAuth

For custom domain setup, use CUSTOM_DOMAIN_SETUP.md.

Critical follow-up after domain changes:

1. Update Supabase Site URL and Redirect URLs.
2. Verify Google OAuth client configuration.
3. Confirm frontend env var NUXT_PUBLIC_BACKEND_URL still points to valid API host.

## Post-Deploy Validation

- [ ] Frontend loads without console/runtime errors
- [ ] Login works (Google + email/password)
- [ ] Backend health endpoint returns 200
- [ ] AI flow works (via /api/claude)
- [ ] Bring export still functions
- [ ] PWA manifest and install behavior are valid

Quick checks:

```bash
curl -I https://flavr-nuxt.pages.dev
curl -sS https://flavr-production.up.railway.app/health
```

## Troubleshooting

### Build fails

- Confirm root directory is frontend.
- Confirm output directory is .output/public.
- Confirm Node version is 20.

### API unreachable from frontend

- Check NUXT_PUBLIC_BACKEND_URL in Cloudflare settings.
- Check backend availability on Railway.
- Check CORS allowlist in backend/src/index.ts.

### OAuth redirect mismatch

- Check Supabase Authentication URL configuration.
- Check Google OAuth client redirect URI configuration.

## Notes

- Legacy docs may still refer to Netlify-first flow. Use ARCHITECTURE_STATUS.md as source of truth.
- Keep this file operational and concise; store roadmap details in ARCHITECTURE_STATUS.md.
