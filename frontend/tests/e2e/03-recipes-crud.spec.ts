import { test, expect } from '@playwright/test'
import { setAuthToken, isAuthenticated, TEST_CREDENTIALS } from '../helpers/auth'

/**
 * Authentifizierte Features - Rezepte CRUD
 * 
 * SETUP für authentifizierte Tests:
 * 
 * Option 1: Environment Variable setzen (empfohlen für CI/CD)
 *   export SUPABASE_TEST_TOKEN="<dein-token-hier>"
 * 
 * Option 2: Token manuell extrahieren
 *   1. Lokal einloggen auf http://localhost:3002
 *   2. DevTools öffnen → Console
 *   3. Ausführen: localStorage.getItem('sb-htescszituyzooubmxkh-auth-token')
 *   4. Token kopieren und als ENV variable setzen
 * 
 * Option 3: Tests skippen (Standard)
 *   Setze SKIP_AUTH_TESTS=true oder entferne den Token
 */

// Tests nur ausführen wenn Token gesetzt ist
const skipAuthTests = !process.env.SUPABASE_TEST_TOKEN || process.env.SKIP_AUTH_TESTS === 'true'

test.describe('Rezepte verwalten (benötigt Login)', () => {
  test.beforeEach(async ({ page }) => {
    // Setze Auth-Token wenn vorhanden
    if (process.env.SUPABASE_TEST_TOKEN) {
      await setAuthToken(page, process.env.SUPABASE_TEST_TOKEN)
      const authenticated = await isAuthenticated(page)
      
      if (!authenticated) {
        console.error('❌ Auth-Token ungültig oder abgelaufen')
        test.skip()
      }
    } else {
      console.log('ℹ️  Überspringe Auth-Tests (SUPABASE_TEST_TOKEN nicht gesetzt)')
      test.skip()
    }
  })

  test.skip(skipAuthTests, 'Rezept-Übersicht anzeigen', async ({ page }) => {
    // Zum Login navigieren
    await page.goto('/auth')
    
    // Hier würde normaler Login-Flow stattfinden
    // Für echte Tests: Mock oder Test-Account verwenden
    
    // Nach erfolgreichem Login zur Rezeptliste
    await page.goto('/recipes')
    
    // Prüfe ob Rezepte angezeigt werden
    await expect(page.locator('h1, h2')).toContainText(/Rezept/i)
  })

  test.skip(skipAuthTests, 'Neues Rezept erstellen', async ({ page }) => {
    await page.goto('/recipe/new')
    
    // Formular ausfüllen
    await page.getByLabel(/Titel|Name/i).fill('Test Rezept')
    await page.getByLabel(/Beschreibung|Description/i).fill('Ein Test-Rezept')
    
    // Kategorie wählen
    const categorySelect = page.getByLabel(/Kategorie|Category/i)
    if (await categorySelect.count() > 0) {
      await categorySelect.first().selectOption('hauptgericht')
    }
    
    // Zutaten hinzufügen
    const ingredientInput = page.getByPlaceholder(/Zutat/i).first()
    await ingredientInput.fill('1 TL Salz')
    
    // Speichern
    const saveButton = page.getByRole('button', { name: /speichern|save/i })
    await saveButton.click()
    
    // Sollte zur Detail-Seite weiterleiten
    await expect(page).toHaveURL(/\/recipe\/\d+/)
  })

  test.skip(skipAuthTests, 'Rezept bearbeiten', async ({ page }) => {
    // Gehe zu einem bestehenden Rezept
    await page.goto('/recipes')
    
    // Klicke auf erstes Rezept
    await page.locator('article, .recipe-card').first().click()
    
    // Klicke auf Bearbeiten
    const editButton = page.getByRole('button', { name: /bearbeiten|edit/i })
    await editButton.click()
    
    await expect(page).toHaveURL(/\/recipe\/edit\/\d+/)
    
    // Ändere Titel
    const titleInput = page.getByLabel(/Titel|Name/i)
    await titleInput.fill('Geänderter Titel')
    
    // Speichern
    const saveButton = page.getByRole('button', { name: /speichern|save/i })
    await saveButton.click()
    
    // Prüfe ob gespeichert
    await expect(page.locator('body')).toContainText('Geänderter Titel')
  })

  test.skip(skipAuthTests, 'Rezept löschen', async ({ page }) => {
    await page.goto('/recipes')
    
    // Zähle aktuelle Rezepte
    const initialCount = await page.locator('article, .recipe-card').count()
    
    // Gehe zum ersten Rezept
    await page.locator('article, .recipe-card').first().click()
    
    // Lösche das Rezept
    const deleteButton = page.getByRole('button', { name: /löschen|delete/i })
    await deleteButton.click()
    
    // Bestätige Dialog (falls vorhanden)
    page.on('dialog', dialog => dialog.accept())
    
    // Sollte zurück zur Liste gehen
    await expect(page).toHaveURL(/\/recipes/)
    
    // Ein Rezept weniger
    const newCount = await page.locator('article, .recipe-card').count()
    expect(newCount).toBe(initialCount - 1)
  })
})

test.describe('Bring! Shopping List Integration (benötigt Login)', () => {
  test.skip(skipAuthTests, 'Bring! Login Dialog öffnen', async ({ page }) => {
    await page.goto('/settings')
    
    // Suche Bring! Integration
    const bringSection = page.getByText(/Bring!/i)
    await expect(bringSection).toBeVisible()
    
    // Klicke auf Login/Verbinden
    const bringButton = page.getByRole('button', { name: /Bring!|verbinden|connect/i })
    if (await bringButton.count() > 0) {
      await bringButton.click()
      
      // Dialog oder Formular sollte erscheinen
      await expect(page.getByLabel(/Email|E-Mail/i)).toBeVisible()
    }
  })
})

/**
 * Helper: Setup authenticated state
 * Für echte CI/CD würde man hier:
 * 1. Supabase Test-Token generieren
 * 2. LocalStorage mit Auth-Session füllen
 * 3. Cookies setzen
 */
test.describe.configure({ mode: 'serial' })

// Uncomment für lokale Tests wenn eingeloggt:
// test.use({ 
//   storageState: 'playwright/.auth/user.json' 
// })
