# Production Environment Variables

Last updated: 2026-05-31
Canonical status: ARCHITECTURE_STATUS.md
Docs entry point: DOCS_INDEX.md

Use placeholders only in documentation. Never commit real secrets.

## Frontend (Cloudflare Pages / Nuxt)

Set in Cloudflare Pages project settings:

```bash
# Supabase (public runtime)
NUXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your-supabase-anon-key>

# Backend API
NUXT_PUBLIC_BACKEND_URL=https://<your-backend-domain-or-railway-url>

# Sentry (optional)
NUXT_PUBLIC_SENTRY_DSN=<your-frontend-sentry-dsn>
```

## Backend (Render)

Set in Render service variables:

```bash
NODE_ENV=production
PORT=3000

# Claude / Anthropic
CLAUDE_API_KEY=<your-claude-api-key>

# Optional
SENTRY_DSN_BACKEND=<your-backend-sentry-dsn>
USE_MOCK_AI=false
```

## GitHub Actions Secrets

Required/typical repository secrets:

```text
RENDER_DEPLOY_HOOK_URL=<from-render-web-service>
NUXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your-supabase-anon-key>
NUXT_PUBLIC_BACKEND_URL=https://<your-backend-domain-or-railway-url>
SENTRY_DSN_FRONTEND=<optional>
TEST_USER_EMAIL=<optional-for-e2e>
TEST_USER_PASSWORD=<optional-for-e2e>
SUPABASE_TEST_TOKEN=<optional-for-e2e>
```

Note: legacy Netlify secrets may still exist in repository settings but are not required for Cloudflare-first deployment.

## Supabase Auth URL Configuration

In Supabase Dashboard > Authentication > URL Configuration:

```text
Site URL:
- https://<your-frontend-domain>

Redirect URLs:
- https://<your-frontend-domain>/auth/callback
- https://www.<your-frontend-domain>/auth/callback
```

## Google OAuth Redirect Configuration

In Google Cloud Console OAuth client:

```text
Authorized redirect URIs:
- https://<your-project-ref>.supabase.co/auth/v1/callback
```

## Security Notes

- If any secret-like value was committed before, rotate it immediately.
- Prefer storing secrets in provider dashboards (Render/Cloudflare/GitHub), not in files.
- Keep .env files out of version control.
