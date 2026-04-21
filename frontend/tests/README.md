# E2E Testing mit Playwright

Automatisierte End-to-End Tests für die Flavr Recipe App.

## 📋 Test-Übersicht

### Smoke Tests (`01-smoke.spec.ts`)
- ✅ Homepage lädt erfolgreich
- ✅ Navigation funktioniert
- ✅ Responsive Layout (Desktop/Mobile)
- ✅ Login-Seite erreichbar
- ✅ PWA Manifest verfügbar
- ✅ Service Worker funktioniert (nur HTTPS/Production)

### KI-Koch Tests (`02-ai-chef.spec.ts`)
- ✅ AI-Seite lädt
- ✅ Zutaten-Eingabe
- ✅ KI-Vorschläge anfragen
- ✅ Bild-Upload UI vorhanden
- ✅ Rezept übernehmen (Mock)

### Rezepte CRUD Tests (`03-recipes-crud.spec.ts`) **[Benötigt Login]**
- ⏭️ Rezept-Übersicht anzeigen
- ⏭️ Neues Rezept erstellen
- ⏭️ Rezept bearbeiten
- ⏭️ Rezept löschen
- ⏭️ Bring! Shopping List Integration

> **Hinweis:** Authentifizierte Tests sind aktuell übersprungen (`.skip()`), da OAuth-Integration komplex ist. Für CI/CD müssten Test-Credentials oder Mocking eingerichtet werden.

## 🚀 Lokale Ausführung

### Voraussetzungen
```bash
cd frontend
npm install
npx playwright install chromium
```

### Tests ausführen

**Gegen Production:**
```bash
# Alle Tests headless
npm run test:e2e

# Mit UI (interaktiv)
npm run test:e2e:ui

# Mit Browser-Fenster (sichtbar)
npm run test:e testing:headed

# Nur ein spezifischer Test
npx playwright test 01-smoke.spec.ts
```

**Gegen lokalen Dev-Server:**
```bash
# Terminal 1: Dev-Server starten
npm run dev

# Terminal 2: Tests ausführen (läuft automatisch gegen localhost:3002)
npm run test:e2e
```

### Test-Report anzeigen
```bash
npm run test:e2e:report
```

## 🔧 Konfiguration

Die Test-Konfiguration befindet sich in `playwright.config.ts`:

- **Base URL:** Standardmäßig `http://localhost:3000`, überschreibbar via `PLAYWRIGHT_TEST_BASE_URL`
- **Browser:** Chromium (weitere können in Config aktiviert werden)
- **Timeout:** 30 Sekunden pro Test
- **Retry:** Auf CI 2x, lokal 0x
- **Screenshots:** Bei Fehlern
- **Videos:** Bei Fehlern
- **Traces:** Beim ersten Retry

## 🎬 CI/CD (GitHub Actions)

Tests laufen automatisch bei:
- Push auf `main` oder `nuxt_js`
- Pull Requests
- Manueller Trigger (Workflow Dispatch)

### Workflow-Jobs:
1. **test:** Testet gegen Production (`https://flavr-nuxt.pages.dev`)
2. **test-dev:** Baut die App und testet gegen lokalen Server (nur auf `nuxt_js`)

### Artefakte:
- **playwright-report:** HTML-Report (7 Tage)
- **playwright-videos:** Test-Videos bei Fehlern (3 Tage)

## 📝 Neue Tests hinzufügen

Erstelle eine neue Datei in `tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Mein Feature', () => {
  test('sollte funktionieren', async ({ page }) => {
    await page.goto('/meine-seite')
    await expect(page.locator('h1')).toContainText('Überschrift')
  })
})
```

**Best Practices:**
- Verwende semantische Locators: `getByRole`, `getByLabel`, `getByText`
- Vermeide CSS-Selektoren wenn möglich
- Nutze `test.describe()` für Gruppierung
- Verwende `test.beforeEach()` für Setup
- Markiere Auth-Tests mit `.skip()` oder separatem storageState

## 🔐 Authentifizierte Tests

Für echte CRUD-Tests mit Supabase Auth gibt es drei Ansätze:

### Option 1: Auth-Token extrahieren (Empfohlen für lokale Tests)

1. **Einloggen:**
   ```bash
   npm run dev
   ```
   Öffne http://localhost:3002 und logge dich ein mit:
   - Email: `oshuki@gmail.com`
   - Password: `prudens`

2. **Token extrahieren:**
   - Öffne DevTools (F12) → Console
   - Führe aus:
     ```javascript
     localStorage.getItem('sb-htescszituyzooubmxkh-auth-token')
     ```
   - Kopiere den kompletten Token (JSON-String)

3. **Token als ENV variable setzen:**
   ```bash
   export SUPABASE_TEST_TOKEN='{"access_token":"...", ...}'
   npm run test:e2e
   ```

### Option 2: `.env.test` Datei (Lokal)

Erstelle `frontend/.env.test`:
```bash
SUPABASE_TEST_TOKEN='{"access_token":"...", ...}'
TEST_USER_EMAIL=oshuki@gmail.com
TEST_USER_PASSWORD=prudens
```

Dann:
```bash
source frontend/.env.test
npm run test:e2e
```

### Option 3: CI/CD (GitHub Secrets)

Für GitHub Actions:
1. Gehe zu Repository Settings → Secrets and variables → Actions
2. Füge hinzu:
   - `SUPABASE_TEST_TOKEN`: Dein extrahierter Token
3. Tests laufen dann automatisch mit Auth

**WICHTIG:** Der Token läuft nach einiger Zeit ab. Bei Fehlern neuen Token extrahieren!

### Tests ohne Auth ausführen

Alle Auth-Tests werden automatisch übersprungen, wenn kein Token gesetzt ist:
```bash
# Nur nicht-authentifizierte Tests
npm run test:e2e
```

Oder explizit skippen:
```bash
SKIP_AUTH_TESTS=true npm run test:e2e
```

## 📊 Test-Coverage

Aktuell getestet:
- ✅ Core Navigation
- ✅ PWA Features
- ✅ KI-Koch (ohne echte API)
- ⚠️ Rezepte CRUD (übersprungen, benötigt Auth)
- ⚠️ Bring! Integration (übersprungen, benötigt Auth)

## 🐛 Debugging

```bash
# UI Mode (interaktiv debuggen)
npm run test:e2e:ui

# Mit Browser-Fenster
npm run test:e2e:headed

# Einzelnen Test debuggen
npx playwright test --debug 01-smoke.spec.ts

# Trace Viewer (nach Fehlern)
npx playwright show-trace test-results/path/to/trace.zip
```

## 📚 Ressourcen

- [Playwright Dokumentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locator API](https://playwright.dev/docs/locators)
- [GitHub Actions Integration](https://playwright.dev/docs/ci-intro)
