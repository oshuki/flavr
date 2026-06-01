import { Page } from '@playwright/test'

/**
 * Auth Helper für E2E Tests
 * Handles Supabase Email/Password Login
 */

export const TEST_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'oshuki@gmail.com',
  password: process.env.TEST_USER_PASSWORD || 'prudens'
}

/**
 * Login via Supabase Email/Password
 * Verwendet Email + Passwort statt OAuth für Tests
 */
export async function login(page: Page): Promise<boolean> {
  try {
    // Gehe zur Login-Seite
    await page.goto('/auth')
    
    // Prüfe ob bereits eingeloggt
    const isLoggedIn = await isAuthenticated(page)
    if (isLoggedIn) {
      console.log('✓ Bereits eingeloggt')
      return true
    }
    
    // Suche Email-Input Feld
    const emailInput = page.locator('input[type="email"]').or(
      page.getByPlaceholder(/email/i)
    ).or(
      page.getByLabel(/email/i)
    )
    
    // Warte auf das Email-Feld
    await emailInput.waitFor({ timeout: 5000 })
    await emailInput.fill(TEST_CREDENTIALS.email)
    
    // Suche Password-Input Feld
    const passwordInput = page.locator('input[type="password"]').or(
      page.getByPlaceholder(/password|passwort/i)
    ).or(
      page.getByLabel(/password|passwort/i)
    )
    
    await passwordInput.fill(TEST_CREDENTIALS.password)
    
    // Login-Button klicken
    const loginButton = page.getByRole('button', { name: /anmelden|login|sign in/i }).first()
    await loginButton.click()
    
    // Warte auf erfolgreichen Login (Weiterleitung)
    await page.waitForURL(/\/(recipes|$)/, { timeout: 10000 })
    
    // Verifiziere dass wir eingeloggt sind
    await page.waitForTimeout(1000)
    const loggedIn = await isAuthenticated(page)
    
    if (loggedIn) {
      console.log('✓ Login erfolgreich')
      return true
    } else {
      console.error('✗ Login fehlgeschlagen - kein Auth-Token gefunden')
      return false
    }
  } catch (error) {
    console.error('Login fehlgeschlagen:', error)
    return false
  }
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  } catch (e) {
    // Ignore localStorage errors
  }
  await page.goto('/')
}

/**
 * Setzt Supabase Auth-Token direkt (für Tests)
 * 
 * Um einen echten Token zu bekommen:
 * 1. Lokal einloggen
 * 2. In DevTools: localStorage.getItem('sb-htescszituyzooubmxkh-auth-token')
 * 3. Token kopieren und als ENV variable setzen
 */
export async function setAuthToken(page: Page, token?: string): Promise<void> {
  const authToken = token || process.env.SUPABASE_TEST_TOKEN
  
  if (!authToken) {
    console.warn('⚠️  Kein SUPABASE_TEST_TOKEN gesetzt')
    return
  }
  
  await page.goto('/')
  
  try {
    await page.evaluate((tokenData) => {
      localStorage.setItem('sb-htescszituyzooubmxkh-auth-token', tokenData)
    }, authToken)
  } catch (e) {
    console.warn('⚠️  Konnte Auth-Token nicht setzen:', e)
    return
  }
  
  // Reload um Auth-State zu aktivieren
  await page.reload()
}

/**
 * Prüft ob User eingeloggt ist
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      const token = localStorage.getItem('sb-htescszituyzooubmxkh-auth-token')
      return token !== null && token !== ''
    })
  } catch (e) {
    // localStorage nicht verfügbar (CORS/Security)
    return false
  }
}
