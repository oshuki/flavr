# 🚀 CI/CD Setup Guide

## GitHub Actions Deployment

Diese GitHub Actions Workflow deployt automatisch deine App auf GitHub Push.

### Was wird deployed:
- **Frontend**: Netlify (jedes Mal auf main Push)
- **Backend**: Railway.app (jedes Mal auf main Push)

---

## 📋 Setup-Schritte

### 1️⃣ Netlify Setup (Frontend)

#### 1.1 Netlify Account & Site
```bash
# Geh auf netlify.com
# Verbinde dein GitHub Repository
# Site wird automatisch erstellt
```

#### 1.2 Netlify Auth Token
```bash
# In Netlify: User Settings → Applications → Personal Access Tokens
# Erstelle einen neuen Token
# Kopiere den Token
```

#### 1.3 GitHub Secrets hinzufügen
```bash
# Geh zu GitHub: Settings → Secrets and variables → Actions
# Füge folgende Secrets hinzu:

NETLIFY_AUTH_TOKEN=<dein_token>
NETLIFY_SITE_ID=<deine_site_id>
SENTRY_DSN_FRONTEND=https://4227b5fc2fd69a62ae968aa19efae5c7@o4511226172145664.ingest.de.sentry.io/4511226207797328
```

**Wie man die Site ID findet:**
- Netlify Dashboard → Deine Site → Site settings → General → Site ID

---

### 2️⃣ Railway.app Setup (Backend)

#### 2.1 Railway Account erstellen
```bash
# railway.app → Sign up mit GitHub
# Grant Permissions
```

#### 2.2 Projekt & Service erstellen
```bash
# Railway Dashboard → New Project
# Import from GitHub → Wähle rezepte-project
# Deploy erfolgreich?
```

#### 2.3 Environment Variables auf Railway
```bash
# Railway Dashboard → Dein Projekt → Backend Service → Variables

CLAUDE_API_KEY=<dein_echtes_key>
SENTRY_DSN_BACKEND=https://71f10fedb606305d08ca9c024ee90ca6@o4511226172145664.ingest.de.sentry.io/4511226193903696
PORT=3000
NODE_ENV=production
```

#### 2.4 Railway Token für GitHub Actions
```bash
# Railway Account → Tokens → New Token
# Kopiere den Token
```

#### 2.5 GitHub Secret hinzufügen
```bash
# GitHub: Settings → Secrets → New Secret

RAILWAY_TOKEN=<dein_token>
```

---

### 3️⃣ Frontend URL im Backend updaten

Nach dem ersten Deploy bekommst du die Railway URL. Dann update die `app.js`:

```javascript
// app.js - Ändere diese Zeile (derzeit localhost:3000):
const BACKEND_URL = 'https://dein-backend.railway.app'

// Und replace alle:
fetch('http://localhost:3000/api/...')
// Mit:
fetch(BACKEND_URL + '/api/...')
```

---

## ✅ Test des Deployment

1. **Push zu main**: Git push sollte GitHub Actions triggern  
2. **Warte auf Workflow**: GitHub → Actions Tab zeigt Status
3. **Check Backends**: 
   - Frontend: Deine Netlify URL
   - Backend: Deine Railway Dashboard → App URL

---

## 🔧 Troubleshooting

### Netlify Deploy schlägt fehl
```
→ Check: NETLIFY_SITE_ID und NETLIFY_AUTH_TOKEN korrekt?
→ Check: Netlify Settings → Build Command richtig gesetzt?
```

### Railway Deploy schlägt fehl
```
→ Check: RAILWAY_TOKEN gültig?
→ Check: Railway Dashboard Logs für Error Messages
→ Try: railway up --service backend lokal testen
```

### Backend URL nicht erreichbar
```
→ Check: Railway Service läuft?
→ Check: CORS in backend/src/index.ts für deine Netlify URL updaten
```

---

## 📝 Nächste Schritte

Nach erfolgreichem Deploy:

1. **Sentry Integration** (Phase 1.4)
   - Error Tracking setup
   - Production Errors sichtbar machen
  
2. **Unit Tests** (Phase 1.5)
   - Vitest für Backend
   - CI/CD Tests before Deploy

3. **Monitoring**
   - Railway Logs checken
   - Netlify Analytics
   - Sentry Error Dashboard

