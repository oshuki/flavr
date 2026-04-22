# 🔒 Backup & Disaster Recovery Strategie

**Projekt:** Flavr Recipe App  
**Letzte Aktualisierung:**  22. April 2026

---

## 📊 Übersicht

Diese Strategie beschreibt wie Daten gesichert und im Notfall wiederhergestellt werden.

---

## 🗄️ Supabase Database Backups

### Automatische Backups (Supabase)

**Status:** ✅ Automatisch aktiv (Free Tier)

| Backup-Typ | Frequenz | Retention | Wiederherstellung |
|------------|----------|-----------|-------------------|
| **Point-in-Time Recovery** | Kontinuierlich | 7 Tage | Via Supabase Dashboard |
| **Daily Snapshots** | Täglich | 7 Tage | Via Support |

### Manuelle Backups

#### Option 1: pg_dump (Empfohlen)

```bash
# Von Supabase Datenbank exportieren
pg_dump -h db.htescszituyzooubmxkh.supabase.co \
  -U postgres \
  -d postgres \
  --no-owner --no-acl \
  -F c \
  -f flavr_backup_$(date +%Y%m%d).dump

# Oder als SQL
pg_dump -h db.htescszituyzooubmxkh.supabase.co \
  -U postgres \
  -d postgres \
  --no-owner --no-acl \
  -f flavr_backup_$(date +%Y%m%d).sql
```

**Credentials:** Siehe Supabase Dashboard → Project Settings → Database

#### Option 2: Supabase CLI

```bash
# Installation
npm install -g supabase

# Login
supabase login

# Backup erstellen
supabase db dump -f flavr_backup.sql
```

### Backup-Zeitplan (Empfehlung)

| Zeitpunkt | Aktion | Verantwortlich |
|-----------|--------|----------------|
| **Täglich** | Automatisch (Supabase) | Supabase |
| **Wöchentlich** | Manueller Export via pg_dump | Entwickler |
| **Vor Major Updates** | Snapshot + Export | Entwickler |
| **Monatlich** | Backup-Test (Restore) | Entwickler |

### Backup-Storage

**Speicherorte:**
- ✅ **Primär:** Lokale Festplatte (`~/backups/flavr/`)
- ✅ **Sekundär:** Cloud Storage (Google Drive, Dropbox, etc.)
- ✅ **Tertiär:** Git LFS (für kleinere Daten)

---

## 📁 Datenbank-Schema Versionierung

**Status:** ✅ Aktiv via Supabase Migrations

```bash
# Schema-Änderungen tracken
supabase db diff -f new_migration

# SQL-Dumps im Git committen
git add supabase/migrations/
git commit -m "Add migration: XYZ"
```

**Location:** `supabase/migrations/`

---

## 🖼️ User Uploads (Bilder)

### Supabase Storage Backups

**Bucket:** `recipe-images`  
**Strategy:** Automatisch via Supabase (S3 Backend)

#### Manuelle Backups

```bash
# Storage Backup via Supabase CLI
supabase storage download --bucket recipe-images \
  --destination ./storage_backup/$(date +%Y%m%d)/
```

**Empfehlung:**
- Monatliche Storage-Backups
- Komprimierung mit `tar -czf`
- Upload zu externem Storage

---

## 🔄 Disaster Recovery Plan

### Szenario 1: Datenverlust (Teil-Recovery)

**Symptom:** Einzelne Rezepte/User gelöscht

**Lösung:**
1. Supabase Dashboard öffnen
2. SQL Editor → Point-in-Time Recovery
3. Zeitpunkt vor Löschung wählen
4. Daten exportieren und re-importieren

**Dauer:** ~15 Minuten

---

### Szenario 2: Kompletter DB-Ausfall

**Symptom:** Supabase nicht erreichbar

**Lösung:**
1. Neuestes Backup identifizieren (pg_dump)
2. Neues Supabase Projekt erstellen
3. Backup einspielen:
   ```bash
   pg_restore -h NEW_DB_HOST \
     -U postgres \
     -d postgres \
     --no-owner --no-acl \
     flavr_backup_YYYYMMDD.dump
   ```
4. ENV-Variablen aktualisieren (SUPABASE_URL, SUPABASE_KEY)
5. Deployment neu anstoßen

**Dauer:** ~1-2 Stunden  
**Datenverlust:** Maximal 7 Tage (oder letztes manuelles Backup)

---

### Szenario 3: Supabase Account-Sperre

**Symptom:** Kein Zugriff auf Supabase Dashboard

**Lösung:**
1. Supabase Support kontaktieren
2. Falls nicht lösbar: Backup auf neues Projekt
3. Temporär: Lokale Postgres-DB aufsetzen

**Vorbereitung:**
- Regelmäßige Exports (wöchentlich)
- Credentials sicher speichern
- Backup-Account (2. Email/User)

---

## 🧪 Backup-Tests

### Monatlicher Test-Prozess

1. **Backup erstellen**
   ```bash
   pg_dump -h db.htescszituyzooubmxkh.supabase.co \
     -U postgres -d postgres \
     -f test_backup.sql
   ```

2. **Lokale Test-DB aufsetzen**
   ```bash
   docker run --name test-postgres \
     -e POSTGRES_PASSWORD=test \
     -p 54321:5432 \
     -d postgres:15
   ```

3. **Backup einspielen**
   ```bash
   psql -h localhost -p 54321 \
     -U postgres -d postgres \
     -f test_backup.sql
   ```

4. **Daten validieren**
   - Rezepte zählen
   - User-Accounts prüfen
   - Sample-Queries ausführen

5. **Test-DB löschen**
   ```bash
   docker rm -f test-postgres
   ```

---

## 📋 Backup-Checklist

### Wöchentlich
- [ ] `pg_dump` Backup erstellen
- [ ] Backup auf externe Festplatte kopieren
- [ ] Backup-Size prüfen (sollte wachsen mit Daten)

### Monatlich
- [ ] Backup-Restore testen
- [ ] Storage-Backup erstellen (Bilder)
- [ ] Backup-Ordner aufräumen (>3 Monate alte Backups löschen)

### Bei Major Changes
- [ ] Vor Deployment: Backup erstellen
- [ ] Migration testen auf Test-DB
- [ ] Rollback-Plan dokumentieren

---

## 🚨 Notfall-Kontakte

| Service | Support | Kritikalität |
|---------|---------|--------------|
| Supabase | support@supabase.com | Hoch |
| Railway | support@railway.app | Mittel |
| Cloudflare | support.cloudflare.com | Niedrig |
| GitHub | support@github.com | Niedrig |

---

## 📝 Backup-Logs

**Format:** `backups-log.md` (git-tracked)

```markdown
## 2026-04-22
- ✅ Weekly backup: flavr_backup_20260422.sql (45 MB)
- ✅ Storage backup: storage_20260422.tar.gz (120 MB)

## 2026-04-15
- ✅ Monthly backup test: Successful
- ✅ Weekly backup: flavr_backup_20260415.sql (44 MB)
```

---

## 🔐 Security Best Practices

1. **Verschlüsselte Backups**
   ```bash
   # Backup mit Verschlüsselung
   pg_dump ... | gpg -c > backup_$(date +%Y%m%d).sql.gpg
   ```

2. **Keine Credentials in Git**
   - Verwende `.env` Dateien
   - `.env` in `.gitignore`

3. **Rotate Backup Passwords**
   - Monatlich neue Verschlüsselung-Keys
   - Alte Backups re-encrypten

4. **Off-site Storage**
   - Nicht nur lokal speichern
   - Cloud + lokale Festplatte

---

## ✅ Status

| Komponente | Backup Status | Letzter Test |
|------------|---------------|--------------|
| Supabase DB | ✅ Automatisch | - |
| User Uploads | ✅ S3 Backend | - |
| Manuelles Backup | ⚠️ Noch nicht eingerichtet | - |
| Backup-Tests | ⚠️ Noch nicht durchgeführt | - |

---

## 📚 Weiterführende Links

- [Supabase Backups Dokumentation](https://supabase.com/docs/guides/platform/backups)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [Disaster Recovery Planning](https://en.wikipedia.org/wiki/Disaster_recovery)

---

**Next Steps:**
1. Ersten manuellen Backup erstellen
2. Backup-Skript automatisieren (cron job)
3. Ersten Backup-Test durchführen
