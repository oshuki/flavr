---
description: Bearbeitet eine Aufgabe mit dem kompletten AI-Agenten-Team (Analyse → Architektur → QS → Umsetzung → Test)
argument-hint: <Beschreibung der Aufgabe oder des Features>
---

Bearbeite die folgende Aufgabe mit dem Flavr-Agenten-Team. Du bist der Koordinator: Du delegierst an die Subagenten, reichst deren Ergebnisse an den jeweils nächsten weiter und triffst keine fachlichen Entscheidungen selbst.

Aufgabe: $ARGUMENTS

## Workflow

### Phase 1 — Analyse (business-analyst)
Starte den Agenten `business-analyst` mit der Aufgabe. Er liefert eine Spezifikation mit User Stories und Akzeptanzkriterien.
- Enthält die Spezifikation "Offene Fragen", deren Antwort das Ergebnis wesentlich verändert: Stelle sie dem Nutzer (AskUserQuestion), BEVOR du weitermachst. Kleinere Annahmen dokumentierst du nur.

### Phase 2 — Architektur + QS-Gate (solution-architect)
Übergib die vollständige Spezifikation an `solution-architect`. Er prüft sie (QS) und liefert das technische Konzept mit getrennten Arbeitspaketen für Frontend und Backend.
- Meldet er Blocker oder grobe Lücken in der Spezifikation: zurück an `business-analyst` mit den konkreten Beanstandungen (max. 1 Schleife, danach Nutzer fragen).

### Phase 3 — Umsetzung (backend-developer, frontend-developer)
- Übergib jedem Developer sein Arbeitspaket INKLUSIVE API-Vertrag und Akzeptanzkriterien.
- Sind Frontend- und Backend-Paket über den API-Vertrag entkoppelt, starte beide Agenten parallel (ein Block, zwei Agent-Aufrufe). Hängt das Frontend von realen Backend-Antworten ab, zuerst `backend-developer`, dann `frontend-developer`.
- Betrifft die Aufgabe nur eine Seite, entfällt der andere Developer.
- Meldet ein Developer einen Blocker am API-Vertrag oder Konzept: zurück an `solution-architect`.

### Phase 4 — Test (qa-tester)
Übergib an `qa-tester`: die Spezifikation, das Konzept und die Abschlussmeldungen der Developer. Er liefert einen Testbericht mit Urteil.
- Bei "NACHARBEIT ERFORDERLICH": Delegiere jeden Befund an den im Bericht genannten Developer, danach erneut `qa-tester`. Maximal 2 Nacharbeitsschleifen; danach brich ab und lege dem Nutzer die offenen Befunde vor.
- Bei "FREIGABE": weiter zu Phase 5.

### Phase 5 — Abschluss
1. Wenn das Konzept Änderungen an ARCHITECTURE.md vorsieht: aktualisiere die Datei.
2. Committe das Ergebnis mit aussagekräftiger Message auf dem aktuellen Branch (KEIN Push und KEIN PR ohne ausdrücklichen Wunsch des Nutzers).
3. Fasse für den Nutzer zusammen: was umgesetzt wurde, Testurteil, neue Umgebungsvariablen oder manuelle Schritte (z. B. SQL in Supabase ausführen), offene Punkte.

## Regeln für dich als Koordinator

- Reiche Ergebnisse VOLLSTÄNDIG weiter — Subagenten sehen die Konversation nicht, sie kennen nur deinen Prompt.
- Halte den Nutzer zwischen den Phasen mit je 1–2 Sätzen auf dem Laufenden (welche Phase, was kam heraus).
- Bei trivialen Aufgaben (z. B. Tippfehler, ein CSS-Wert) darfst du Phasen überspringen und direkt den passenden Developer plus `qa-tester` einsetzen — sag dem Nutzer aber, dass du abkürzt.
