# Deployment Guide - Kurzfassung

Last updated: 2026-06-01

## Zielsetup

- Frontend: Cloudflare Pages
- Backend: Railway

## Schritt 1: Backend auf Railway

1. Railway Project/Service mit Root backend anlegen.
2. Build: npm install && npm run build
3. Start: npm start
4. Variablen setzen:

```text
NODE_ENV=production
PORT=3000
CLAUDE_API_KEY=<dein-key>
SENTRY_DSN_BACKEND=<optional>
```

5. Backend-URL notieren (z. B. https://flavr-production.up.railway.app).

## Schritt 2: Frontend auf Cloudflare Pages

1. Pages-Projekt mit Repo oshuki/flavr verbinden.
2. Branch auswählen.
3. Build-Einstellungen:

```text
Framework preset: Nuxt.js
Root directory: frontend
Build command: npm run generate
Build output directory: .output/public
Node version: 20
```

4. Variablen setzen:

```text
NUXT_PUBLIC_BACKEND_URL=<railway-url-aus-schritt-1>
NUXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<anon-key>
NUXT_PUBLIC_SENTRY_DSN=<optional>
```

## Schritt 3: Auth URLs aktualisieren

In Supabase Authentication URL Configuration:

- Site URL: https://<deine-frontend-domain>
- Redirect URL: https://<deine-frontend-domain>/auth/callback

## Schritt 4: Prüfen

- Frontend lädt
- /health liefert 200
- Login funktioniert
- AI und Bring funktionieren

