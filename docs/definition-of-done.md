# Definition of Done (Flavr)

Verbindlicher Qualitätsmaßstab für jede Änderung. Der `qa-tester` prüft gegen diese Liste, zusätzlich zu den feature-spezifischen Akzeptanzkriterien. Punkte, die für eine Änderung nicht relevant sind (z. B. Datenbank bei reinen UI-Fixes), entfallen.

## 1. Funktionalität

- [ ] Alle Akzeptanzkriterien der Spezifikation sind erfüllt.
- [ ] Randfälle sind behandelt: leere Daten, nicht eingeloggter Nutzer, Backend-Fehler/Timeout, langsames Netz (Ladezustände).
- [ ] Keine Fehlermeldungen in der Browser-Konsole im Happy Path.

## 2. Builds und Tests

- [ ] `cd backend && npm run build` läuft fehlerfrei.
- [ ] `cd backend && npm run lint` läuft fehlerfrei.
- [ ] `cd backend && npm test` ist grün; neue Endpunkte/Logik haben Vitest-Tests (Erfolgsfall + Fehlerfälle).
- [ ] `cd frontend && npm run generate` läuft fehlerfrei.
- [ ] Bestehende Playwright-E2E-Tests sind nicht kaputt; geänderte Kern-Flows (Auth, Rezepte, Wochenplan) haben E2E-Abdeckung.

## 3. Sicherheit

- [ ] Keine Secrets oder API-Keys in git-getrackten Dateien; Konfiguration über Umgebungsvariablen.
- [ ] Jede neue Tabelle hat RLS-Policies: Nutzer sehen und ändern nur eigene Daten.
- [ ] Neue Backend-Endpunkte validieren ihre Eingaben und geben strukturierte Fehler zurück (kein Stacktrace an den Client).
- [ ] Externe Inhalte (importierte Rezepte, Bild-URLs) werden nicht ungeprüft als HTML gerendert.

## 4. UI / UX (Frontend)

- [ ] Mobile-first: Funktioniert bei 375 px Breite (iPhone) ohne horizontales Scrollen; Desktop ab 1280 px sauber.
- [ ] Zielbrowser: aktuelle Versionen von Chrome, Firefox, Safari und iOS Safari (PWA-Installation).
- [ ] Jede Aktion hat sichtbares Feedback: Lade-, Erfolgs- und Fehlerzustand.
- [ ] Texte konsistent in der App-Sprache; keine Platzhalter oder Lorem ipsum.

## 5. Barrierefreiheit (Basis)

- [ ] Semantisches HTML (button für Aktionen, a für Navigation, Überschriften-Hierarchie).
- [ ] Formularfelder haben Labels; Bilder haben alt-Texte.
- [ ] Interaktive Elemente sind per Tastatur erreichbar und bedienbar.

## 6. Performance (Basis)

- [ ] Keine unnötig großen Assets; Bilder über den bestehenden Image-Proxy bzw. mit sinnvoller Größe.
- [ ] Keine neuen schweren Dependencies ohne Begründung im Konzept.
- [ ] Listen mit potenziell vielen Einträgen (Rezepte) bleiben flüssig; keine N+1-Requests an Supabase.

## 7. Dokumentation

- [ ] ARCHITECTURE.md ist aktualisiert, wenn sich Endpunkte, Datenmodell, Umgebungsvariablen oder Deployment ändern.
- [ ] Neue Umgebungsvariablen sind in ARCHITECTURE.md Abschnitt 5 dokumentiert.
