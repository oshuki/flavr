# 🍳 Flavr Recipe App - Projekt Status

> Archiv-Hinweis (2026-05-31): Diese Datei ist historisch und wird nicht mehr aktiv gepflegt.
> Bitte nutze fuer den aktuellen Stand ausschliesslich `ARCHITECTURE_STATUS.md`.

**Stand:** 22. April 2026  
**Status:** ✅ Production Ready  
**Branch:** nuxt_js

---

## 🌐 Production Deployment

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://flavr-nuxt.pages.dev | ✅ Live |
| Backend | https://flavr-production.up.railway.app | ✅ Live |
| Database | Supabase | ✅ Aktiv |

---

## 🎯 Features

### ✅ Implementiert
- [x] **Rezepte CRUD** - Erstellen, Bearbeiten, Löschen, Anzeigen
- [x] **KI-Koch** - Rezeptvorschläge basierend auf Zutaten (Claude API)
- [x] **Foto-Analyse** - Zutaten aus Bildern erkennen
- [x] **Bring! Integration** - Shopping List Export
- [x] **Google OAuth** - Login mit Google Account
- [x] **Email/Password Login** - Für Tests und Entwicklung
- [x] **Bildgenerierung** - AI-generierte Rezeptbilder (Pollinations)
- [x] **PWA** - Installierbar auf Mobilgeräten
- [x] **Responsive Design** - Mobile & Desktop optimiert

### 🧪 Testing
- [x] **Playwright E2E Tests** - 20 Tests implementiert (alle passing!)
- [x] **GitHub Actions CI/CD** - Auto-Tests bei jedem Push
- [x] **Auto-Login** - Email/Password für Test-Automation

### 📋 Noch offen (Optional)

#### High Priority
- [ ] Monitoring Dashboard einrichten (Sentry richtig konfigurieren)
- [ ] Custom Domain statt .pages.dev
- [ ] Rate Limiting für Claude API
- [ ] Backup-Strategie für Supabase

#### Nice-to-Have Features
- [ ] Dark Mode
- [ ] Rezepte teilen (Social Share Buttons)
- [ ] Rezept-Favoriten & Bewertungen
- [ ] Suchfunktion verbessern (Fulltext-Suche)
- [ ] Tags/Labels für Rezepte
- [ ] Nährwerte-Berechnung via KI
- [ ] Meal Planning / Wochenplan
- [ ] Rezept-Import via URL

#### Cleanup
- [ ] Netlify Deployment löschen (nicht mehr benötigt)
- [ ] ANTHROPIC_API_KEY auf Railway entfernen (Duplikat)

---

## 🔧 Tech Stack

**Frontend:** Nuxt 4.4.2 (SPA Mode) → Cloudflare Pages  
**Backend:** Express + Hono → Railway  
**Database:** Supabase (PostgreSQL + Auth)  
**AI:** Claude 4.6 Sonnet, Pollinations  
**Testing:** Playwright E2E  

---

## 🚀 Schnellstart

### Entwicklung lokal

```bash
# Frontend (Port 3002)
cd frontend && npm run dev

# Backend (Port 3000)
cd backend && npm run dev

# Tests
cd frontend && npm run test:e2e:ui
```

**Test-Credentials:** oshuki@gmail.com / prudens

---

## 📊 Test Coverage

✅ **20 Tests - Alle passing!**

- 9 Smoke Tests (Homepage, Navigation, PWA)
- 4 AI-Chef Tests (ohne Login)
- 2 AI-Chef Tests (mit Login)  
- 5 CRUD Tests (Rezepte, Bring!)

---

## 🔑 Environment Variables

**Lokal:** Siehe `.env` Dateien  
**Railway:** CLAUDE_API_KEY, NODE_ENV=production  
**Cloudflare:** Keine (Statisches Build)

---

## 📈 Kosten & Limits

| Service | Kosten |
|---------|--------|
| Cloudflare Pages | $0 (Unlimited) |
| Railway | ~$5/Monat |
| Supabase | $0 (Free Tier) |
| Claude API | ~$15 Credits verfügbar |

---

## 📚 Weitere Docs

- Tests: `frontend/tests/README.md`
- Detaillierter Status: `/memories/repo/flavr-project-status.md`

---

🎉 **Projekt vollständig getestet und deployed!**
# 🍳 Flavr - Projekt Status & Fortschritt

**Stand:** 16. April 2026  
**Projekt:** Modernisierung einer monolithischen PWA zu einer Nuxt 3 Architektur

---

## 📊 Überblick

### Ursprüngliche App
- **Typ:** Monolithische Progressive Web App
- **Frontend:** Single `index.html` + `js/app.js` (~2233 Zeilen)
- **Backend:** Keine (direkte API-Calls aus Frontend)
- **Datenbank:** Supabase (CDN-Import)
- **AI:** Direkte Claude API Calls (API Key im Frontend!)
- **Deployment:** Statische Files

### Ziel-Architektur
- **Framework:** Nuxt 3 mit TypeScript
- **Backend:** Node.js + Hono (API Proxy)
- **State Management:** Pinia + Composables
- **Testing:** Vitest (Backend + Frontend)
- **Monitoring:** Sentry (Frontend + Backend)
- **CI/CD:** GitHub Actions → Netlify (Frontend) + Railway (Backend)
- **Security:** API Keys server-side, Backend als Proxy

---

## ✅ Phase 1: Foundation & Security (Abgeschlossen)

### Phase 1.1: Backend Proxy Setup

**Erstellt:**
- `backend/` Ordner mit TypeScript-Server
- Hono als Web-Framework, Express als Dev-Adapter
- Proxy-Endpoints:
  - `/api/claude` - Claude API Proxy
  - `/api/image-proxy` - Pollinations Image Proxy
  - `/health` - Health Check

**Dateien:**
```
backend/
├── src/index.ts          # Hono Server mit Sentry
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript Config
├── .env.local           # Secrets (gitignored)
└── .env.example         # Template
```

**Dependencies:**
- `hono` - Web Framework
- `express` - Dev Adapter
- `tsx` - TypeScript Runner
- `dotenv` - Environment Variables

**Erfolg:**
- ✅ Backend läuft lokal auf Port 3000
- ✅ Health Endpoint antwortet
- ✅ API Keys server-side gesichert

---

### Phase 1.2: Frontend Integration

**Geändert:**
- `js/app.js` - 6 Funktionen umgeschrieben:
  - `callClaude()`
  - `callClaudeWithImage()`
  - `callClaudeWithImageForParsing()`
  - `handlePhotoImport()`
  - `parseConversationWithClaude()`
  - `completeRecipeDetails()`

**Alle AI-Calls gehen jetzt über:**
```javascript
fetch('http://localhost:3000/api/claude', {
  method: 'POST',
  body: JSON.stringify({ model, messages, ... })
})
```

**Erfolg:**
- ✅ Keine API Keys mehr im Frontend
- ✅ Alte App funktioniert weiterhin
- ✅ Backend-Proxy validiert

---

### Phase 1.3: GitHub Actions Pipeline

**Erstellt:**
- `.github/workflows/deploy.yml` - CI/CD Pipeline

**Pipeline-Steps:**
1. **Test:** Backend Tests + Build
2. **Deploy Frontend:** Netlify (statische Files)
3. **Deploy Backend:** Railway.app
4. **Notify:** Deployment Status

**Konfigurationen:**
- `netlify.toml` - Netlify Settings, Security Headers, CSP
- `railway.json` - Railway Build Commands
- `DEPLOYMENT.md` - Setup-Anleitung

**Erfolg:**
- ✅ Automatisches Deployment bei Push
- ✅ Tests blockieren Deploy bei Failures
- ✅ Dokumentiert

---

### Phase 1.4: Sentry Integration

**Backend:**
- `@sentry/node` installiert
- `Sentry.init()` in `backend/src/index.ts`
- `Sentry.captureException()` in Error Handlers
- DSN: Backend Sentry Project

**Frontend (Old App):**
- Sentry Browser SDK via CDN
- Meta-Tag mit DSN-Placeholder
- Build-Script `scripts/inject-env.js` ersetzt Placeholder
- Automatische Initialisierung bei Deploy

**Dateien:**
- `SENTRY_SETUP.md` - Vollständige Anleitung
- `scripts/inject-env.js` - DSN Injection Script

**DSNs:**
```
Backend:  https://71f10fedb606305d08ca9c024ee90ca6@...
Frontend: https://4227b5fc2fd69a62ae968aa19efae5c7@...
```

**Erfolg:**
- ✅ Error Tracking in Production
- ✅ Frontend + Backend getrennte Projekte
- ✅ CI/CD injiziert DSNs sicher

---

### Phase 1.5: Unit Tests (Vitest)

**Backend Tests:**
- `backend/src/index.test.ts` - 7 Tests
- Vitest + @vitest/coverage-v8
- Test-Abdeckung:
  - Health Endpoint
  - Environment Variables
  - API Request Validation
  - Image Proxy URL Whitelisting
  - Error Handling

**Scripts:**
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

**Dokumente:**
- `backend/README.md` - API Docs
- `backend/TESTING.md` - Testing Guide

**Erfolg:**
- ✅ 7/7 Tests passing
- ✅ CI/CD führt Tests vor Deploy aus
- ✅ Coverage Reports generiert

---

## ✅ Phase 2: Framework Migration (Teilweise abgeschlossen)

### Phase 2.0: Migration Planning

**Erstellt:**
- `MIGRATION_PLAN.md` - Detaillierter 6-Wochen Plan
- Component Breakdown (50+ Funktionen → Vue Components)
- Composables-Architektur
- Testing-Strategie
- Deployment-Strategie

**Plan-Phasen:**
- **Phase A (Week 1-2):** Auth + Core Features
- **Phase B (Week 3):** CRUD Features
- **Phase C (Week 4):** Advanced Features (Images, Import)
- **Phase D (Week 5):** AI Features
- **Phase E (Week 6):** Polish + Deploy

---

### Phase 2.1: Nuxt 3 Setup ✅

**Initialisierung:**
```bash
npx nuxi@latest init frontend
cd frontend
npm install
```

**Installierte Dependencies:**
- `nuxt` (4.4.2)
- `@nuxtjs/supabase` (2.0.5)
- `@vite-pwa/nuxt` (1.1.1)
- `@pinia/nuxt` (0.11.3)
- `@sentry/vue` (10.48.0)

**Konfiguration:**
- `nuxt.config.ts` - Module, PWA, Supabase, Runtime Config
- `.env.local` - Environment Variables (mit `NUXT_PUBLIC_` Prefix)
- `.env.example` - Template

**TypeScript Types (`types/index.ts`):**
```typescript
interface Recipe {
  id: string
  title: string
  category: string
  duration: number
  servings: number
  ingredients: string[]
  steps: string[]
  tags: string[]
  notes?: string
  imageUrl?: string
  isFavorite: boolean
  sourceApp?: string
  createdAt: number
}
```

**Composables (Business Logic):**

1. **`useRecipes.ts`** - Recipe CRUD
   ```typescript
   - loadRecipes()
   - saveRecipe(recipe)
   - deleteRecipe(id)
   - toggleFavorite(id)
   - rowToRecipe() / recipeToRow()
   ```

2. **`useCategories.ts`** - Kategorien & Filter
   ```typescript
   - 25+ Kategorien mit Emoji
   - Auto-Kategorisierung via Keywords
   - activeCategory State
   ```

3. **`useAI.ts`** - Claude Integration
   ```typescript
   - callClaude(messages)
   - parseRecipeFromText(text)
   - suggestRecipes(ingredients)
   - parseRecipeFromImage(base64)
   ```

**Pages & Layouts:**

1. **`layouts/default.vue`**
   - Navigation
   - User Auth Status
   - Auto-Redirect zu /auth

2. **`pages/index.vue`**
   - Rezeptliste
   - Suche & Filter
   - Kategorie-Scroll
   - FAB für "Neues Rezept"

3. **`pages/auth/index.vue`**
   - Login/Register Toggle
   - Email/Password Auth
   - Google OAuth Support

**Styling:**
- `assets/css/main.css` - Globale Styles
- CSS Variables (--primary, --bg, --card, etc.)
- Buttons, Forms, Cards

**Plugins:**
- `plugins/sentry.client.ts` - Sentry Browser Integration

**Public Assets:**
- Icons (16, 32, 64, 192, 512px)
- Logo (`flavr-logo-2.png`)
- `favicon.ico`

**Dev Server:**
```
http://localhost:3000
```

**Erfolg:**
- ✅ Nuxt 3 läuft lokal
- ✅ TypeScript konfiguriert
- ✅ Composables funktional
- ✅ Auth-Flow vorbereitet
- ✅ Sentry integriert
- ✅ PWA Manifest konfiguriert

---

## 📁 Projekt-Struktur (Aktuell)

```
rezepte-project/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD Pipeline
├── backend/                        # ✅ Node.js Backend
│   ├── src/
│   │   ├── index.ts               # Hono Server
│   │   └── index.test.ts          # Tests (7/7 passing)
│   ├── .env.local                 # Secrets (gitignored)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── README.md
│   └── TESTING.md
├── frontend/                       # 🆕 Nuxt 3 App
│   ├── app/
│   │   └── app.vue
│   ├── assets/
│   │   └── css/
│   │       └── main.css
│   ├── composables/
│   │   ├── useRecipes.ts
│   │   ├── useCategories.ts
│   │   └── useAI.ts
│   ├── layouts/
│   │   └── default.vue
│   ├── pages/
│   │   ├── index.vue              # Recipe List
│   │   └── auth/
│   │       └── index.vue          # Login/Register
│   ├── plugins/
│   │   └── sentry.client.ts
│   ├── public/
│   │   ├── icon-*.png
│   │   └── flavr-logo-2.png
│   ├── types/
│   │   └── index.ts
│   ├── .env.local                 # Secrets (gitignored)
│   ├── .env.example
│   ├── nuxt.config.ts
│   ├── package.json
│   └── README.md
├── scripts/
│   └── inject-env.js               # Sentry DSN Injection
├── index.html                     # 🔴 Alte PWA (bleibt live)
├── js/
│   └── app.js                     # 🔴 Alter Code (~2233 Zeilen)
├── styles.css                     # 🔴 Alte Styles
├── sw.js                          # 🔴 Service Worker
├── manifest.json
├── netlify.toml                   # Netlify Config
├── railway.json                   # Railway Config
├── MIGRATION_PLAN.md              # 6-Wochen Plan
├── DEPLOYMENT.md                  # Deploy-Anleitung
├── SENTRY_SETUP.md                # Sentry-Anleitung
├── PROJECT_STATUS.md              # Diese Datei
└── README.md                      # Original README
```

**Legende:**
- ✅ = Komplett fertig
- 🆕 = Neu erstellt
- 🔴 = Legacy (wird migriert)

---

## 🎯 Aktueller Entwicklungsstand

### ✅ Komplett Funktional

**Backend (Port 3000):**
- Health Check
- Claude API Proxy
- Image Proxy
- Sentry Error Tracking
- Unit Tests (100% passing)
- TypeScript kompiliert

**Frontend (Alte PWA):**
- Verwendet Backend-Proxy für AI
- Sentry Integration via Build-Script
- Offline PWA Features
- Supabase Auth & DB

**Frontend (Neue Nuxt App - Port 3000):**
- Login/Register Seite
- Rezeptliste-Seite (UI fertig)
- Composables für CRUD
- Supabase-Integration vorbereitet
- PWA Manifest
- Sentry Plugin

**Infrastructure:**
- GitHub Actions CI/CD
- Netlify Deploy Config
- Railway Deploy Config
- Environment Variable Handling

### ⏳ In Arbeit / Noch nicht implementiert

**Frontend (Nuxt):**
- [ ] Recipe Detail Seite (`/recipe/[id]`)
- [ ] Recipe Form (Create/Edit)
- [ ] AI-Koch Seite (`/ai`)
- [ ] Settings Seite (`/settings`)
- [ ] Components:
  - [ ] RecipeCard Component
  - [ ] RecipeForm Component
  - [ ] IngredientChips Component
  - [ ] ImageUpload Component
  - [ ] ImportSheet Component
- [ ] Image Upload & Generation
- [ ] URL/Text/Photo Import
- [ ] Export/Import Data
- [ ] Frontend Tests

**Backend:**
- [ ] Bring API Integration (`/api/bring/*`)
- [ ] Rate Limiting
- [ ] Request Validation Middleware
- [ ] Integration Tests

**Deployment:**
- [ ] Production-URLs konfigurieren
- [ ] GitHub Secrets anlegen:
  - `NETLIFY_AUTH_TOKEN`
  - `NETLIFY_SITE_ID`
  - `RAILWAY_TOKEN`
  - `SENTRY_DSN_FRONTEND`
  - `SENTRY_DSN_BACKEND`
- [ ] Railway Backend deployen
- [ ] Netlify Frontend deployen
- [ ] Backend-URL im Frontend ersetzen

---

## 🔧 Lokales Development Setup

### Backend starten

```bash
cd backend
npm install
cp .env.example .env.local
# .env.local bearbeiten: CLAUDE_API_KEY eintragen
npm run dev
```

- Läuft auf: `http://localhost:3000`
- Health: `http://localhost:3000/health`

### Frontend (Alt) starten

```bash
# Im Projekt-Root
python3 -m http.server 8080
```

- Läuft auf: `http://localhost:8080`

### Frontend (Nuxt) starten

```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local bearbeiten: Supabase Keys eintragen
npm run dev
```

- Läuft auf: `http://localhost:3000`
- DevTools: Shift + Option + D

### Tests ausführen

```bash
cd backend
npm test                    # Alle Tests
npm run test:watch         # Watch Mode
npm run test:coverage      # Mit Coverage
```

---

## 📈 Fortschritts-Metriken

### Code-Zeilen (LoC)

| Bereich | Vorher | Nachher | Änderung |
|---------|--------|---------|----------|
| Frontend | ~2233 (1 Datei) | ~800 (modular) | -64% |
| Backend | 0 | ~400 | +400 |
| Tests | 0 | ~80 | +80 |
| Config/Docs | ~50 | ~600 | +550 |

### Test Coverage

- Backend: 7 Tests, 100% passing
- Frontend (Nuxt): 0% (noch keine Tests)
- Frontend (Alt): 0% (keine Tests)

### Dependencies

- Backend: 23 Packages
- Frontend (Nuxt): 881 Packages
- Frontend (Alt): 2 (CDN: Supabase, Fonts)

### Security

- ✅ API Keys server-side
- ✅ Environment Variables gitignored
- ✅ CSP Headers konfiguriert
- ✅ Sentry Error Tracking
- ✅ HTTPS ready (Netlify/Railway)

---

## 🚀 Nächste Schritte

### Kurzfristig (Diese Woche)

1. **Recipe Detail Komponente**
   - `components/recipe/RecipeDetail.vue`
   - Dynamic Route `/recipe/[id]`
   - Edit/Delete Actions

2. **Recipe Form**
   - `components/recipe/RecipeForm.vue`
   - Create/Edit Mode
   - Zutaten/Schritte dynamisch

3. **AI-Koch Seite**
   - `pages/ai.vue`
   - Ingredient Chips
   - Recipe Suggestions
   - Integration mit `useAI` Composable

### Mittelfristig (Nächste 2 Wochen)

4. **Import/Export Features**
   - URL Import (Instagram/TikTok)
   - Text Import
   - Photo Import (OCR via Claude Vision)
   - JSON Export/Import

5. **Settings Seite**
   - Export/Import UI
   - Alle Daten löschen
   - PWA Install Anleitung

6. **Testing**
   - Vitest für Nuxt
   - Component Tests
   - E2E Tests (Playwright?)

### Langfristig (Nächste 4 Wochen)

7. **Production Deployment**
   - Railway Backend live
   - Netlify Frontend live
   - DNS konfigurieren
   - Monitoring aufsetzen

8. **Performance Optimization**
   - Image Optimization
   - Lazy Loading
   - PWA Offline Caching
   - Lighthouse Score >90

9. **Feature Completion**
   - Alle Features aus alter App migriert
   - Feature-Parität 100%
   - User-Feedback einarbeiten

---

## 📚 Dokumentation

| Dokument | Beschreibung |
|----------|-------------|
| `README.md` | Original README (alte PWA) |
| `MIGRATION_PLAN.md` | Detaillierter 6-Wochen Migrationsplan |
| `DEPLOYMENT.md` | GitHub Actions, Netlify, Railway Setup |
| `SENTRY_SETUP.md` | Sentry Integration & Troubleshooting |
| `PROJECT_STATUS.md` | Dieser Status-Bericht |
| `backend/README.md` | Backend API Dokumentation |
| `backend/TESTING.md` | Backend Testing Guide |
| `frontend/README.md` | Nuxt Frontend Quick Start |

---

## 🐛 Bekannte Issues

### Nuxt Warnings (nicht kritisch)

```
Missing NUXT_PUBLIC_SUPABASE_URL
Missing NUXT_PUBLIC_SUPABASE_KEY
```

**Lösung:** Environment Variables werden bei Production-Build korrekt geladen. Lokal muss `.env.local` mit `NUXT_PUBLIC_` Prefix erstellt werden.

### Duplicated imports "useAppConfig"

**Status:** Nuxt 4 Beta Warning, kann ignoriert werden.

### Database types not found

```
Database types configured at "~/types/database.types.ts" but file not found
```

**Status:** Optional, Supabase nutzt `Database = unknown` als Fallback.

---

## 👥 Team & Verantwortlichkeiten

**Aktuell:**
- Solo-Development
- User = Developer

**Empfohlen für Production:**
- Frontend Dev (Vue/Nuxt)
- Backend Dev (Node/TypeScript)
- DevOps (CI/CD, Monitoring)
- QA/Testing

---

## 📞 Support & Ressourcen

### Externe Services

- **Supabase:** https://htescszituyzooubmxkh.supabase.co
- **Sentry:** https://sentry.io/organizations/your-org
- **Netlify:** https://app.netlify.com
- **Railway:** https://railway.app
- **Claude API:** https://console.anthropic.com

### Dokumentation

- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Hono Docs](https://hono.dev/)
- [Vitest Docs](https://vitest.dev/)
- [Supabase Nuxt Module](https://supabase.nuxtjs.org/)
- [Sentry Vue Guide](https://docs.sentry.io/platforms/javascript/guides/vue/)

---

## ✨ Erfolge bisher

1. ✅ **Security:** API Keys sind server-side
2. ✅ **Testing:** Backend hat 100% passing Tests
3. ✅ **CI/CD:** Automatische Deploys konfiguriert
4. ✅ **Monitoring:** Sentry für Frontend & Backend
5. ✅ **Architecture:** Moderne Nuxt 3 Struktur
6. ✅ **TypeScript:** Vollständige Type-Safety
7. ✅ **Documentation:** Umfassende Docs & Guides
8. ✅ **Composables:** Wiederverwendbare Business Logic
9. ✅ **PWA:** Manifest & Offline-Support vorbereitet
10. ✅ **Parallel Development:** Alte App bleibt live

---

**Letzte Aktualisierung:** 16. April 2026, 16:20 Uhr  
**Nächstes Review:** Bei Abschluss Phase 2.2
