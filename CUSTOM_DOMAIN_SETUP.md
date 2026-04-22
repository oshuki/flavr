# 🌐 Custom Domain Setup

**Ziel:** Eigene Domain statt `flavr-nuxt.pages.dev`

---

## 📋 Voraussetzungen

- Domain gekauft (z.B. bei Namecheap, GoDaddy, Google Domains, etc.)
- Zugriff auf DNS-Einstellungen der Domain

---

## 🚀 Setup: Cloudflare Pages

### Schritt 1: Domain in Cloudflare hinzufügen

1. **Gehe zu:** https://dash.cloudflare.com
2. **Klicke:** "Add Site"
3. **Eingeben:** Deine Domain (z.B. `flavr.app`)
4. **Plan wählen:** Free Plan
5. **Nameserver notieren** (z.B. `kai.ns.cloudflare.com`)

### Schritt 2: Nameserver beim Domain-Registrar ändern

**Bei deinem Domain-Registrar (z.B. Namecheap, GoDaddy):**

1. Gehe zu Domain-Verwaltung
2. Finde "Nameserver"-Einstellungen
3. Ändere von "Default" zu "Custom"
4. Trage Cloudflare Nameserver ein:
   ```
   kai.ns.cloudflare.com
   zelda.ns.cloudflare.com
   ```
5. Speichern (kann 24-48h dauern zur Propagierung)

### Schritt 3: Domain zu Cloudflare Pages verbinden

**1. Cloudflare Pages Dashboard:**
- Gehe zu: https://dash.cloudflare.com
- Wähle: "Workers & Pages"
- Klicke auf: `flavr-nuxt`
- Tab: "Custom domains"

**2. Domain hinzufügen:**
```
Domain: flavr.app
```

**3. DNS-Records werden automatisch erstellt:**
```
CNAME  @              flavr-nuxt.pages.dev
CNAME  www            flavr-nuxt.pages.dev
```

**4. SSL/TLS:**
- Automatisch via Cloudflare
- HTTPS wird automatisch erzwungen

### Schritt 4: Testen

```bash
# Warte 5-10 Minuten, dann teste:
curl -I https://flavr.app

# Sollte 200 OK oder 301 (Redirect zu www) zurückgeben
```

---

## 🔧 Optional: Subdomain Setup

**Für z.B. `app.flavr.de`:**

1. Cloudflare Pages Dashboard
2. Custom Domains → Add Domain:
   ```
   app.flavr.de
   ```
3. DNS Record wird automatisch erstellt:
   ```
   CNAME  app  flavr-nuxt.pages.dev
   ```

---

## 📧 Backend Domain (Optional)

**Falls eigene Backend-Domain gewünscht (z.B. `api.flavr.app`):**

### Option 1: Railway Custom Domain

**Railway Dashboard:**
1. Öffne `flavr` Service
2. Settings → Domains
3. Add Custom Domain: `api.flavr.app`
4. Railway gibt dir DNS-Record:
   ```
   CNAME  api  flavr-production.up.railway.app
   ```

**Cloudflare DNS:**
```
CNAME  api  flavr-production.up.railway.app
```

### Option 2: Cloudflare Proxy

1. CNAME auf Railway
2. Cloudflare Proxy aktivieren (Orange Cloud)
3. Vorteile:
   - DDoS Protection
   - Caching
   - Web Application Firewall

---

## 🔒 SSL/TLS Einstellungen

**Cloudflare Dashboard → SSL/TLS:**

| Setting | Empfehlung |
|---------|------------|
| **Encryption Mode** | Full (strict) |
| **Always Use HTTPS** | ✅ An |
| **Automatic HTTPS Rewrites** | ✅ An |
| **Minimum TLS Version** | 1.2 |
| **TLS 1.3** | ✅ An |

---

## 🚀 Frontend Environment Update

**Nach Domain-Setup:**

```bash
# In .env.production oder Cloudflare Pages ENV
NUXT_PUBLIC_BACKEND_URL=https://api.flavr.app  # Falls Backend-Domain
```

**Deployment neu starten:**
- Cloudflare Pages deployt automatisch bei jedem Push
- Oder manuell: Dashboard → Deployments → Retry

---

## 🧪 Testing Checklist

Nach Domain-Setup testen:

- [ ] `https://flavr.app` → Lädt Startseite
- [ ] `https://www.flavr.app` → Redirect zu `flavr.app` (oder umgekehrt)
- [ ] SSL-Zertifikat gültig (Schloss-Symbol im Browser)
- [ ] Login funktioniert (OAuth Redirect URLs!)
- [ ] API-Calls funktionieren (Network Tab prüfen)
- [ ] PWA Installation funktioniert

---

## ⚠️ Wichtig: OAuth Redirect URLs updaten

**Supabase Dashboard:**

1. Gehe zu: https://supabase.com/dashboard
2. Projekt: `flavr`
3. Authentication → URL Configuration
4. **Site URL:**
   ```
   https://flavr.app
   ```
5. **Redirect URLs hinzufügen:**
   ```
   https://flavr.app/auth/callback
   https://www.flavr.app/auth/callback
   ```
6. **Speichern**

**OAuth-Provider (Google):**

1. Google Cloud Console
2. APIs & Services → Credentials
3. OAuth 2.0 Client IDs → Edit
4. **Authorized JavaScript origins:**
   ```
   https://flavr.app
   https://www.flavr.app
   ```
5. **Authorized redirect URIs:**
   ```
   https://flavr.app/auth/callback
   https://www.flavr.app/auth/callback
   ```

---

## 📊 DNS Propagation prüfen

```bash
# Check DNS Propagation
dig flavr.app
dig www.flavr.app

# Oder online:
# https://www.whatsmydns.net
```

---

## 💰 Kosten

| Service | Kosten |
|---------|--------|
| **Domain** | ~$10-15/Jahr (je nach TLD) |
| **Cloudflare** | $0 (Free Plan ausreichend) |
| **SSL-Zertifikat** | $0 (via Cloudflare) |

---

## 🔄 Rollback Plan

**Falls Probleme auftreten:**

1. **DNS zurücksetzen:**
   - Nameserver zurück zu Original-Registrar
   
2. **Alte URL nutzen:**
   - `flavr-nuxt.pages.dev` funktioniert weiterhin

3. **OAuth URLs:**
   - Alte URLs in Supabase wieder aktivieren

---

## 📚 Empfohlene Domains

**Verfügbar prüfen bei:**
- Namecheap: https://www.namecheap.com
- Google Domains: https://domains.google
- Cloudflare Registrar: https://www.cloudflare.com/products/registrar/

**Vorschläge:**
- `flavr.app` - Kurz, modern
- `flavr.de` - Für deutsche Zielgruppe
- `flavr.io` - Tech-fokussiert
- `myflavr.com` - Falls `flavr.com` vergeben

---

## ✅ Status

- [ ] Domain gekauft
- [ ] Nameserver zu Cloudflare geändert
- [ ] Custom Domain in Cloudflare Pages hinzugefügt
- [ ] DNS Records konfiguriert
- [ ] SSL/TLS aktiv
- [ ] OAuth Redirect URLs aktualisiert
- [ ] Testing durchgeführt

---

**Geschätzte Dauer:** 1-2 Stunden (inkl. DNS-Propagation Wartezeit)
