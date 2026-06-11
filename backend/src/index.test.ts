import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ══════════════════════════════════════════════════════════════
// Mock @supabase/supabase-js BEFORE importing the app
// ══════════════════════════════════════════════════════════════
const getUserMock = vi.fn()
const uploadMock = vi.fn()
const getPublicUrlMock = vi.fn()

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        getUser: getUserMock,
      },
      storage: {
        from: vi.fn(() => ({
          upload: uploadMock,
          getPublicUrl: getPublicUrlMock,
        })),
      },
    })),
  }
})

// Set env vars so the lazy clients initialize
process.env.SUPABASE_URL = 'https://test-project.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

const { app } = await import('./index.js')

const VALID_TOKEN = 'valid-token'
const VALID_USER = { id: 'user-123', email: 'test@example.com' }

function authHeaders(token = VALID_TOKEN) {
  return { Authorization: `Bearer ${token}` }
}

beforeEach(() => {
  getUserMock.mockReset()
  uploadMock.mockReset()
  getPublicUrlMock.mockReset()

  // Default: valid token resolves to a valid user
  getUserMock.mockImplementation(async (token: string) => {
    if (token === VALID_TOKEN) {
      return { data: { user: VALID_USER }, error: null }
    }
    return { data: { user: null }, error: new Error('invalid token') }
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Health Endpoint', () => {
  it('should return status ok', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
  })
})

describe('POST /api/recipe-image/suggest', () => {
  it('returns 401 without token', async () => {
    const res = await app.request('/api/recipe-image/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Pasta' }),
    })
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Nicht authentifiziert')
  })

  it('returns 400 for empty query', async () => {
    const res = await app.request('/api/recipe-image/suggest', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' }),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Query erforderlich')
  })

  it('returns 400 for too long query', async () => {
    const res = await app.request('/api/recipe-image/suggest', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'a'.repeat(201) }),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Query erforderlich')
  })

  it('returns >=3 pollinations suggestions by default', async () => {
    const res = await app.request('/api/recipe-image/suggest', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Lasagne' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.fallbackUsed).toBe(false)
    expect(json.suggestions.length).toBeGreaterThanOrEqual(3)
    for (const suggestion of json.suggestions) {
      expect(suggestion.source).toBe('pollinations')
      expect(suggestion.url).toContain('image.pollinations.ai/prompt/')
      expect(suggestion.url).toContain('Lasagne')
      expect(suggestion.credit).toBeNull()
      expect(suggestion.creditUrl).toBeNull()
    }
  })

  it('respects count param (clamped 1-6)', async () => {
    const res = await app.request('/api/recipe-image/suggest', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Suppe', count: 6 }),
    })
    const json = await res.json()
    expect(json.suggestions.length).toBe(6)

    const resHigh = await app.request('/api/recipe-image/suggest', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Suppe', count: 99 }),
    })
    const jsonHigh = await resHigh.json()
    expect(jsonHigh.suggestions.length).toBe(6)
  })

  describe('with prefer=unsplash', () => {
    const originalFetch = global.fetch

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('returns 503 if UNSPLASH_ACCESS_KEY missing', async () => {
      delete process.env.UNSPLASH_ACCESS_KEY

      const res = await app.request('/api/recipe-image/suggest', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Pizza Margherita Test', prefer: 'unsplash' }),
      })
      expect(res.status).toBe(503)
      const json = await res.json()
      expect(json.error).toBe('Bildersuche nicht konfiguriert')
    })

    it('maps unsplash results, sets X-Cache MISS then HIT', async () => {
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key'

      const fetchMock = vi.fn(async (url: string) => {
        if (typeof url === 'string' && url.includes('api.unsplash.com')) {
          return new Response(JSON.stringify({
            results: [
              {
                urls: { regular: 'https://images.unsplash.com/photo1-regular', thumb: 'https://images.unsplash.com/photo1-thumb' },
                user: { name: 'Jane Doe', links: { html: 'https://unsplash.com/@janedoe' } },
                links: { download_location: 'https://api.unsplash.com/photos/photo1/download' },
              },
              {
                urls: { regular: 'https://images.unsplash.com/photo2-regular', thumb: 'https://images.unsplash.com/photo2-thumb' },
                user: { name: 'John Smith', links: { html: 'https://unsplash.com/@johnsmith' } },
                links: { download_location: 'https://api.unsplash.com/photos/photo2/download' },
              },
            ],
          }), { status: 200 })
        }
        // download trigger
        return new Response(null, { status: 200 })
      })
      global.fetch = fetchMock as any

      const query = 'unique-query-for-cache-test'

      const res1 = await app.request('/api/recipe-image/suggest', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, prefer: 'unsplash' }),
      })
      expect(res1.status).toBe(200)
      expect(res1.headers.get('X-Cache')).toBe('MISS')
      const json1 = await res1.json()
      expect(json1.fallbackUsed).toBe(true)
      expect(json1.suggestions[0]).toEqual({
        source: 'unsplash',
        url: 'https://images.unsplash.com/photo1-regular',
        thumbUrl: 'https://images.unsplash.com/photo1-thumb',
        credit: 'Jane Doe',
        creditUrl: 'https://unsplash.com/@janedoe?utm_source=flavr&utm_medium=referral',
      })

      const res2 = await app.request('/api/recipe-image/suggest', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, prefer: 'unsplash' }),
      })
      expect(res2.status).toBe(200)
      expect(res2.headers.get('X-Cache')).toBe('HIT')
      const json2 = await res2.json()
      expect(json2.suggestions).toEqual(json1.suggestions)
    })

    it('returns 502 if unsplash fetch fails', async () => {
      process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key'

      global.fetch = vi.fn(async () => {
        throw new Error('network error')
      }) as any

      const res = await app.request('/api/recipe-image/suggest', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'failure-query', prefer: 'unsplash' }),
      })
      expect(res.status).toBe(502)
      const json = await res.json()
      expect(json.error).toBe('Bildquelle nicht erreichbar')
    })
  })
})

describe('POST /api/recipe-image/persist', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns 401 without token', async () => {
    const res = await app.request('/api/recipe-image/persist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://image.pollinations.ai/prompt/test' }),
    })
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Nicht authentifiziert')
  })

  it('returns 400 for url required', async () => {
    const res = await app.request('/api/recipe-image/persist', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('URL erforderlich')
  })

  it('rejects spoofed evil.com URL with 400', async () => {
    const res = await app.request('/api/recipe-image/persist', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://evil.com/?image.pollinations.ai' }),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('URL nicht erlaubt')
  })

  it('happy path: fetches image and uploads to storage', async () => {
    global.fetch = vi.fn(async () => {
      return new Response(new Uint8Array([1, 2, 3, 4]).buffer, {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      })
    }) as any

    uploadMock.mockResolvedValue({ data: { path: 'user-123/ai/some-uuid.jpg' }, error: null })
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'https://test-project.supabase.co/storage/v1/object/public/recipe-images/user-123/ai/some-uuid.jpg' } })

    const res = await app.request('/api/recipe-image/persist', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://image.pollinations.ai/prompt/test?seed=1' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.source).toBe('pollinations')
    expect(json.imageUrl).toBe('https://test-project.supabase.co/storage/v1/object/public/recipe-images/user-123/ai/some-uuid.jpg')
    expect(uploadMock).toHaveBeenCalledTimes(1)
    const [path, , options] = uploadMock.mock.calls[0]
    expect(path).toMatch(/^user-123\/ai\/.+\.jpg$/)
    expect(options).toMatchObject({ contentType: 'image/jpeg', upsert: true })
  })

  it('returns 502 if image fetch fails', async () => {
    global.fetch = vi.fn(async () => {
      return new Response(null, { status: 404 })
    }) as any

    const res = await app.request('/api/recipe-image/persist', {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://image.pollinations.ai/prompt/test' }),
    })
    expect(res.status).toBe(502)
    const json = await res.json()
    expect(json.error).toBe('Bild konnte nicht geladen werden')
  })
})
