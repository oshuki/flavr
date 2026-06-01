# Deploy Now - Checkliste

Last updated: 2026-06-01

## 1) Railway Backend deployen

- Service aus backend/ bauen und starten
- Variablen setzen:

```text
NODE_ENV=production
PORT=3000
CLAUDE_API_KEY=<secret>
SENTRY_DSN_BACKEND=<optional>
```

- Öffentliche URL merken: https://<backend>.up.railway.app

## 2) Cloudflare Pages Frontend deployen

- Repo verbinden
- Branch auswählen
- Build-Konfiguration:

```text
Framework preset: Nuxt.js
Root directory: frontend
Build command: npm run generate
Build output directory: .output/public
Node version: 20
```

- Variablen setzen:

```text
NUXT_PUBLIC_BACKEND_URL=https://<backend>.up.railway.app
NUXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<anon-key>
NUXT_PUBLIC_SENTRY_DSN=<optional>
```

## 3) Supabase Auth URLs

- Site URL: https://<frontend-domain>
- Redirect URL: https://<frontend-domain>/auth/callback

## 4) Finaler Smoke-Test

```bash
curl -I https://<frontend-domain>
curl -sS https://<backend-domain>/health
```

- Login testen
- Rezepte CRUD testen
- AI testen
- Bring-Export testen

