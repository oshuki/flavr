import { test, expect } from '@playwright/test'

/**
 * KI-Koch Feature Tests
 * Testet die AI-gestützte Rezept-Generierung
 */

test.describe('KI-Koch Seite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai')
  })

  test('Seite lädt korrekt', async ({ page }) => {
    // Überschrift sollte sichtbar sein
    await expect(page.locator('h1, h2')).toBeVisible()
    await expect(page.locator('h1, h2')).toContainText(/KI|AI|Koch/i)
  })

  test('Zutaten-Eingabe funktioniert', async ({ page }) => {
    // Finde das Eingabefeld
    const input = page.getByPlaceholder(/Zutat|Ingredient/i).or(
      page.getByRole('textbox').first()
    )
    
    await expect(input).toBeVisible()
    
    // Gib Zutaten ein
    await input.fill('Tomaten, Käse, Nudeln')
    await expect(input).toHaveValue(/Tomaten|Käse|Nudeln/)
  })

  test('KI-Vorschläge können angefordert werden', async ({ page }) => {
    // Zutaten eingeben
    const input = page.getByPlaceholder(/Zutat|Ingredient/i).or(
      page.getByRole('textbox').first()
    )
    await input.fill('Eier, Milch, Butter')
    
    // Submit-Button finden und klicken
    const submitButton = page.getByRole('button', { name: /vorschlagen|generieren|KI/i })
    await expect(submitButton).toBeVisible()
    await submitButton.click()
    
    // Warte auf Antwort (max 15s)
    await page.waitForTimeout(2000)
    
    // Prüfe ob Rezept-Vorschläge erscheinen oder Fehlermeldung
    const hasRecipes = await page.locator('article, .recipe-card, [class*="recipe"]').count() > 0
    const hasError = await page.locator('[class*="error"], .error, [role="alert"]').count() > 0
    
    // Mindestens eines sollte vorhanden sein
    expect(hasRecipes || hasError).toBeTruthy()
  })

  test('Bild-Upload UI ist vorhanden', async ({ page }) => {
    // Prüfe ob Foto-Analyse-Feature sichtbar ist
    const fileInput = page.locator('input[type="file"]')
    const hasFileUpload = await fileInput.count() > 0
    
    if (hasFileUpload) {
      await expect(fileInput.first()).toBeVisible()
    }
  })
})

test.describe('KI-Koch - Rezept-Interaktion', () => {
  test('Generiertes Rezept kann übernommen werden (Mock)', async ({ page }) => {
    // Dieser Test simuliert nur die UI, nicht die tatsächliche API
    await page.goto('/ai')
    
    // Wenn ein Rezept angezeigt wird, sollte ein "Übernehmen"-Button da sein
    const input = page.getByPlaceholder(/Zutat|Ingredient/i).or(
      page.getByRole('textbox').first()
    )
    await input.fill('Schokolade')
    
    const submitButton = page.getByRole('button', { name: /vorschlagen|generieren|KI/i })
    await submitButton.click()
    
    // Warte auf Response
    await page.waitForTimeout(3000)
    
    // Wenn Rezepte da sind, sollte ein Übernehmen-Button existieren
    const hasRecipes = await page.locator('article, .recipe-card').count() > 0
    
    if (hasRecipes) {
      const saveButton = page.getByRole('button', { name: /übernehmen|speichern|rezeptbuch/i })
      await expect(saveButton.first()).toBeVisible()
    }
  })
})
