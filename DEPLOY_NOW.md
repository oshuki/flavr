# 🚀 DEPLOYMENT CHECKLISTE - Mach diese 3 Schritte

## ✅ VORBEREITUNG ABGESCHLOSSEN
- ✅ Code committet und gepusht
- ✅ Deployment-Configs erstellt
- ✅ Environment-Templates erstellt
- ✅ Alles deployment-ready!

---

## 🎯 DU MUSST NUR NOCH:

### SCHRITT 1: Backend auf Railway (5 Min) 🚂

1. **Öffne**: https://railway.app
2. **Login** mit GitHub
3. **Klick**: "New Project" → "Deploy from GitHub repo"
4. **Wähle**: `oshuki/flavr` Repository
5. **Wähle Branch**: `nuxt_js`
6. **Railway baut automatisch!**
7. **Gehe zu**: Settings → Variables
8. **Kopiere aus** `backend/.env.production.template`:
   ```
   NODE_ENV=production
   PORT=3000
   ANTHROPIC_API_KEY=<DEIN_KEY>
   BRING_API_KEY=cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp
   ```
9. **Notiere dir**: Settings → Networking → Public URL
   - z.B. `https://flavr-backend-production.up.railway.app`

---

### SCHRITT 2: Frontend auf Netlify (5 Min) 🌐

1. **Öffne**: https://netlify.com
2. **Login** mit GitHub
3. **Klick**: "Add new site" → "Import an existing project"
4. **Wähle**: `oshuki/flavr` Repository
5. **Wähle Branch**: `nuxt_js`
6. **Configure**:
   - Base directory: `frontend`
   - Build command: `npm install && npm run generate`
   - Publish directory: `.output/public`
7. **Klick**: "Deploy"
8. **Warte** 2-3 Minuten
9. **Gehe zu**: Site settings → Environment variables
10. **Kopiere aus** `frontend/.env.production.template`:
    ```
    NUXT_PUBLIC_BACKEND_URL=<DEINE_RAILWAY_URL_AUS_SCHRITT_1>
    NUXT_PUBLIC_SUPABASE_URL=https://htescszituyzooubmxkh.supabase.co
    NUXT_PUBLIC_SUPABASE_KEY=eyJhbGc...
    ```
11. **Wichtig**: Ersetze `<DEINE_RAILWAY_URL_AUS_SCHRITT_1>`!
12. **Klick**: "Redeploy" (weil Env-Vars geändert)

---

### SCHRITT 3: Supabase URLs updaten (2 Min) 🔐

1. **Öffne**: https://supabase.com → Dein Projekt
2. **Gehe zu**: Authentication → URL Configuration
3. **Füge hinzu**:
   - Site URL: `https://<deine-netlify-url>.netlify.app`
   - Redirect URLs: `https://<deine-netlify-url>.netlify.app/**`
4. **Save**

---

## 🎉 FERTIG!

**Deine App ist jetzt live:**
- Frontend: https://<deine-url>.netlify.app
- Backend: https://<deine-url>.railway.app

**PWA installieren:**
- Desktop: Install-Icon in Chrome Adressleiste
- Handy: "Add to Home Screen"

---

## 🆘 PROBLEME?

### Frontend lädt nicht?
→ Check Netlify Deploy-Log für Fehler
→ Check ob alle Env-Vars gesetzt sind

### Backend error?
→ Check Railway Logs
→ Check ob ANTHROPIC_API_KEY gesetzt ist

### Login funktioniert nicht?
→ Check Supabase URLs (Schritt 3)
→ Check NUXT_PUBLIC_SUPABASE_* Variables

---

## ⏱️ GESCHÄTZTE ZEIT: 12 Minuten

Los geht's! 🚀
