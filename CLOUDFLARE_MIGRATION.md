# 🚀 Migration zu Cloudflare Pages

## Warum Cloudflare Pages?

- ✅ **Unlimited Bandwidth** (kostenlos!)
- ✅ **Extrem schnelles CDN** (200+ Standorte weltweit)
- ✅ **Kostenlos für unlimitierte Sites**
- ✅ **Auto-Deploy von GitHub**
- ✅ **Bessere Performance** als Netlify

---

## 📋 Migrations-Schritte

### 1. Cloudflare Pages Setup

1. **Gehe zu:** https://dash.cloudflare.com/
2. **Registriere dich** oder logge dich ein (kostenlos)
3. Klicke **"Workers & Pages"** → **"Create application"** → **"Pages"**
4. Wähle **"Connect to Git"**

### 2. Repository verbinden

1. **Autorisiere GitHub** (wenn noch nicht geschehen)
2. Wähle Repository: **`oshuki/flavr`**
3. Branch: **`nuxt_js`**

### 3. Build-Konfiguration

Setze folgende Build-Einstellungen:

```yaml
Framework preset: Nuxt.js
Build command: npm install && npm run generate
Build output directory: .output/public
Root directory: frontend
Node version: 18
```

**WICHTIG:** Klicke auf **"Environment variables (advanced)"**

### 4. Environment Variables setzen

Klicke **"Add variable"** und füge hinzu:

```bash
# Backend URL (Railway)
NUXT_PUBLIC_BACKEND_URL=https://flavr-production.up.railway.app

# Supabase
NUXT_PUBLIC_SUPABASE_URL=https://htescszituyzooubmxkh.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZXNjc3ppdHV5em9vdWJteGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjQ0MDYsImV4cCI6MjA5MTUwMDQwNn0.ATopUfnXtyoWmJl1NfumhRrfQZcveDXZMWR9JWuIqKI

# Sentry (Optional)
NUXT_PUBLIC_SENTRY_DSN=https://71f10fedb606305d08ca9c024ee90ca6@o4511226172145664.ingest.de.sentry.io/4511226193903696
```

### 5. Deploy starten

1. Klicke **"Save and Deploy"**
2. Warte 2-3 Minuten ⏳
3. Deine App ist live! 🎉

---

## 🌐 Custom Domain einrichten

### Option A: Neue Domain bei Cloudflare

1. **Pages Settings** → **Custom domains**
2. Klicke **"Set up a custom domain"**
3. Gib deine Domain ein (z.B. `flavr.app`)
4. Folge den DNS-Anweisungen

### Option B: Bestehende Domain

1. **Pages Settings** → **Custom domains** → **"Set up a custom domain"**
2. Gib deine Domain ein
3. **Cloudflare wird automatisch:**
   - SSL-Zertifikat erstellen
   - DNS konfigurieren
   - CDN aktivieren

**Beispiel:** `flavr.pages.dev` → `www.flavr.app`

---

## ⚙️ Supabase OAuth Update

**Wichtig:** Aktualisiere die Redirect URL in Supabase!

1. Gehe zu https://supabase.com/dashboard
2. Projekt **Flavr** → **Authentication** → **URL Configuration**
3. **Site URL:** `https://flavr.pages.dev` (oder deine Custom Domain)
4. **Redirect URLs:** Füge hinzu:
   ```
   https://flavr.pages.dev/auth/callback
   https://www.deine-domain.de/auth/callback
   ```
5. Klicke **Save**

---

## 🔄 Auto-Deploy

Cloudflare Pages deployed automatisch bei jedem Push zu `nuxt_js`:

```bash
git add -A
git commit -m "Your changes"
git push origin nuxt_js
```

**Deploy dauert:** ~2 Minuten
**Dashboard:** https://dash.cloudflare.com/ → Workers & Pages

---

## 📊 Performance-Vergleich

| Metrik | Netlify | Cloudflare Pages |
|--------|---------|------------------|
| **Initial Load** | ~200ms | ~100ms |
| **Global Latency** | ~50ms | ~20ms |
| **CDN Standorte** | 9 | 200+ |
| **Bandwidth Limit** | 100GB/Monat | Unlimited ✨ |
| **Build Minutes** | 300/Monat | 500/Monat |

---

## 🧪 Nach Migration testen

1. **Öffne:** https://flavr.pages.dev
2. **Teste:**
   - [ ] Login (Google OAuth)
   - [ ] Rezepte anzeigen
   - [ ] Neues Rezept erstellen
   - [ ] KI-Koch Vorschläge
   - [ ] Bring! Export
   - [ ] PWA Installation

3. **Performance prüfen:**
   - Chrome DevTools → Lighthouse
   - Should score 95+ Performance 🚀

---

## 🗑️ Netlify deaktivieren (optional)

Wenn alles funktioniert:

1. Gehe zu https://app.netlify.com/
2. Site Settings → Danger zone
3. **"Delete site"** (optional, wenn du sicher bist)

**TIPP:** Lass Netlify noch 1-2 Wochen laufen als Backup!

---

## 🆘 Troubleshooting

### Build failet?

**Fehler:** `npm ERR! code ENOENT`
**Lösung:** Stelle sicher dass **Root directory: `frontend`** gesetzt ist

### 404 Fehler bei Routes?

**Fehler:** `/recipes` gibt 404
**Lösung:** `_redirects` Datei wird automatisch kopiert (bereits committed)

### Environment Variables fehlen?

**Fehler:** Backend nicht erreichbar
**Lösung:** Prüfe alle Variables in Cloudflare Pages Settings

### OAuth funktioniert nicht?

**Fehler:** "redirect_uri mismatch"
**Lösung:** Update Supabase Redirect URLs (siehe oben)

---

## 💡 Bonus: Cloudflare Analytics

Kostenlos aktivieren:

1. **Pages Settings** → **Analytics**
2. **Web Analytics aktivieren**
3. Siehe Echtzeit-Statistiken:
   - Seitenaufrufe
   - Länder
   - Browser
   - Performance-Metriken

**Dashboard:** https://dash.cloudflare.com/

---

## ✅ Checkliste

- [ ] Cloudflare Pages Account erstellt
- [ ] Repository verbunden
- [ ] Build-Konfiguration gesetzt
- [ ] Environment Variables konfiguriert
- [ ] Erster Deploy erfolgreich
- [ ] Custom Domain eingerichtet (optional)
- [ ] Supabase OAuth URLs aktualisiert
- [ ] App getestet (Login, Rezepte, KI-Koch)
- [ ] Performance geprüft (Lighthouse)
- [ ] DNS propagiert (24h warten)

---

**Fertig! 🎉 Deine App läuft jetzt auf Cloudflare Pages mit:**
- ⚡ Blitzschneller Performance
- 🌍 Globalem CDN
- 💰 Unlimited Bandwidth
- 🔒 Auto-SSL

**Live URL:** https://flavr.pages.dev
