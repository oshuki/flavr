# 🍳 Meine Rezepte — PWA

Persönliche Rezeptverwaltung als Progressive Web App. Läuft offline, kann auf dem iPhone wie eine native App installiert werden.

---

## 📱 Auf iPhone installieren (empfohlen)

### Option A: Netlify (kostenlos, 2 Minuten)

1. Geh auf [netlify.com](https://netlify.com) und erstelle einen kostenlosen Account
2. Ziehe den gesamten **Projektordner** auf die Netlify-Oberfläche (Drag & Drop)
3. Du bekommst eine URL wie `https://dein-name.netlify.app`
4. Öffne diese URL auf dem iPhone in **Safari**
5. Tippe auf das **Teilen-Symbol** (☐↑) → **„Zum Home-Bildschirm"**
6. Die App erscheint als Icon auf deinem Homescreen ✓

### Option B: GitHub Pages (kostenlos)

1. Erstelle ein Repository auf [github.com](https://github.com)
2. Lade alle Dateien hoch
3. Gehe zu Settings → Pages → Source: main branch
4. Öffne die generierte URL in Safari auf dem iPhone
5. Teilen → „Zum Home-Bildschirm"

### Option C: Lokal auf dem Mac öffnen

```bash
# Im Projektordner:
python3 -m http.server 8080
# Dann im Browser: http://localhost:8080
```

> ⚠️ Direkt als `file://` öffnen funktioniert nicht für PWA-Features. Nutze einen lokalen Server oder hoste die Datei online.

---

## ✨ Features

| Feature | Beschreibung |
|---------|--------------|
| 📖 Rezeptverwaltung | Anlegen, Bearbeiten, Löschen mit Zutaten & Schritten |
| 🔍 Suche & Filter | Nach Name, Zutat, Tag suchen; nach Kategorie & Favoriten filtern |
| ⭐ Favoriten | Direkt auf der Karte oder im Detail umschaltbar |
| 🔗 Link importieren | URL aus Instagram/TikTok einfügen, KI erstellt Rezept |
| 📝 Text importieren | Kopierten Rezepttext aus Notizen-App einfügen |
| 📸 Foto importieren | Screenshot eines Rezepts hochladen, KI liest es aus |
| 🤖 KI-Koch | Zutaten eingeben → 3 Vorschläge → Rezept direkt speichern |
| 💾 Export/Import | Backup als JSON-Datei |
| 📴 Offline | Funktioniert ohne Internet (nach erstem Laden) |

---

## 🔑 KI-Feature einrichten

Die KI-Funktionen (Importieren, Vorschläge) benötigen einen Claude API Key:

1. Gehe zu [console.anthropic.com](https://console.anthropic.com)
2. Erstelle einen Account und einen API Key
3. Öffne in der App den Tab **„KI-Koch"**
4. Gib den Key unten ein (beginnt mit `sk-ant-...`)
5. Der Key wird **lokal auf deinem Gerät** gespeichert — nirgendwo hochgeladen

> Die ersten paar Dollar API-Nutzung sind bei Anthropic oft kostenlos verfügbar.

---

## 📁 Projektstruktur

```
rezepte-project/
├── index.html      ← Die komplette App (HTML + CSS + JS)
├── sw.js           ← Service Worker für Offline-Support
├── manifest.json   ← PWA-Manifest (Icon, Name, Display-Modus)
├── icon-192.png    ← App-Icon (192×192px)
├── icon-512.png    ← App-Icon (512×512px)
└── README.md       ← Diese Anleitung
```

---

## 🛠️ Anpassen

Alle Logik befindet sich in einer einzigen `index.html`. Du kannst:

- **Farben** ändern: CSS-Variablen im `:root` Block (oben im `<style>` Tag)
- **Kategorien** ändern: `const CATS = [...]` im JavaScript
- **Beispielrezepte** ändern: `getDefaultRecipes()` Funktion
- **KI-Prompts** anpassen: `callClaude(system, ...)` Aufrufe

---

*Erstellt mit Claude — Anthropic*
