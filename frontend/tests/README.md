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

### Rezepte CRUD Tests (`03-recipes-crud.spec.ts`) **[Mit Email/Password Login]**
- ✅ Rezept-Übersicht anzeigen
- ✅ Neues Rezept erstellen
- ✅ Rezept bearbeiten
- ✅ Rezept löschen
- ✅ Bring! Shopping List Integration

### KI-Koch Tests mit Authentication
- ✅ KI-Vorschläge mit echtem Login
- ✅ Generiertes Rezept übernehmen

> **Login:** Alle authentifizierten Tests verwenden automatisch Email/Password-Login (oshuki@gmail.com / prudens)

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

**Gute Nachricht:** Alle authentifizierten Tests funktionieren jetzt out-of-the-box!

Die Tests verwenden automatisch **Email/Password-Login** mit:
- **Email:** `oshuki@gmail.com`
- **Password:** `prudens`

Keine manuelle Konfiguration erforderlich! 🎉

### Test-Credentials ändern

Falls du andere Credentials verwenden möchtest:

```bash
export TEST_USER_EMAIL=deine@email.com
export TEST_USER_PASSWORD=deinpasswort
npm run test:e2e
```

### Wie funktioniert es?

Die Tests:
1. Navigieren zur `/auth` Seite
2. Füllen Email und Password automatisch aus
3. Klicken auf den Login-Button
4. Warten auf erfolgreichen Login
5. Führen dann die authentifizierten Tests aus

Siehe [`tests/helpers/auth.ts`](helpers/auth.ts) für Details.

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
