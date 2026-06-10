# Flavr AI-Agenten-Team

Dieses Verzeichnis definiert ein Team aus Claude-Code-Subagenten, das Aufgaben arbeitsteilig bearbeitet — von der Anforderung bis zum getesteten Ergebnis.

## Das Team

| Agent | Rolle | Liefert |
|---|---|---|
| `business-analyst` | Anforderungen verstehen, Scope klären | Spezifikation mit User Stories + Akzeptanzkriterien |
| `solution-architect` | Technisches Design + QS-Gate vor der Umsetzung | Konzept mit API-Vertrag und Arbeitspaketen |
| `frontend-developer` | Umsetzung in `frontend/` (Nuxt 4, Pinia, Supabase) | Code + verifizierter Build |
| `backend-developer` | Umsetzung in `backend/` + `supabase/` (Express/Hono, SQL) | Code + grüne Vitest-Tests |
| `qa-tester` | Abnahme gegen die Akzeptanzkriterien | Testbericht mit Urteil (Freigabe/Nacharbeit) |

## Benutzung

Kompletter Workflow über den Slash-Befehl:

```
/team Baue eine Einkaufslisten-Funktion, die Zutaten aus dem Wochenplan sammelt
```

Ablauf: Analyse → Architektur (inkl. QS der Spezifikation) → parallele Umsetzung Frontend/Backend → Test → ggf. Nacharbeitsschleife → Zusammenfassung.

Einzelne Agenten lassen sich auch direkt ansprechen, z. B.:

```
Nutze den business-analyst, um die Anforderung "Rezepte teilen" zu spezifizieren.
```

## Anpassen

- Rollenverhalten: jeweilige Datei in `agents/` bearbeiten (Frontmatter: `name`, `description`, `tools`, `model`; darunter der System-Prompt).
- Workflow: `commands/team.md` bearbeiten (Phasen, Schleifen-Limits, Abkürzungen für triviale Aufgaben).
- Stärkeres Modell für einzelne Rollen: im Frontmatter z. B. `model: opus` setzen (Standard: `inherit`).
