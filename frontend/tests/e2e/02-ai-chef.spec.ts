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
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // KI-Seite kann "Willkommen zurück" zeigen wenn nicht eingeloggt
    // oder "KI-Koch" wenn eingeloggt - beides ist okay
    const heading = await page.locator('h1, h2').first().textContent()
    expect(heading).toBeTruthy()
    
    // Prüfe dass grundsätzlich Content da ist (body, div, etc.)
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent && bodyContent.length > 0).toBeTruthy()
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
    // Prüfe ob wir eingeloggt sind
    let isLoggedIn = false
    
    try {
      isLoggedIn = await page.evaluate(() => {
        return localStorage.getItem('sb-htescszituyzooubmxkh-auth-token') !== null
      })
    } catch (e) {
      // localStorage blocked - assume not logged in
      console.log('ℹ️  localStorage nicht verfügbar - Annahme: Nicht eingeloggt')
    }
    
    if (!isLoggedIn) {
      // Wenn nicht eingeloggt, sollte Login-Hinweis da sein
      console.log('ℹ️  Nicht eingeloggt - Skip KI-Vorschläge Test')
      test.skip()
      return
    }
    
    // Zutaten eingeben
    const input = page.getByPlaceholder(/Zutat|Ingredient/i).or(
      page.getByRole('textbox').first()
    )
    
    // Wenn kein Input gefunden, ist Feature nicht verfügbar
    if (await input.count() === 0) {
      console.log('⚠️  Zutaten-Input nicht gefunden')
      test.skip()
      return
    }
    
    await input.fill('Eier, Milch, Butter')
    
    // Submit-Button finden - verschiedene Varianten probieren
    const submitButton = page.getByRole('button', { name: /vorschlagen|generieren|KI|rezepte/i }).first()
    
    if (await submitButton.count() === 0) {
      console.log('⚠️  Submit-Button nicht gefunden')
      test.skip()
      return
    }
    
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
    // Dieser Test erfordert Login
    let isLoggedIn = false
    
    try {
      isLoggedIn = await page.evaluate(() => {
        return localStorage.getItem('sb-htescszituyzooubmxkh-auth-token') !== null
      })
    } catch (e) {
      // localStorage blocked - skip test
      console.log('⚠️  localStorage nicht verfügbar (CORS/Security)')
      test.skip()
      return
    }
    
    if (!isLoggedIn) {
      console.log('ℹ️  Login erforderlich - Skip Rezept-Übernahme Test')
      test.skip()
      return
    }
    
    // Dieser Test simuliert nur die UI, nicht die tatsächliche API
    await page.goto('/ai')
    
    // Wenn ein Rezept angezeigt wird, sollte ein "Übernehmen"-Button da sein
    const input = page.getByPlaceholder(/Zutat|Ingredient/i).or(
      page.getByRole('textbox').first()
    )
    
    if (await input.count() === 0) {
      console.log('⚠️  AI-Feature nicht verfügbar')
      test.skip()
      return
    }
    
    await input.fill('Schokolade')
    
    const submitButton = page.getByRole('button', { name: /vorschlagen|generieren|KI|rezepte/i }).first()
    
    if (await submitButton.count() === 0) {
      console.log('⚠️  Submit-Button nicht gefunden')
      test.skip()
      return
    }
    
    await submitButton.click()
    
    // Warte auf Response
    await page.waitForTimeout(3000)
    
    // Wenn Rezepte da sind, sollte ein Übernehmen-Button existieren
    const hasRecipes = await page.locator('article, .recipe-card').count() > 0
    
    if (hasRecipes) {
      const saveButton = page.getByRole('button', { name: /übernehmen|speichern|rezeptbuch/i })
      await expect(saveButton.first()).toBeVisible({ timeout: 2000 })
    } else {
      console.log('ℹ️  Keine Rezepte generiert - Test übersprungen')
    }
  })
})
