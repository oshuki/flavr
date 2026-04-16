# Production Environment Variables

## Frontend (Nuxt 3)

Create `frontend/.env` for production:

```bash
# Supabase
NUXT_PUBLIC_SUPABASE_URL=https://htescszituyzooubmxkh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZXNjc3ppdHV5em9vdWJteGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQ0MDYsImV4cCI6MjA5MTUwMDQwNn0.ATopUfnXtyoWmJl1NfumhRrfQZcveDXZMWR9JWuIqKI

# Backend API (UPDATE after Railway deployment!)
NUXT_PUBLIC_BACKEND_URL=https://YOUR-BACKEND.railway.app

# Sentry (Frontend)
NUXT_PUBLIC_SENTRY_DSN=https://4227b5fc2fd69a62ae968aa19efae5c7@o4511226172145664.ingest.de.sentry.io/4511226207797328
```

## Backend (Hono + Node.js)

Set in Railway Dashboard UI:

```bash
NODE_ENV=production
PORT=3000

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Sentry (Backend)
SENTRY_DSN=https://YOUR-BACKEND-DSN@o4511226172145664.ingest.de.sentry.io/...
```

## GitHub Actions Secrets

Required secrets in GitHub repository:

```
NETLIFY_AUTH_TOKEN=<from-netlify-account>
NETLIFY_SITE_ID=<from-netlify-site>
RAILWAY_TOKEN=<from-railway-account>
NUXT_PUBLIC_SUPABASE_URL=https://htescszituyzooubmxkh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGci...
NUXT_PUBLIC_BACKEND_URL=https://YOUR-BACKEND.railway.app
SENTRY_DSN_FRONTEND=https://...
```

## Post-Deployment: Supabase Auth Redirect URLs

Add production URLs to Supabase Dashboard:

```
Authentication → URL Configuration → Redirect URLs:
- https://YOUR-SITE.netlify.app/auth/callback
- https://YOUR-SITE.netlify.app/**
```

## Google OAuth Redirect URLs

Update Google Cloud Console:

```
Authorized redirect URIs:
- https://htescszituyzooubmxkh.supabase.co/auth/v1/callback
```

---

_Diese Werte werden NICHT in Git committed - nur als Referenz!_
