import { Page } from '@playwright/test'

/**
 * Auth Helper für E2E Tests
 * Handles Supabase Google OAuth Login
 */

export const TEST_CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'oshuki@gmail.com',
  password: process.env.TEST_USER_PASSWORD || 'prudens'
}

/**
 * Login via Supabase
 * WICHTIG: Funktioniert nur mit Email/Password Auth, nicht mit OAuth
 * 
 * Für OAuth-Tests müsste man:
 * 1. Supabase Test-Token generieren
 * 2. Direkt localStorage setzen
 * 3. Oder OAuth-Flow mocken
 */
export async function login(page: Page): Promise<boolean> {
  try {
    // Gehe zur Login-Seite
    await page.goto('/auth')
    
    // Prüfe ob bereits eingeloggt
    const isLoggedIn = await page.evaluate(() => {
      const session = localStorage.getItem('sb-htescszituyzooubmxkh-auth-token')
      return session !== null
    })
    
    if (isLoggedIn) {
      console.log('✓ Bereits eingeloggt')
      return true
    }
    
    // Google OAuth Button klicken
    const googleButton = page.getByRole('button', { name: /Google|Anmelden/i })
    await googleButton.click()
    
    // Warte auf Weiterleitung oder Email-Input
    // Da wir Google OAuth haben, können wir nicht direkt Email/Password eingeben
    // Für echte Tests müssten wir:
    // 1. Supabase Auth-Token manuell setzen
    // 2. Oder einen Test-Account mit Email/Password Auth anlegen
    
    console.warn('⚠️  OAuth-Login in Tests nicht vollständig implementiert')
    console.warn('   Für echte Auth-Tests: Supabase Test-Token im localStorage setzen')
    
    return false
  } catch (error) {
    console.error('Login fehlgeschlagen:', error)
    return false
  }
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
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
  
  await page.evaluate((tokenData) => {
    localStorage.setItem('sb-htescszituyzooubmxkh-auth-token', tokenData)
  }, authToken)
  
  // Reload um Auth-State zu aktivieren
  await page.reload()
}

/**
 * Prüft ob User eingeloggt ist
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const token = localStorage.getItem('sb-htescszituyzooubmxkh-auth-token')
    return token !== null && token !== ''
  })
}
