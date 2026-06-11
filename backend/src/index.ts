import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { cors } from 'hono/cors'
import express from 'express'
import 'dotenv/config'
import * as Sentry from '@sentry/node'
import { RewriteFrames } from '@sentry/integrations'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

// Types
interface ClaudeRequest {
  model: string
  system?: string
  messages: Array<{ role: string; content: any[] | string }>
  max_tokens: number
}

// App & Middleware
export const app = new Hono<{ Variables: { userId: string } }>()

// Initialize Sentry (backend)
try {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_BACKEND || undefined,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    
    // Release Tracking
    release: process.env.RAILWAY_GIT_COMMIT_SHA || 'development',
    
    integrations: [
      new RewriteFrames({ root: globalThis?.process?.cwd() || '' }) as any,
    ],
    
    // Ignore bestimmte Error-Typen
    ignoreErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
    ],
    
    // Performance Monitoring
    beforeSend(event, hint) {
      // Log critical errors
      if (event.level === 'fatal' || event.level === 'error') {
        console.error('Sentry Error:', hint?.originalException || event.message)
      }
      
      // Filter aus Informationen, die nicht gesendet werden sollen
      if (event.request?.data) {
        const requestData = event.request.data as Record<string, unknown>
        // Entferne potentiell sensitive Daten
        delete requestData.password
        delete requestData.token
      }
      
      return event
    },
  })
  console.log('✓ Sentry initialized (backend)')
} catch (e) {
  console.warn('⚠️  Sentry init failed:', e)
}

// CORS für Frontend (localhost:5173 von Vite, sowie Production)
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:8080',
    'https://flavrapp.netlify.app',
    'https://flavr.pages.dev',
    'https://flavr-nuxt.pages.dev',
    'https://flavr.9zehn77.de',
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
}))

// ══════════════════════════════════════════════════════════════
// SUPABASE CLIENTS - lazy, modul-global
// ══════════════════════════════════════════════════════════════
let supabaseAnonClient: SupabaseClient | null | undefined
let supabaseServiceClient: SupabaseClient | null | undefined

function getSupabaseAnonClient(): SupabaseClient | null {
  if (supabaseAnonClient !== undefined) return supabaseAnonClient

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    supabaseAnonClient = null
    return supabaseAnonClient
  }

  supabaseAnonClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return supabaseAnonClient
}

function getSupabaseServiceClient(): SupabaseClient | null {
  if (supabaseServiceClient !== undefined) return supabaseServiceClient

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    supabaseServiceClient = null
    return supabaseServiceClient
  }

  supabaseServiceClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return supabaseServiceClient
}

// ══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE - verifiziert Supabase JWT
// ══════════════════════════════════════════════════════════════
async function requireAuth(c: Context<{ Variables: { userId: string } }>, next: Next) {
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token) {
    return c.json({ error: 'Nicht authentifiziert' }, 401 as any)
  }

  const supabase = getSupabaseAnonClient()
  if (!supabase) {
    console.error('requireAuth: SUPABASE_URL oder SUPABASE_ANON_KEY nicht gesetzt — alle authentifizierten Requests werden mit 401 abgelehnt')
    return c.json({ error: 'Nicht authentifiziert' }, 401 as any)
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) {
      console.error('requireAuth: Token-Verifikation fehlgeschlagen:', error?.message || 'kein User')
      return c.json({ error: 'Nicht authentifiziert' }, 401 as any)
    }

    c.set('userId', data.user.id)
    await next()
  } catch (err) {
    console.error('Auth verification error:', err)
    try { Sentry.captureException(err) } catch (e) {}
    return c.json({ error: 'Nicht authentifiziert' }, 401 as any)
  }
}

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      unsplashAccessKey: !!process.env.UNSPLASH_ACCESS_KEY,
    },
  })
})

// ══════════════════════════════════════════════════════════════
// RATE LIMITING - Simple In-Memory Rate Limiter
// ══════════════════════════════════════════════════════════════
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 Minute
const RATE_LIMIT_MAX = 20 // 20 Requests pro Minute

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Cleanup alte Einträge (älter als 5 Minuten)
  if (rateLimitStore.size > 1000) {
    const fiveMinutesAgo = now - 5 * 60 * 1000
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < fiveMinutesAgo) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    // Neues Zeitfenster
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    // Limit überschritten
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  // Request erlaubt, Counter erhöhen
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetTime: entry.resetTime }
}

// ══════════════════════════════════════════════════════════════
// CLAUDE API PROXY - Recipe Extraction & AI Cook
// ══════════════════════════════════════════════════════════════
app.post('/api/claude', async (c) => {
  try {
    // Rate Limiting Check
    const clientIP = c.req.header('x-forwarded-for')?.split(',')[0].trim() || 
                     c.req.header('x-real-ip') || 
                     'unknown'
    
    const rateLimit = checkRateLimit(clientIP)
    
    // Rate Limit Headers setzen
    c.header('X-RateLimit-Limit', RATE_LIMIT_MAX.toString())
    c.header('X-RateLimit-Remaining', rateLimit.remaining.toString())
    c.header('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      c.header('Retry-After', retryAfter.toString())
      return c.json({ 
        error: 'Rate limit exceeded', 
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter 
      }, 429 as any)
    }

    const body: ClaudeRequest = await c.req.json()
    const apiKey = process.env.CLAUDE_API_KEY
    const useMock = process.env.USE_MOCK_AI === 'true' || !apiKey

    if (useMock) {
      // Mock mode for testing without API key
      console.log('🤖 Using mock AI (no API key or USE_MOCK_AI=true)')
      
      const userMessage = body.messages[0]?.content
      const isArray = Array.isArray(userMessage)
      const textContent = isArray 
        ? userMessage.find((c: any) => c.type === 'text')?.text 
        : userMessage
      
      // Detect request type
      if (textContent?.includes('ingredients:')) {
        // Recipe suggestions
        return c.json({
          content: [{
            type: 'text',
            text: JSON.stringify([
              {
                title: 'Klassisches Rührei',
                ingredients: ['3 Eier', '50ml Milch', 'Salz', 'Pfeffer', '1 EL Butter'],
                steps: [
                  'Eier mit Milch verquirlen',
                  'Mit Salz und Pfeffer würzen',
                  'Butter in der Pfanne erhitzen',
                  'Eiermasse hinzugeben und bei mittlerer Hitze stocken lassen',
                  'Dabei ständig rühren'
                ],
                duration: 10,
                servings: 2
              },
              {
                title: 'Käse-Omelett',
                ingredients: ['3 Eier', '50g geriebener Käse', 'Salz', 'Pfeffer', '1 EL Öl'],
                steps: [
                  'Eier verquirlen und würzen',
                  'Öl in der Pfanne erhitzen',
                  'Eiermasse hineingeben',
                  'Käse darüber streuen',
                  'Zusammenklappen und servieren'
                ],
                duration: 15,
                servings: 2
              },
              {
                title: 'Eier-Käse-Toast',
                ingredients: ['2 Eier', '2 Scheiben Toast', '50g Käse', 'Butter'],
                steps: [
                  'Toast toasten',
                  'Eier braten',
                  'Käse auf Toast legen',
                  'Eier darauf setzen',
                  'Mit Käse überbacken'
                ],
                duration: 12,
                servings: 1
              }
            ])
          }]
        })
      } else if (isArray && userMessage.some((c: any) => c.type === 'image')) {
        // Image analysis
        return c.json({
          content: [{
            type: 'text',
            text: JSON.stringify({
              ingredients: ['Tomaten', 'Zwiebeln', 'Knoblauch', 'Olivenöl']
            })
          }]
        })
      } else {
        // Generic response
        return c.json({
          content: [{
            type: 'text',
            text: '{"title": "Mock Rezept", "ingredients": ["Zutat 1"], "steps": ["Schritt 1"], "duration": 30, "servings": 2}'
          }]
        })
      }
    }

    // Real API call
    if (!apiKey) {
      return c.json({ error: 'Claude API key not configured. Set USE_MOCK_AI=true for testing.' }, 500 as any)
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return c.json({ error: error.error?.message || `HTTP ${response.status}` }, response.status as any)
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('Claude proxy error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, 500 as any)
  }
})

// ══════════════════════════════════════════════════════════════
// RECIPE IMAGE SUGGEST - Pollinations (default) / Unsplash (prefer)
// ══════════════════════════════════════════════════════════════
interface UnsplashCacheEntry {
  results: ImageSuggestion[]
  expires: number
}

interface ImageSuggestion {
  source: 'pollinations' | 'unsplash'
  url: string
  thumbUrl: string
  credit: string | null
  creditUrl: string | null
}

const unsplashCache = new Map<string, UnsplashCacheEntry>()
const UNSPLASH_CACHE_TTL = 60 * 60 * 1000 // 1 Stunde

function cleanupUnsplashCache() {
  if (unsplashCache.size > 1000) {
    const now = Date.now()
    for (const [key, value] of unsplashCache.entries()) {
      if (value.expires < now) {
        unsplashCache.delete(key)
      }
    }
  }
}

function buildPollinationsPrompt(query: string): string {
  return `professional food photography, ${query}, appetizing, natural lighting, on a beautiful plate, restaurant quality`
}

// Deterministischer Seed aus query + Index
function seedFromQuery(query: string, index: number): number {
  let hash = 0
  const input = `${query}::${index}`
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

function buildPollinationsSuggestions(query: string, count: number): ImageSuggestion[] {
  const prompt = buildPollinationsPrompt(query)
  const encodedPrompt = encodeURIComponent(prompt)
  const suggestions: ImageSuggestion[] = []

  for (let i = 0; i < count; i++) {
    const seed = seedFromQuery(query, i)
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&seed=${seed}`
    suggestions.push({
      source: 'pollinations',
      url,
      thumbUrl: url,
      credit: null,
      creditUrl: null,
    })
  }

  return suggestions
}

app.post('/api/recipe-image/suggest', requireAuth, async (c) => {
  try {
    // Rate Limiting Check
    const clientIP = c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
                     c.req.header('x-real-ip') ||
                     'unknown'

    const rateLimit = checkRateLimit(clientIP)
    c.header('X-RateLimit-Limit', RATE_LIMIT_MAX.toString())
    c.header('X-RateLimit-Remaining', rateLimit.remaining.toString())
    c.header('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      c.header('Retry-After', retryAfter.toString())
      return c.json({ error: 'Rate limit exceeded', retryAfter }, 429 as any)
    }

    const body = await c.req.json().catch(() => ({}))
    const { query, count: rawCount, prefer } = body as { query?: unknown; count?: unknown; prefer?: unknown }

    if (typeof query !== 'string' || query.trim().length === 0 || query.length > 200) {
      return c.json({ error: 'Query erforderlich' }, 400 as any)
    }

    let count = 3
    if (typeof rawCount === 'number' && Number.isFinite(rawCount)) {
      count = Math.min(6, Math.max(1, Math.floor(rawCount)))
    }

    if (prefer === 'unsplash') {
      const accessKey = process.env.UNSPLASH_ACCESS_KEY
      if (!accessKey) {
        return c.json({ error: 'Bildersuche nicht konfiguriert' }, 503 as any)
      }

      const cacheKey = `${query.trim().toLowerCase()}::${count}`
      cleanupUnsplashCache()

      const cached = unsplashCache.get(cacheKey)
      if (cached && cached.expires > Date.now()) {
        c.header('X-Cache', 'HIT')
        return c.json({ suggestions: cached.results, fallbackUsed: true })
      }

      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&content_filter=high`

      let response: Response
      try {
        response = await fetch(url, {
          headers: { Authorization: `Client-ID ${accessKey}` },
        })
      } catch (fetchErr) {
        console.error('Unsplash fetch error:', fetchErr)
        try { Sentry.captureException(fetchErr) } catch (e) {}
        return c.json({ error: 'Bildquelle nicht erreichbar' }, 502 as any)
      }

      if (!response.ok) {
        return c.json({ error: 'Bildquelle nicht erreichbar' }, 502 as any)
      }

      const data: any = await response.json()
      const results: any[] = data.results || []

      if (results.length === 0) {
        return c.json({ error: 'Kein Bild gefunden' }, 404 as any)
      }

      const suggestions: ImageSuggestion[] = results.map((photo: any) => ({
        source: 'unsplash' as const,
        url: photo.urls.regular,
        thumbUrl: photo.urls.thumb,
        credit: photo.user?.name ?? null,
        creditUrl: photo.user?.links?.html
          ? `${photo.user.links.html}?utm_source=flavr&utm_medium=referral`
          : null,
      }))

      // Download-Trigger gemäß Unsplash-Guideline
      for (const photo of results) {
        if (photo.links?.download_location) {
          fetch(photo.links.download_location, {
            headers: { Authorization: `Client-ID ${accessKey}` },
          }).catch(() => {})
        }
      }

      unsplashCache.set(cacheKey, { results: suggestions, expires: Date.now() + UNSPLASH_CACHE_TTL })

      c.header('X-Cache', 'MISS')
      return c.json({ suggestions, fallbackUsed: true })
    }

    const suggestions = buildPollinationsSuggestions(query, count)
    return c.json({ suggestions, fallbackUsed: false })
  } catch (error) {
    console.error('Recipe image suggest error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Bildersuche fehlgeschlagen' }, 500 as any)
  }
})

// ══════════════════════════════════════════════════════════════
// RECIPE IMAGE PERSIST - Pollinations-Bild in Supabase Storage sichern
// ══════════════════════════════════════════════════════════════
app.post('/api/recipe-image/persist', requireAuth, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const { url } = body as { url?: unknown }

    if (typeof url !== 'string' || url.trim().length === 0) {
      return c.json({ error: 'URL erforderlich' }, 400 as any)
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return c.json({ error: 'URL nicht erlaubt' }, 400 as any)
    }

    if (parsedUrl.hostname !== 'image.pollinations.ai') {
      return c.json({ error: 'URL nicht erlaubt' }, 400 as any)
    }

    const serviceClient = getSupabaseServiceClient()
    if (!serviceClient) {
      return c.json({ error: 'Bildspeicher nicht konfiguriert' }, 503 as any)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    let response: Response
    try {
      response = await fetch(parsedUrl.toString(), { signal: controller.signal })
    } catch (fetchErr) {
      clearTimeout(timeout)
      console.error('Recipe image persist fetch error:', fetchErr)
      try { Sentry.captureException(fetchErr) } catch (e) {}
      return c.json({ error: 'Bild konnte nicht geladen werden' }, 502 as any)
    }
    clearTimeout(timeout)

    if (!response.ok) {
      return c.json({ error: 'Bild konnte nicht geladen werden' }, 502 as any)
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()

    const userId = c.get('userId')
    const path = `${userId}/ai/${randomUUID()}.jpg`

    const { error: uploadError } = await serviceClient.storage
      .from('recipe-images')
      .upload(path, Buffer.from(arrayBuffer), {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error('Recipe image persist upload error:', uploadError)
      try { Sentry.captureException(uploadError) } catch (e) {}
      return c.json({ error: 'Speichern fehlgeschlagen' }, 500 as any)
    }

    const { data: publicUrlData } = serviceClient.storage
      .from('recipe-images')
      .getPublicUrl(path)

    return c.json({ imageUrl: publicUrlData.publicUrl, source: 'pollinations' })
  } catch (error) {
    console.error('Recipe image persist error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Speichern fehlgeschlagen' }, 500 as any)
  }
})

// ══════════════════════════════════════════════════════════════
// URL FETCH PROXY - Rezept-Import (CORS-Workaround)
// ══════════════════════════════════════════════════════════════
app.post('/api/fetch-url', async (c) => {
  try {
    const { url } = await c.req.json()

    if (!url || typeof url !== 'string') {
      return c.json({ error: 'URL erforderlich' }, 400 as any)
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return c.json({ error: 'Nur HTTP(S)-URLs erlaubt' }, 400 as any)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Flavr/1.0; recipe-importer)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'de,en;q=0.9',
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!response.ok) {
        return c.json({ error: `HTTP ${response.status}` }, 502 as any)
      }

      const html = await response.text()
      return c.json({ html })
    } catch (fetchErr: any) {
      clearTimeout(timeout)
      if (fetchErr.name === 'AbortError') {
        return c.json({ error: 'Timeout beim Abrufen der URL' }, 504 as any)
      }
      throw fetchErr
    }
  } catch (error) {
    console.error('URL fetch proxy error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Fetch fehlgeschlagen', details: error instanceof Error ? error.message : String(error) }, 500 as any)
  }
})

// ══════════════════════════════════════════════════════════════
// BRING! API PROXY - Shopping List Integration
// ══════════════════════════════════════════════════════════════
const BRING_API = 'https://api.getbring.com/rest/v2'
const BRING_HEADERS_BASE = {
  'X-BRING-API-KEY': 'cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp',
  'X-BRING-CLIENT': 'webApp',
  'X-BRING-CLIENT-SOURCE': 'webApp',
  'X-BRING-COUNTRY': 'DE',
}

// Login to Bring!
app.post('/api/bring/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email und Passwort erforderlich' }, 400 as any)
    }

    const response = await fetch(`${BRING_API}/bringauth`, {
      method: 'POST',
      body: new URLSearchParams({ email, password }),
    })

    const text = await response.text()
    let data: any

    try {
      data = JSON.parse(text)
    } catch {
      return c.json({ error: `Bring API Fehler (${response.status}): ${text}` }, 401 as any)
    }

    if (!response.ok || data.error) {
      return c.json({ error: data.message || 'Login fehlgeschlagen' }, 401 as any)
    }

    return c.json(data)
  } catch (error) {
    console.error('Bring login error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Login fehlgeschlagen', details: error instanceof Error ? error.message : String(error) }, 500 as any)
  }
})

// Get shopping lists
app.post('/api/bring/lists', async (c) => {
  try {
    const { token, uuid } = await c.req.json()

    if (!token || !uuid) {
      return c.json({ error: 'Token und UUID erforderlich' }, 400 as any)
    }

    const response = await fetch(`${BRING_API}/bringusers/${uuid}/lists`, {
      headers: {
        ...BRING_HEADERS_BASE,
        'Authorization': `Bearer ${token}`,
        'X-BRING-USER-UUID': uuid,
      },
    })

    const text = await response.text()
    let data: any

    try {
      data = JSON.parse(text)
    } catch {
      return c.json({ error: `Bring API Fehler (${response.status}): ${text}` }, 500 as any)
    }

    if (!response.ok) {
      return c.json({ error: 'Listen konnten nicht geladen werden' }, response.status as any)
    }

    return c.json(data)
  } catch (error) {
    console.error('Bring lists error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Fehler beim Laden der Listen', details: error instanceof Error ? error.message : String(error) }, 500 as any)
  }
})

// Add items to list
app.post('/api/bring/items', async (c) => {
  try {
    const { token, uuid, listId, items } = await c.req.json()

    if (!token || !uuid || !listId || !items || !Array.isArray(items)) {
      return c.json({ error: 'Token, UUID, listId und items array erforderlich' }, 400 as any)
    }

    const headers = {
      ...BRING_HEADERS_BASE,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Authorization': `Bearer ${token}`,
      'X-BRING-USER-UUID': uuid,
    }

    const results = await Promise.all(
      items
        .filter((item: any) => !!item.name)
        .map(async (item: any) => {
          const { name, spec = '' } = item
          const body = `purchase=${encodeURIComponent(name)}&specification=${encodeURIComponent(spec)}&remove=`
          const response = await fetch(`${BRING_API}/bringlists/${listId}`, {
            method: 'PUT', headers, body,
          })
          return { name, ok: response.ok, status: response.status }
        })
    )

    const allSuccess = results.every(r => r.ok)

    return c.json({ 
      success: allSuccess,
      results,
      message: allSuccess ? 'Alle Artikel hinzugefügt' : 'Einige Artikel konnten nicht hinzugefügt werden'
    })
  } catch (error) {
    console.error('Bring add items error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Fehler beim Hinzufügen', details: error instanceof Error ? error.message : String(error) }, 500 as any)
  }
})

// ══════════════════════════════════════════════════════════════
// ERROR HANDLING - Global Error Handler
// ══════════════════════════════════════════════════════════════
app.onError((err, c) => {
  console.error('Unhandled error:', err)

  const headersObj: Record<string, string> = {}
  c.req.raw.headers.forEach((value, key) => {
    headersObj[key] = value
  })
  
  // Sende zu Sentry
  try {
    Sentry.captureException(err, {
      contexts: {
        request: {
          method: c.req.method,
          url: c.req.url,
          headers: headersObj,
        },
      },
    })
  } catch (e) {
    console.error('Failed to send error to Sentry:', e)
  }

  // Generische Error Response
  const status = (err as any).status || 500
  return c.json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  }, status as any)
})

// ══════════════════════════════════════════════════════════════
// 404 Fallback
// ══════════════════════════════════════════════════════════════
app.all('*', (c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404)
})

// ══════════════════════════════════════════════════════════════
// EXPRESS SERVER - Host die Hono App
// ══════════════════════════════════════════════════════════════
const port = parseInt(process.env.PORT || '3000', 10)
const expressApp = express()

// JSON Parsing
expressApp.use(express.json())
expressApp.use(express.raw({ type: 'application/octet-stream' }))

// Request Handler - Convertiere Express zu Hono Requests
expressApp.use(async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
  try {
    const url = `http://localhost:${port}${req.originalUrl}`
    
    // Request Body vorbereiten
    let body: BodyInit | undefined = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'string') {
        body = req.body
      } else if (req.body && typeof req.body === 'object') {
        body = JSON.stringify(req.body)
      }
    }

    const honoRequest = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
      ...(body ? { body } : {}),
    })

    const honoResponse = await app.fetch(honoRequest)
    const buffer = await honoResponse.arrayBuffer()

    // Response Headers kopieren
    honoResponse.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    res.status(honoResponse.status)
    res.end(Buffer.from(buffer))
  } catch (err) {
    console.error('Handler error:', err)
    try { Sentry.captureException(err) } catch (e) {}
    res.status(500).json({ error: 'Internal server error', details: String(err) })
  }
})

expressApp.listen(port, () => {
  console.log(``)
  console.log(`  🚀 Backend läuft auf http://localhost:${port}`)
  console.log(`     Health Check: curl http://localhost:${port}/health`)
  console.log(`     Claude Proxy: curl -X POST http://localhost:${port}/api/claude`)
  console.log(``)

  // Keep-alive: ping self every 10 minutes so Render free tier doesn't sleep
  if (process.env.NODE_ENV === 'production') {
    const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`
    setInterval(async () => {
      try {
        await fetch(`${selfUrl}/health`)
      } catch (e) {}
    }, 10 * 60 * 1000)
  }
})
