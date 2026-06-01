import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration für Flavr
 * 
 * Tests können lokal ausgeführt werden gegen:
 * - Lokale Dev-Server (npm run dev)
 * - Production URL (https://flavr-nuxt.pages.dev)
 */

export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout für einzelne Tests
  timeout: 30 * 1000,
  
  // Erwarte dass Tests nicht länger als 30s dauern
  expect: {
    timeout: 5000
  },
  
  // Parallel ausführen
  fullyParallel: true,
  
  // Fehlerhafte Tests wiederholen (auf CI)
  retries: process.env.CI ? 2 : 0,
  
  // Worker-Anzahl
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // Shared settings für alle Projekte
  use: {
    // Base URL - kann via ENV überschrieben werden
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002',
    
    // Screenshots bei Fehlern
    screenshot: 'only-on-failure',
    
    // Video bei Fehlern
    video: 'retain-on-failure',
    
    // Trace bei Fehlern (für Debugging)
    trace: 'on-first-retry',
  },

  // Browser-Konfigurationen
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Optional: Weitere Browser
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // Mobile viewport
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Dev-Server (optional - für lokale Tests)
  // Wenn Tests laufen sollen, ohne dass Dev-Server manuell gestartet wird
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3002',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
})
