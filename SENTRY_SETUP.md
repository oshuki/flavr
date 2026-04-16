# 📊 Sentry Setup Guide - Vollständige Anleitung

## 🎯 Was ist Sentry?

Sentry ist ein **Error Tracking & Monitoring Tool** das:
- ✅ Alle Fehler in deiner App aufzeichnet
- ✅ Stack Traces mit Code-Kontext zeigt
- ✅ Alerts bei kritischen Errors sendet
- ✅ Sessions & User Behavior trackt
- ✅ Performance Monitoring bietet

---

## 📋 Step-by-Step Setup

### Step 1: Sentry Account erstellen

1. Geh auf **[sentry.io](https://sentry.io)**
2. Klick auf **"Sign Up"**
3. Wähle **GitHub** zum Anmelden (empfohlen)
   - GitHub verlangt Permission - Grant it
4. Du kommst zu Sentry Dashboard

---

### Step 2: Neues Project erstellen

1. **Sentry Dashboard** → **Neues Project**
2. **Wähle Plattform:**
   - **Backend:** Node.js (Express/Hono-kompatibel)
   - **Frontend:** Vue / JavaScript
3. **Wähle Alert Level:**
   - Release: Sentry versioniert zusammen mit deinem Code
4. **Klick "Create Project"**

---

### Step 3: DSN (Data Source Name) kopieren

Nach Project-Erstellung siehst du eine Anleitung. Die **DSN** ist das Wichtigste:

```
Backend: https://71f10fedb606305d08ca9c024ee90ca6@o4511226172145664.ingest.de.sentry.io/4511226193903696
Frontend: https://4227b5fc2fd69a62ae968aa19efae5c7@o4511226172145664.ingest.de.sentry.io/4511226207797328
```

**Diese DSN brauchst du für:**
- Backend Konfiguration (Railway Environment Variables)
- Frontend Konfiguration (Netlify Environment Variables)
- GitHub Actions Secrets

**Wo man die DSN findet:**
```
Sentry Dashboard 
  → Dein Project 
    → Settings (oben rechts)
      → Client Keys (DSN)
```

---

### Step 4: GitHub Secrets hinzufügen

1. Geh zu **GitHub: Settings → Secrets and variables → Actions**
2. Füge folgende Secrets hinzu:

```_BACKEND=https://71f10fedb606305d08ca9c024ee90ca6@o4511226172145664.ingest.de.sentry.io/4511226193903696
SENTRY_DSN_FRONTEND=https://4227b5fc2fd69a62ae968aa19efae5c7@o4511226172145664.ingest.de.sentry.io/4511226207797328xxx@sentry.io/1234567890
SENTRY_ENVIRONMENT=production
```

---

## 🔧 Backend Integration

### Installation

```bash
cd backend
npm install @sentry/node @sentry/tracing
npm install dotenv  # Falls nicht vorhanden
```

### Backend Code (src/index.ts)

Add oben in der Datei:

```typescript
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import 'dotenv/config'

// Sentry initialisieren
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1,
})

// Express Error Handler
app.onError((err, c) => {
  Sentry.captureException(err)
  console.error('Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})
```

### Backend .env.local Update

```bash
# backend/.env.local
SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/1234567890
SENTRY_ENVIRONMENT=development
```

---

## 🎨 Frontend Integration

### Setup vorbereitet

Frontend Sentry wird automatisch bei Build eingefügt via `scripts/inject-env.js`.

**In index.html ist bereits vorbereitet:**
```html
<meta name="sentry-dsn" content="%SENTRY_DSN_CLIENT%">
<script src="https://browser.sentry-cdn.com/7.12.0/bundle.tracing.min.js"></script>
<script>
  (function(){
    var meta = document.querySelector('meta[name="sentry-dsn"]');
    var dsn = (meta && meta.content) ? meta.content : '';
    if (!dsn || dsn.indexOf('%SENTRY') === 0) return;
    if (window.Sentry && typeof window.Sentry.init === 'function') {
      window.Sentry.init({ dsn: dsn, tracesSampleRate: 0.05 });
    }
  })();
</script>
```

### Netlify Environment Variable

1. **Netlify Dashboard** → Deine Site → **Site settings**
2. **Environment variables** → **Add a variable**
3. Key: `SENTRY_DSN_FRONTEND`
4. Value: `https://4227b5fc2fd69a62ae968aa19efae5c7@o4511226172145664.ingest.de.sentry.io/4511226207797328`
5. **Save**

Der Build-Prozess (`scripts/inject-env.js`) ersetzt automatisch den Platzhalter mit dem echten DSN.

---

## 🚀 GitHub Actions Update

Update `.github/workflows/deploy.yml`:

```yaml
- name: Deploy Backend to Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
  run: |
    npm i -g @railway/cli
    railway up --service backend
```

---

## 🔍 Testen ob Sentry funktioniert

### Backend Test
GitHub Actions deployt automatisch und injiziert die Sentry DSNs:

**Backend:** Railway erhält `SENTRY_DSN_BACKEND` als Environment Variable
**Frontend:** Build-Script injiziert `SENTRY_DSN_FRONTEND` in index.html

Die Workflow-Datei `.github/workflows/deploy.yml` ist bereits konfiguriert. Frontend Test

Öffne ein Photo-Import oder Link-Import → Sollte API Error auslösen → Sentry trackt es

---

## 📊 Sentry Dashboard Nutzen

Nach erstem Error im Dashboard:

1. **Issues**: Alle gefundenen Errors
2. **First Seen / Last Seen**: Wann der Error zuerst / zuletzt auftrat
3. **Assignee**: Dem Team-Member zuweisen
4. **Status**: Resolve / Ignore / Delete
5. **Breadcrumbs**: Was vorher passiert ist
6. **Stack Trace**: Wo genau der Error war
7. **Tags**: Filter nach User, Browser, etc.

---

## 🔔 Sentry Alerts konfigurieren

1. **Sentry Dashboard → Alerts**
2. **New Alert Rule**
   - Trigger: When an event is tagged with...
   - Action: Send to Slack / Email
3. Speichern

---

## 💰 Sentry Pricing

- **Free Plan**: 5,000 errors/monat ✅ (für Hobby-App perfekt)
- **Pro**: $29/monat (100k+ errors)
- **Enterprise**: Custom

---

## ✅ Checklist für Complete Setup

- [ ] Sentry Account erstellt
- [ ] Project erstellt
- [ ] DSN kopiert
- [ ] GitHub Secrets hinzugefügt (SENTRY_DSN, SENTRY_ENVIRONMENT)
- [ ] Backend: @sentry/node installiert
- [ ] Backend: Sentry.init() hinzugefügt
- [ ] Frontend: @sentry/vue installiert (optional)
- [ ] .env.local mit SENTRY_DSN aktualisiert
- [ ] GitHub Actions deploy.yml aktualisiert
- [ ] Railway Environment Variables aktualisiert (SENTRY_DSN)
- [ ] Error getestet → Im Sentry Dashboard sichtbar?
- [ ] Slack Notification (optional) konfiguriert

---

## 🚨 Häufige Fehler

### "DSN is empty"
```
→ backend/.env.local nicht gesetzt
→ oder GitHub Secret nicht aktualisiert
→ Check: echo $SENTRY_DSN
```

### "Errors nicht in Sentry sichtbar"
```
→ DSN falsch kopiert?
→ environment: 'production' aber NODE_ENV=development?
→ Sentry.init() nicht aufgerufen?
→ Check Sentry.io → Issues (sollte leer sein bis Error kam)
```

### "Rate Limiting"
```
→ Zu viele Errors → Dashboard zeigt Sampling
→ Das ist normal für Free Plan
→ Pro Plan für unlimitierte Errors
```

---

## 📞 Support

- Sentry Docs: https://docs.sentry.io/
- GitHub Issues: https://github.com/getsentry/sentry-javascript/issues
- Community: https://forum.sentry.io/

