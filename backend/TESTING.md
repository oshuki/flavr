# 🧪 Testing Guide - Backend

## Test Setup

Das Backend nutzt **Vitest** für Unit Tests.

### Installierte Packages:
- `vitest` - Test Framework (Vite-native, sehr schnell)
- `@vitest/ui` - Web UI für Tests
- `@vitest/coverage-v8` - Code Coverage mit V8

---

## 🚀 Tests ausführen

```bash
cd backend

# Alle Tests einmal laufen lassen
npm test

# Tests in Watch Mode (läuft bei jeder Änderung)
npm run test:watch

# Tests mit Web UI
npm run test:ui

# Tests mit Coverage Report
npm run test:coverage
```

---

## 📁 Test-Struktur

```
backend/
├── src/
│   ├── index.ts          # Haupt-Server-Code
│   └── index.test.ts     # Tests für Server-Logik
├── vitest.config.ts      # Vitest Konfiguration
└── coverage/             # Coverage Reports (gitignored)
```

---

## ✅ Was wird getestet?

### Aktuelle Tests (src/index.test.ts):

1. **Health Endpoint**
   - Überprüft Health-Response-Struktur

2. **Environment Variables**
   - Stellt sicher, dass benötigte ENV-Vars existieren

3. **API Request Validation**
   - Validiert Claude API Request-Format
   - Testet Fehlerbehandlung bei invaliden Requests

4. **Image Proxy URL Validation**
   - Überprüft Whitelisting von erlaubten Hosts
   - Blockt unbekannte/gefährliche URLs

5. **Error Handling**
   - Testet Umgang mit fehlenden API Keys

---

## 📊 Coverage

Coverage Reports werden in `coverage/` generiert:

```bash
npm run test:coverage

# Öffne HTML Report
open coverage/index.html
```

**Ziel:** Mindestens 80% Code Coverage

---

## 🔄 CI/CD Integration

Tests laufen automatisch in GitHub Actions:

```yaml
- name: Run Tests
  run: cd backend && npm test
```

**Deploy wird gestoppt, wenn Tests fehlschlagen.**

---

## 🧩 Neue Tests hinzufügen

### Beispiel: API Endpoint Test

```typescript
import { describe, it, expect } from 'vitest'

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction()
    expect(result).toBe(expected)
  })
})
```

### Best Practices:

- ✅ Ein Test = Eine konkrete Erwartung
- ✅ Aussagekräftige Test-Namen
- ✅ Tests sollten unabhängig voneinander laufen
- ✅ Mocke externe APIs (Anthropic, Pollinations)
- ✅ Teste sowohl Success- als auch Error-Cases

---

## 🎯 Nächste Schritte

- [ ] Integration Tests für HTTP Endpoints (mit Supertest)
- [ ] E2E Tests mit echten API-Calls (in separater Suite)
- [ ] Performance Tests (Response Times)
- [ ] Security Tests (Input Validation, XSS, Injection)

---

## 📚 Ressourcen

- [Vitest Docs](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
