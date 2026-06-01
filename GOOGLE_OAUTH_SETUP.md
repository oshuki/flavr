# 🔐 Google OAuth Setup - Schritt für Schritt

## Du musst diese Schritte machen:

---

## Teil 1: Google Cloud Console konfigurieren (10 Min)

### Schritt 1.1: Google Cloud Projekt erstellen
1. Gehe zu https://console.cloud.google.com
2. Klicke auf "Select a project" → "New Project"
3. Name: "Flavr" (oder beliebig)
4. Klicke "Create"

### Schritt 1.2: OAuth Consent Screen konfigurieren
1. Im Menü → "APIs & Services" → "OAuth consent screen"
2. Wähle "External" → "Create"
3. **App information**:
   - App name: `Flavr`
   - User support email: `deine@email.de`
   - Developer contact: `deine@email.de`
4. Klicke "Save and Continue"
5. **Scopes**: Click "Save and Continue" (keine zusätzlichen Scopes nötig)
6. **Test users**: Click "Save and Continue" (optional: füge Testuser hinzu)
7. Klicke "Back to Dashboard"

### Schritt 1.3: OAuth 2.0 Client ID erstellen
1. Im Menü → "APIs & Services" → "Credentials"
2. Klicke "+ Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `Flavr Web Client`
5. **Authorized redirect URIs** - Klicke "+ Add URI" und füge hinzu:
   ```
   https://htescszituyzooubmxkh.supabase.co/auth/v1/callback
   ```
6. Klicke "Create"
7. **WICHTIG**: Kopiere:
   - **Client ID** (z.B. `123456-abc.apps.googleusercontent.com`)
   - **Client Secret** (z.B. `GOCSPX-abc123...`)

---

## Teil 2: Supabase konfigurieren (5 Min)

### Schritt 2.1: Google Provider aktivieren
1. Gehe zu https://supabase.com → Dein Projekt
2. Authentication → Providers
3. Finde "Google" in der Liste
4. Klicke auf "Google" zum Expandieren
5. **Enable Google Provider**: Toggle auf ON
6. **Client ID**: Füge deine Google Client ID ein
7. **Client Secret**: Füge dein Google Client Secret ein
8. Klicke "Save"

### Schritt 2.2: Site URL & Redirect URLs prüfen
1. Gehe zu: Authentication → URL Configuration
2. **Site URL**: `https://deine-netlify-url.netlify.app`
3. **Redirect URLs**: Sollte schon enthalten sein:
   - `https://deine-netlify-url.netlify.app/**`
   - `http://localhost:3002/**` (für lokales Testen)

---

## Teil 3: Testen 🧪

### Lokal testen (http://localhost:3002)
1. Starte Dev-Server: `npm run dev`
2. Gehe zu http://localhost:3002/auth
3. Klicke "Mit Google anmelden"
4. Wähle deinen Google Account
5. **Sollte funktionieren!** ✅

Falls Fehler "redirect_uri_mismatch":
- Füge in Google Console hinzu: `https://htescszituyzooubmxkh.supabase.co/auth/v1/callback`

### Production testen (Netlify)
1. Gehe zu deiner Netlify-URL
2. Klicke "Mit Google anmelden"
3. Login sollte funktionieren!

---

## Troubleshooting 🔧

### Fehler: "redirect_uri_mismatch"
→ Check Google Console → Credentials → Authorized redirect URIs
→ Muss enthalten: `https://htescszituyzooubmxkh.supabase.co/auth/v1/callback`

### Google Login öffnet sich nicht
→ Check Supabase → Providers → Google ist aktiviert
→ Check Client ID & Secret sind gesetzt

### Nach Login: "Invalid credentials"
→ Check Supabase → URL Configuration
→ Site URL muss deine Netlify-URL sein

### Login funktioniert lokal, aber nicht in Production
→ Check Netlify URL in Google Console → Authorized redirect URIs
→ Muss NICHT die Netlify-URL sein, nur die Supabase Callback-URL!

---

## ✅ Checkliste

- [ ] Google Cloud Projekt erstellt
- [ ] OAuth Consent Screen konfiguriert
- [ ] OAuth Client ID erstellt
- [ ] Client ID & Secret kopiert
- [ ] Supabase Google Provider aktiviert
- [ ] Client ID & Secret in Supabase eingefügt
- [ ] Lokal getestet
- [ ] Production getestet

---

## Fertig! 🎉

Nach dem Setup:
- User können sich mit Google anmelden
- Keine E-Mail-Bestätigung nötig
- Schnellerer Login-Flow
- Bessere User Experience

**Geschätzte Zeit: 15 Minuten**
