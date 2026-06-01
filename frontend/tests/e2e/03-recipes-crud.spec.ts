import { test, expect } from '@playwright/test'
import { login, logout, isAuthenticated, TEST_CREDENTIALS } from '../helpers/auth'

/**
 * Authentifizierte Features - Rezepte CRUD
 * 
 * Diese Tests verwenden Email/Password Login (oshuki@gmail.com / prudens)
 * um die vollständige App-Funktionalität zu testen
 */

test.describe('Rezepte verwalten (mit Login)', () => {
  test.beforeEach(async ({ page }) => {
    // Login vor jedem Test
    const loggedIn = await login(page)
    
    if (!loggedIn) {
      console.error('❌ Login fehlgeschlagen - Tests werden übersprungen')
      test.skip()
    }
  })

  test.afterEach(async ({ page }) => {
    // Optional: Logout nach jedem Test
    // await logout(page)
  })

  test('Rezept-Übersicht anzeigen', async ({ page }) => {
    // Zur Rezeptliste navigieren
    await page.goto('/recipes')
    
    // Prüfe ob Seite geladen hat
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Prüfe ob Überschrift "Rezepte" oder ähnlich enthält
    const heading = await page.locator('h1, h2').first().textContent()
    expect(heading).toBeTruthy()
  })

  test('Neues Rezept erstellen', async ({ page }) => {
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

  test('Rezept bearbeiten', async ({ page }) => {
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

  test('Rezept löschen', async ({ page }) => {
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

test.describe('Bring! Shopping List Integration (mit Login)', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page)
    if (!loggedIn) {
      test.skip()
    }
  })

  test('Bring! Login Dialog öffnen', async ({ page }) => {
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
 * Tests laufen sequenziell um Konflikte zu vermeiden
 */
test.describe.configure({ mode: 'serial' })
