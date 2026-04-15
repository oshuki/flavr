import { Hono } from 'hono'
import { cors } from 'hono/cors'
import express from 'express'
import 'dotenv/config'

// Types
interface ClaudeRequest {
  model: string
  system: string
  messages: Array<{ role: string; content: any[] | string }>
  max_tokens: number
}

// App & Middleware
const app = new Hono()

// CORS für Frontend (localhost:5173 von Vite, sowie Production)
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://flavr.example.com', // Später deine Production URL
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
// CLAUDE API PROXY - Recipe Extraction & AI Cook
// ══════════════════════════════════════════════════════════════
app.post('/api/claude', async (c) => {
  try {
    const body: ClaudeRequest = await c.req.json()
    const apiKey = process.env.CLAUDE_API_KEY

    if (!apiKey) {
      return c.json({ error: 'Claude API key not configured' }, 500)
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
      return c.json({ error: error.error?.message || `HTTP ${response.status}` }, response.status)
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('Claude proxy error:', error)
    return c.json({ error: 'Internal server error', details: String(error) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════
// IMAGE PROXY - Pollinations (für Localhost CORS-Probleme)
// ══════════════════════════════════════════════════════════════
app.post('/api/image-proxy', async (c) => {
  try {
    const { url } = await c.req.json()

    if (!url || typeof url !== 'string') {
      return c.json({ error: 'URL required' }, 400)
    }

    // Security: Nur Pollinations & Google Fonts erlauben
    if (!url.includes('image.pollinations.ai') && !url.includes('fonts.googleapis')) {
      return c.json({ error: 'URL not allowed' }, 403)
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Flavr/1.0' },
    })

    if (!response.ok) {
      return c.json({ error: `HTTP ${response.status}` }, response.status)
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
    return c.json({ error: 'Proxy failed', details: String(error) }, 500)
  }
})

// ══════════════════════════════════════════════════════════════
// BRING! API PROXY (falls implementiert)
// ══════════════════════════════════════════════════════════════
app.post('/api/bring/*', async (c) => {
  // Platzhalter – kommt später wenn Bring integriert ist
  return c.json({ message: 'Bring integration coming soon' }, 501)
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
expressApp.use(async (req, res, next) => {
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
