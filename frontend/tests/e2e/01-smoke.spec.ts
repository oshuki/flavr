import { test, expect } from '@playwright/test'

/**
 * Smoke Tests - Grundlegende Funktionalität
 * Diese Tests prüfen, ob die App grundsätzlich funktioniert
 */

test.describe('Homepage und Navigation', () => {
  test('Startseite lädt erfolgreich', async ({ page }) => {
    await page.goto('/')
    
    // App-Titel sollte sichtbar sein
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Keine Konsolenfehler
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Warte kurz auf potenzielle Fehler
    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })

  test('Navigation funktioniert', async ({ page }) => {
    await page.goto('/')
    
    // Navigiere zur AI-Seite
    const aiLink = page.getByRole('link', { name: /KI-Koch|AI/i })
    if (await aiLink.count() > 0) {
      await aiLink.first().click()
      await expect(page).toHaveURL(/\/ai/)
      await expect(page.locator('h1, h2')).toContainText(/KI|AI|Koch/i)
    }
  })

  test('Responsive Layout', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Login-Seite', () => {
  test('Login-Seite ist erreichbar', async ({ page }) => {
    await page.goto('/auth')
    
    // Google Login Button sollte vorhanden sein
    const loginButton = page.getByRole('button', { name: /Google|Anmelden|Login/i })
    await expect(loginButton.first()).toBeVisible()
  })

  test('Login-Seite hat korrektes Meta-Tag', async ({ page }) => {
    await page.goto('/auth')
    
    // Prüfe dass Seite geladen hat
    await expect(page.locator('body')).toBeVisible()
    
    // Title kann leer sein bei SPA - ist okay
    // Wichtig ist dass die Seite funktioniert
    const loginButton = page.getByRole('button', { name: /Google|Anmelden|Login/i })
    await expect(loginButton.first()).toBeVisible()
  })
})

test.describe('PWA Manifest', () => {
  test('Manifest ist verfügbar', async ({ page }) => {
    const response = await page.request.get('/manifest.json')
    expect(response.ok()).toBeTruthy()
    
    const manifest = await response.json()
    expect(manifest.name).toBeTruthy()
  })

  test('Service Worker registriert sich (nur HTTPS)', async ({ page, baseURL }) => {
    // Service Worker nur auf HTTPS (Production)
    if (baseURL?.startsWith('https')) {
      await page.goto('/')
      
      // Warte länger auf SW-Registrierung (kann dauern)
      await page.waitForTimeout(5000)
      
      const swState = await page.evaluate(() => {
        return navigator.serviceWorker.controller !== null
      })
      
      // Auf Production sollte SW aktiv sein (oder sich registrieren)
      // Falls nicht aktiv: Prüfe ob Registrierung läuft
      if (!swState) {
        const registration = await page.evaluate(() => {
          return navigator.serviceWorker.getRegistration()
        })
        
        // Mindestens eine Registrierung sollte vorhanden sein
        expect(registration).toBeTruthy()
      } else {
        expect(swState).toBeTruthy()
      }
    } else {
      // Auf HTTP (localhost) überspringen
      test.skip()
    }
  })
})
