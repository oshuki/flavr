# 🚀 Deployment Guide - Schritt für Schritt

## Voraussetzungen
- ✅ GitHub Account
- ✅ Railway Account (https://railway.app)
- ✅ Netlify Account (https://netlify.com)
- ✅ Projekt in GitHub Repository gepushed

---

## Teil 1: Backend auf Railway deployen 🚂

### Schritt 1.1: Railway Projekt erstellen
1. Gehe zu https://railway.app
2. Klicke auf "New Project"
3. Wähle "Deploy from GitHub repo"
4. Wähle dein `rezepte-project` Repository
5. Railway erkennt automatisch das Backend

### Schritt 1.2: Build-Konfiguration
Railway sollte automatisch erkennen:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`  
- **Start Command**: `npm start`

Falls nicht:
- Settings → Build → Custom Build Path: `backend`

### Schritt 1.3: Environment Variables setzen
In Railway → Variables → Add Variable:

```bash
NODE_ENV=production
PORT=3000
ANTHROPIC_API_KEY=<dein_claude_api_key>
BRING_API_KEY=cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp
SENTRY_DSN=<optional_dein_sentry_dsn>
```

### Schritt 1.4: Domain notieren
- Nach Deployment: Settings → Networking
- Kopiere die URL (z.B. `https://rezepte-backend-production.up.railway.app`)
- **Diese URL brauchst du für Frontend!**

---

## Teil 2: Frontend auf Netlify deployen 🌐

### Schritt 2.1: Netlify Site erstellen
1. Gehe zu https://netlify.com
2. "Add new site" → "Import an existing project"
3. Wähle dein GitHub Repository
4. **Base directory**: `frontend`
5. **Build command**: `npm install && npm run generate`
6. **Publish directory**: `.output/public`

### Schritt 2.2: Environment Variables setzen
In Netlify → Site settings → Environment variables:

```bash
NUXT_PUBLIC_BACKEND_URL=https://DEINE-RAILWAY-URL.railway.app
NUXT_PUBLIC_SUPABASE_URL=https://htescszituyzooubmxkh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZXNjc3ppdHV5em9vdWJteGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzODY0NDgsImV4cCI6MjA0OTk2MjQ0OH0.mjxawQUWvRJG3kq7pX14v0nwGv-h1tWUm4D3qSblPaY
NUXT_PUBLIC_SENTRY_DSN=<optional>
```

**WICHTIG**: Ersetze `DEINE-RAILWAY-URL` mit der URL aus Schritt 1.4!

### Schritt 2.3: Deploy
- Klicke "Deploy site"
- Netlify baut automatisch
- Nach ~2-3 Minuten ist die Site live

### Schritt 2.4: Domain notieren
- Site overview → Domain (z.B. `https://dein-flavr-app.netlify.app`)

---

## Teil 3: Supabase-URLs aktualisieren

### Schritt 3.1: Allowed URLs in Supabase
1. Gehe zu https://supabase.com → Dein Projekt
2. Authentication → URL Configuration
3. Füge hinzu:
   - `https://deine-netlify-site.netlify.app`
   - `https://deine-netlify-site.netlify.app/auth/callback`

### Schritt 3.2: CORS erweitern (Backend)
Falls deine Netlify-URL anders ist als localhost:
- Wird automatisch über Railway neu deployed

---

## Teil 4: Testen 🧪

### Frontend testen
1. Öffne deine Netlify-URL
2. Teste Login
3. Teste Rezept erstellen
4. Teste KI-Bildgenerierung
5. Teste Bring! Export

### Backend testen
Rufe auf: `https://DEINE-RAILWAY-URL.railway.app/health`

Sollte zurückgeben:
```json
{"status":"ok"}
```

---

## Teil 5: PWA installieren 📱

### Desktop
1. Öffne deine Netlify-URL in Chrome
2. Klicke auf das Install-Icon in der Adressleiste
3. ODER: Menü (⋮) → "Installieren..."

### Handy
1. Öffne die URL im Browser
2. **iPhone**: Share → "Add to Home Screen"
3. **Android**: Menü → "App installieren"

---

## Troubleshooting 🔧

### Frontend lädt nicht
- **Check**: Environment Variables richtig gesetzt?
- **Check**: Backend-URL endet nicht mit `/`?
- **Check**: Netlify Build-Log prüfen

### Backend Fehler
- **Check**: Railway Build-Log prüfen
- **Check**: Environment Variables gesetzt?
- **Check**: ANTHROPIC_API_KEY gültig?

### Login funktioniert nicht
- **Check**: Supabase URLs aktualisiert?
- **Check**: Redirect URLs korrekt?
- **Check**: NUXT_PUBLIC_SUPABASE_* richtig?

### Bring! Export funktioniert nicht
- **Check**: Backend CORS erlaubt Frontend-URL?
- **Check**: Backend `/api/bring/login` erreichbar?

---

## Auto-Deployment (Optional) 🤖

Beide Plattformen deployen automatisch bei jedem Git Push:
- **GitHub Push** → Railway deployed Backend automatisch
- **GitHub Push** → Netlify deployed Frontend automatisch

Keine weiteren Schritte nötig!

---

## Kosten 💰

- **Railway**: ~$5/Monat (500 Stunden Free Tier)
- **Netlify**: Free für persönliche Projekte
- **Supabase**: Free Plan (ausreichend)
- **Anthropic API**: Pay-per-use (~$3 für 1M Tokens)

**Total**: ~$5-10/Monat

---

## Fertig! 🎉

Deine App ist jetzt live und installierbar als PWA!

**URLs merken:**
- Frontend: https://*.netlify.app
- Backend: https://*.railway.app
