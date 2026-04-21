# 📸 Foto-Analyse Einrichtung

## Voraussetzungen

Die Foto-Analyse verwendet **Claude 3.5 Sonnet von Anthropic** mit Vision-Fähigkeiten.

## Backend Configuration

### Railway Environment Variables

Stelle sicher, dass auf Railway folgende Variable gesetzt ist:

```
CLAUDE_API_KEY=sk-ant-xxx...
```

### API Key erhalten

1. Gehe zu https://console.anthropic.com/
2. Erstelle einen Account oder logge dich ein
3. Navigiere zu "API Keys"
4. Erstelle einen neuen API Key
5. Kopiere den Key (beginnt mit `sk-ant-`)

### Railway Variable setzen

1. Öffne dein Railway Projekt: https://railway.app/
2. Wähle dein Backend Service
3. Gehe zu **Variables** Tab
4. Klicke **+ New Variable**
5. Name: `CLAUDE_API_KEY`
6. Value: Dein API Key
7. Klicke **Add**
8. Railway wird automatisch neu deployen

## Testing

### In der App testen

1. Öffne https://flavrapp.netlify.app/ai
2. Klicke auf "📸 Zutaten fotografieren"
3. Wähle ein Foto mit Lebensmitteln/Zutaten
4. Die KI sollte die Zutaten erkennen und zur Liste hinzufügen

### Erwartetes Verhalten

**Erfolg:**
- Ladeanimation: "Foto wird analysiert..."
- Dann: "KI erkennt Zutaten..."
- Dann: "X Zutaten erkannt!" (2 Sekunden)
- Zutaten erscheinen als Chips
- Auto-Vorschläge werden generiert

**Fehler:**
- API Key fehlt: "KI-Service nicht verfügbar"
- Rate Limit: "Zu viele Anfragen"
- Server-Fehler: "Server-Fehler. Bitte versuche es später"
- Keine Zutaten erkannt: "Keine Zutaten im Foto erkannt. Versuche ein klareres Foto"

## Troubleshooting

### "KI-Service nicht verfügbar"

→ API Key nicht gesetzt oder ungültig
→ Prüfe Railway Variables

### "Server-Fehler. Bitte versuche es später"

→ Backend ist down oder API Request fehlgeschlagen
→ Prüfe Railway Logs: `railway logs`

### "Keine Zutaten erkannt"

→ Foto ist unklar oder enthält keine erkennbaren Lebensmittel
→ Versuche ein anderes Foto mit besserem Licht

### Duplikate vermeiden

Die App filtert automatisch bereits hinzugefügte Zutaten.

## API Limits

**Anthropic API:**
- Free Tier: Begrenzte Anfragen pro Monat
- Pay-as-you-go: $3 pro 1M Input Tokens

**Empfehlung:**
- Setze Budget-Limits in der Anthropic Console
- Monitoring aktivieren

## Alternative: Manuelle Eingabe

Falls die Foto-Analyse nicht funktioniert, können Nutzer immer noch Zutaten manuell eingeben.
