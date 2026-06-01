import { Hono } from 'hono'
import { cors } from 'hono/cors'
import express from 'express'
import 'dotenv/config'
import * as Sentry from '@sentry/node'
import { RewriteFrames } from '@sentry/integrations'

// Types
interface ClaudeRequest {
  model: string
  system?: string
  messages: Array<{ role: string; content: any[] | string }>
  max_tokens: number
}

// App & Middleware
const app = new Hono()

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
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
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
// IMAGE PROXY - Pollinations (für Localhost CORS-Probleme)
// ══════════════════════════════════════════════════════════════
app.post('/api/image-proxy', async (c) => {
  try {
    const { url } = await c.req.json()

    if (!url || typeof url !== 'string') {
      return c.json({ error: 'URL required' }, 400 as any)
    }

    // Security: Nur Pollinations & Google Fonts erlauben
    if (!url.includes('image.pollinations.ai') && !url.includes('fonts.googleapis')) {
      return c.json({ error: 'URL not allowed' }, 403 as any)
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Flavr/1.0' },
    })

    if (!response.ok) {
      return c.json({ error: `HTTP ${response.status}` }, response.status as any)
    }

    const blob = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    return new Response(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 1 Jahr cachen
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    try { Sentry.captureException(error) } catch (e) {}
    return c.json({ error: 'Proxy failed', details: error instanceof Error ? error.message : String(error) }, 500 as any)
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

    const results = []

    for (const item of items) {
      const { name, spec = '' } = item
      if (!name) continue

      const body = `purchase=${encodeURIComponent(name)}&specification=${encodeURIComponent(spec)}&remove=`

      const response = await fetch(`${BRING_API}/bringlists/${listId}`, {
        method: 'PUT',
        headers: {
          ...BRING_HEADERS_BASE,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Authorization': `Bearer ${token}`,
          'X-BRING-USER-UUID': uuid,
        },
        body,
      })

      results.push({ name, ok: response.ok, status: response.status })
    }

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
expressApp.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
})
