# 📋 Next Steps - Verbleibende Features

> Archiv-Hinweis (2026-05-31): Diese Datei ist historisch und wird nicht mehr aktiv gepflegt.
> Bitte nutze fuer den aktuellen Stand und die priorisierten Aufgaben ausschliesslich `ARCHITECTURE_STATUS.md`.

## Status nach Phase 2.5.1 ✅

### Was funktioniert:
- ✅ **Nuxt 3 Migration komplett** (alle Core-Features)
- ✅ **Bottom Navigation** (Instagram-Style)
- ✅ **Kategorie-Filter** mit Tag-Matching
- ✅ **Plus Button** korrekt positioniert
- ✅ **KI-Koch Foto-Analyse** (Claude Vision)
- ✅ **Recipe CRUD** (Create, Read, Update, Delete)
- ✅ **Import:** URL & Text Import via Settings
- ✅ **Auth:** Login/Register + Google OAuth
- ✅ **Supabase Integration** vollständig

### Was fehlt (aus alter App):

---

## 🛒 Phase 2.5.2: Bring! Integration

**Aufwand:** ~2-3 Stunden  
**Priorität:** Hoch (User nutzt es aktiv)

### Komponenten:

#### 1. **useBring() Composable** (~30 min)
```typescript
// frontend/composables/useBring.ts
- bringLogin(email, password)
- bringGetLists()
- bringSelectList(listId)
- bringAddItems(items[])
- bringLogout()
- getBringData() // from user metadata
```

#### 2. **Bring Settings UI** (~1 Stunde)
```vue
// frontend/pages/settings.vue - neuer Abschnitt
- Login Modal (Email + Password)
- Listen-Auswahl Dropdown
- Status anzeigen (connected/disconnected)
- Logout Button
```

#### 3. **Export Button in Recipe Detail** (~30 min)
```vue
// frontend/pages/recipe/[id].vue
- Button "🛒 Zu Bring! hinzufügen"
- Nur sichtbar wenn Bring! connected
- Zutaten als Items exportieren
```

#### 4. **Backend Bring Proxy** (~30 min)
```typescript
// backend/src/index.ts - /api/bring endpoint
- POST /api/bring/login
- GET /api/bring/lists
- POST /api/bring/items
```

**Referenz:** 
- Alte App: `js/app.js` Zeilen 1095-1300
- Backend Proxy: `supabase/functions/bring-proxy/index.ts`

---

## 📱 Phase 2.5.3: Erweiterte Import-Optionen

**Aufwand:** ~1-2 Stunden  
**Priorität:** Mittel

### Features:

#### 1. **Instagram/TikTok/YouTube URL Import** (~1 Stunde)
- Settings: Import-Modal erweitern
- Claude: URL → Rezept extrapolieren
- Problem: Kein direkter Scraping-Zugriff
  - Lösung: Claude "halluziniert" plausibles Rezept basierend auf URL-Pattern
  
#### 2. **ChatGPT-Verlauf Import** (~30 min)
- Copy & Paste von ChatGPT-Konversationen
- Claude extrahiert Rezepte aus Gesprächstext

**Referenz:**
- Alte App: `js/app.js` - `startLinkImport()`, `processImport()`

---

## 🎨 Phase 2.5.4: KI-Bildgenerierung (Pollinations API)

**Aufwand:** ~30-60 min  
**Priorität:** Mittel-Niedrig

### Implementation:

#### 1. **Auto-Generate beim Speichern** (~30 min)
```typescript
// frontend/pages/recipe/[id]/edit.vue
- Nach Rezept-Speichern automatisch Bild generieren
- Pollinations API: https://image.pollinations.ai/prompt/{title}?width=800&height=600
```

#### 2. **Backend Image Proxy** (bereits vorhanden!)
```typescript
// backend/src/index.ts - /api/image-proxy
- Proxied Pollinations wegen CORS
- Bereits implementiert für generateRecipeImage()
```

**Referenz:**
- Alte App: `js/app.js` - `generateRecipeImage()`

---

## 🐛 Phase 2.5.5: Testing & Bugfixes

**Aufwand:** ~1-2 Stunden  
**Priorität:** Hoch (vor Production)

### Checklist:

- [ ] **Filter-Test:** Alle Kategorien durchklicken
- [ ] **CRUD-Test:** Rezept erstellen/bearbeiten/löschen
- [ ] **Import-Test:** URL, Text, Foto-Import
- [ ] **AI-Test:** Foto-Analyse, Rezeptvorschläge
- [ ] **Auth-Test:** Login, Logout, Google OAuth
- [ ] **Responsive:** Mobile, Tablet, Desktop
- [ ] **PWA:** Offline-Funktionalität
- [ ] **Performance:** Lazy Loading, Image Optimization

### Bekannte Bugs:
- None (Stand: Phase 2.5.1)

---

## 📦 Phase 3: Production Readiness

**Nach Completion von 2.5.2-2.5.5**

### Tasks:
1. **Environment Variables** für Production
2. **Netlify Deployment** (Frontend)
3. **Railway Deployment** (Backend)
4. **GitHub Secrets** Setup
5. **Monitoring:** Sentry Testing
6. **Documentation:** README Update

---

## 🔧 Implementation Hints

### Bring! API Endpoints:
```typescript
// Basis-URL via Proxy
const BRING_API = '/api/bring'

// Login
POST /api/bring/login
Body: { email, password }
Response: { uuid, token, name }

// Listen abrufen
GET /api/bring/lists
Headers: { Authorization: Bearer ${token} }
Response: { lists: [{ listUuid, name }] }

// Items hinzufügen
POST /api/bring/items
Body: { listUuid, items: ['Tomaten', 'Zwiebeln'] }
```

### User Metadata Structure:
```typescript
// Supabase user.user_metadata
{
  bring_uuid: string
  bring_token: string
  bring_name: string
  bring_selected_list: string
}
```

---

## 📚 Code-Referenzen

**Alte App (Vollständig funktionierend):**
- `/js/app.js` - Alle Features implementiert
- `/supabase/functions/bring-proxy/` - Backend Proxy

**Neue Nuxt App (Migration in Progress):**
- `/frontend/` - Nuxt 3 App
- `/backend/` - Hono Backend

**Dokumentation:**
- `/PROJECT_STATUS.md` - Aktueller Status
- `/MIGRATION_PLAN.md` - Original Migration Plan
- `/DEPLOYMENT.md` - Deployment-Anleitung

---

## 🎯 Nächste Session: Empfohlene Reihenfolge

1. **Start:** Bring! Integration (wichtigstes fehlendes Feature)
2. **Dann:** KI-Bildgenerierung (schneller Win)
3. **Optional:** Erweiterte Imports
4. **Abschluss:** Testing & Bugfixes

**Geschätzte Gesamtzeit:** 4-6 Stunden

---

_Erstellt: 16.04.2026 nach Phase 2.5.1_
_Nächstes Update: Nach Completion von 2.5.2_
