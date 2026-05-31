# Custom Domain Setup

Last updated: 2026-05-31
Canonical project status: ARCHITECTURE_STATUS.md
Docs navigation: DOCS_INDEX.md

Goal: use a custom domain instead of flavr-nuxt.pages.dev for the frontend and optionally api.<domain> for the backend.

## Current Target Architecture

- Frontend hosting: Cloudflare Pages
- Backend hosting: Railway
- Auth: Supabase (with Google OAuth)

## Prerequisites

- You own a domain.
- You can edit DNS records at your registrar or in Cloudflare DNS.
- You have access to Cloudflare, Supabase, Google Cloud Console, and Railway.

## Frontend Domain on Cloudflare Pages

1. Open Cloudflare dashboard.
2. Go to Workers & Pages > flavr-nuxt > Custom domains.
3. Add your domain, for example:
   - flavr.app
   - www.flavr.app
4. Let Cloudflare create required DNS records.

Typical DNS mapping:

```text
CNAME  @    flavr-nuxt.pages.dev
CNAME  www  flavr-nuxt.pages.dev
```

## Optional Backend Domain (Recommended)

If you want a stable API host like api.flavr.app:

1. In Railway service settings, add custom domain api.flavr.app.
2. Add/confirm DNS record in Cloudflare:

```text
CNAME  api  flavr-production.up.railway.app
```

3. Keep proxy mode and SSL enabled in Cloudflare.

## Application Configuration Updates

After domain changes, update frontend runtime variable in Cloudflare Pages:

```text
NUXT_PUBLIC_BACKEND_URL=https://api.flavr.app
```

If you keep Railway default host, set:

```text
NUXT_PUBLIC_BACKEND_URL=https://flavr-production.up.railway.app
```

## Supabase Auth URL Configuration (Mandatory)

In Supabase Dashboard > Authentication > URL Configuration:

1. Site URL:
   - https://flavr.app
2. Redirect URLs:
   - https://flavr.app/auth/callback
   - https://www.flavr.app/auth/callback

## Google OAuth Configuration (Mandatory)

In Google Cloud Console > APIs & Services > Credentials > OAuth client:

1. Authorized JavaScript origins:
   - https://flavr.app
   - https://www.flavr.app
2. Authorized redirect URIs:
   - https://htescszituyzooubmxkh.supabase.co/auth/v1/callback

Note: Supabase is the OAuth callback receiver. App callback handling remains in /auth/callback.

## SSL/TLS Recommendations

Cloudflare SSL/TLS settings:

- Encryption mode: Full (strict)
- Always Use HTTPS: enabled
- Automatic HTTPS Rewrites: enabled
- Minimum TLS: 1.2

## Verification Checklist

- [ ] https://flavr.app opens
- [ ] https://www.flavr.app redirect behavior is as intended
- [ ] https://flavr.app/auth and Google login work
- [ ] API calls succeed in browser network tab
- [ ] PWA install works on mobile Safari

Quick checks:

```bash
dig flavr.app
dig www.flavr.app
curl -I https://flavr.app
```

## Rollback Plan

If issues appear after cutover:

1. Keep using flavr-nuxt.pages.dev temporarily.
2. Revert Site URL/Redirect URLs in Supabase.
3. Revert frontend backend URL env var to known-good value.

## Notes

- Legacy deployment docs may still mention Netlify. Use ARCHITECTURE_STATUS.md as source of truth.
- This document should be updated whenever domain or auth routing strategy changes.
