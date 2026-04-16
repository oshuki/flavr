# 🚀 Production Deployment Guide

## Prerequisites

### 1. GitHub Repository
- Repository muss public oder private auf GitHub sein
- Main branch ist production branch

### 2. Accounts benötigt
- ✅ **Netlify Account** (Frontend Hosting)
- ✅ **Railway Account** (Backend Hosting)  
- ✅ **Supabase** (bereits vorhanden)
- ✅ **Sentry** (bereits konfiguriert)

---

## 📝 GitHub Secrets Setup

Gehe zu: `Settings → Secrets and variables → Actions → New repository secret`

### Required Secrets:

```bash
# Frontend (Netlify)
NETLIFY_AUTH_TOKEN=<your-netlify-personal-access-token>
NETLIFY_SITE_ID=<your-netlify-site-id>

# Backend (Railway)
RAILWAY_TOKEN=<your-railway-token>

# Supabase (Environment für Nuxt)
NUXT_PUBLIC_SUPABASE_URL=https://htescszituyzooubmxkh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGci...  # Dein Anon Key

# Backend URL (nach Railway Deployment)
NUXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# Sentry
SENTRY_DSN_FRONTEND=https://4227b5fc2fd69a62ae968aa19efae5c7@o4511226172145664.ingest.de.sentry.io/4511226207797328
SENTRY_DSN_BACKEND=https://your-backend-dsn@sentry.io/...

# Anthropic API (für Backend)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🔧 Step-by-Step Deployment

### Step 1: Netlify Setup (Frontend)

1. **Erstelle Netlify Site:**
   ```bash
   # Option A: Via Netlify UI
   - Gehe zu https://app.netlify.com
   - "Add new site" → "Import an existing project"
   - Verbinde GitHub repo
   - WICHTIG: NICHT auto-deployen lassen (wir nutzen GitHub Actions)
   
   # Option B: Via CLI
   npm install -g netlify-cli
   netlify login
   netlify sites:create --name flavr-app
   ```

2. **Hole Netlify Credentials:**
   ```bash
   # Auth Token
   netlify login
   # Erstelle Personal Access Token in Netlify UI:
   # User Settings → Applications → Personal access tokens → New access token
   
   # Site ID
   netlify status
   # Oder: Netlify UI → Site settings → General → Site details → API ID
   ```

3. **Setze GitHub Secrets:**
   - `NETLIFY_AUTH_TOKEN`: Dein Netlify PAT
   - `NETLIFY_SITE_ID`: Deine Site ID

### Step 2: Railway Setup (Backend)

1. **Erstelle Railway Project:**
   ```bash
   # Via Railway UI
   - Gehe zu https://railway.app
   - "New Project" → "Deploy from GitHub repo"
   - Wähle dein Repo
   - Service name: "backend"
   
   # Via CLI
   npm install -g @railway/cli
   railway login
   railway init
   railway link
   ```

2. **Konfiguriere Railway Service:**
   ```bash
   # Im Railway UI:
   - Service: backend
   - Settings → Deploy:
     * Root Directory: /backend
     * Build Command: npm install && npm run build
     * Start Command: npm start
   
   # Environment Variables (in Railway UI setzen):
   NODE_ENV=production
   PORT=3000
   ANTHROPIC_API_KEY=sk-ant-...
   SENTRY_DSN=<backend-sentry-dsn>
   ```

3. **Hole Railway Token:**
   ```bash
   # Via CLI
   railway whoami
   # Token erhältst du via: railway login → generiert automatisch
   
   # ODER: Railway UI → Account Settings → Tokens → Create Project Token
   ```

4. **Setze GitHub Secret:**
   - `RAILWAY_TOKEN`: Dein Railway Project Token

5. **Notiere Backend URL:**
   - Nach erstem Deploy: `https://your-backend.railway.app`
   - Setze als `NUXT_PUBLIC_BACKEND_URL` Secret

### Step 3: Update Frontend Config mit Backend URL

Nach Railway-Deploy:

1. **Hole Backend URL** von Railway Dashboard
2. **Update GitHub Secret:**
   ```
   NUXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   ```
3. **Trigger Re-Deploy** (push to main)

### Step 4: Supabase URL Config

Die Supabase Credentials sind bereits in den Secrets:
```
NUXT_PUBLIC_SUPABASE_URL=https://htescszituyzooubmxkh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGci... (dein anon key)
```

---

## 🚨 Nach dem Deployment

### Teste die Production App:

1. **Frontend URL:** `https://your-site.netlify.app`
2. **Backend URL:** `https://your-backend.railway.app`

### Health Checks:

```bash
# Backend Health
curl https://your-backend.railway.app/health

# Frontend SSR Check
curl https://your-site.netlify.app
```

### Troubleshooting:

**Problem: Frontend lädt nicht**
- Checke Netlify Build Logs
- Verifiziere NUXT_PUBLIC_* Secrets sind gesetzt
- Prüfe netlify.toml publish-dir: `frontend/.output/public`

**Problem: Backend 500 Errors**
- Railway Logs checken: `railway logs`
- Verifiziere ANTHROPIC_API_KEY ist gesetzt
- Prüfe PORT=3000 ist gesetzt

**Problem: Frontend → Backend Connection Failed**
- Verifiziere NUXT_PUBLIC_BACKEND_URL zeigt auf Railway URL
- Checke CORS headers im Backend
- Prüfe Railway Service ist "public" (nicht private network)

---

## 📦 Deployment Workflow

### Automatic Deployment:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

GitHub Actions wird automatisch:
1. Tests laufen lassen
2. Backend zu Railway deployen
3. Frontend zu Netlify deployen

### Manual Deployment:

```bash
# Frontend only
cd frontend
npm run build
netlify deploy --prod --dir=.output/public

# Backend only
cd backend
railway up
```

---

## 🔒 Security

### Environment Variables Checklist:

- ✅ NIEMALS API Keys in Code committen
- ✅ Alle Secrets in GitHub Actions Secrets
- ✅ Railway env vars in Railway UI setzen
- ✅ Netlify env vars nicht nötig (Nuxt bekommt sie via GitHub Actions)

### CSP Headers:

Netlify setzt bereits CSP headers via `netlify.toml`:
- Erlaubt nur Supabase, Sentry, Pollinations
- Blockt inline scripts (außer Nuxt-generierte)

---

## 📊 Monitoring

### Sentry Integration:

**Frontend:** Automatisch via `NUXT_PUBLIC_SENTRY_DSN`
**Backend:** Bereits konfiguriert in `backend/src/index.ts`

Sentry Dashboard: https://sentry.io

### Logs:

```bash
# Railway Backend Logs
railway logs

# Netlify Function Logs
netlify logs

# GitHub Actions Logs
GitHub → Actions → Latest workflow run
```

---

## 🎯 Quick Reference

| Service | URL | Dashboard |
|---------|-----|-----------|
| Frontend | https://your-site.netlify.app | https://app.netlify.com |
| Backend | https://your-backend.railway.app | https://railway.app |
| Supabase | https://htescszituyzooubmxkh.supabase.co | https://supabase.com/dashboard |
| Sentry | - | https://sentry.io |

---

## 🔄 Rollback

Falls ein Deployment fehlschlägt:

```bash
# Netlify Rollback
netlify rollback

# Railway Rollback
railway rollback

# Git Rollback
git revert HEAD
git push origin main
```

---

## ✅ Deployment Checklist

Vor dem Production Go-Live:

- [ ] Alle GitHub Secrets gesetzt
- [ ] Netlify Site erstellt
- [ ] Railway Service konfiguriert
- [ ] Backend URL in Frontend-Config
- [ ] Supabase Auth Redirect URLs updated (add Netlify URL)
- [ ] Google OAuth Redirect URL updated (add Netlify URL)
- [ ] Sentry Projekte angelegt
- [ ] Test-Rezepte in Production DB
- [ ] PWA Icons uploaded
- [ ] Domain DNS konfiguriert (optional)

---

_Letzte Aktualisierung: 16.04.2026_
_Status: Ready for Production Deployment_
