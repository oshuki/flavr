export interface ImageSuggestion {
  source: 'pollinations' | 'unsplash'
  url: string
  thumbUrl: string
  credit: string | null
  creditUrl: string | null
}

export interface SuggestResult {
  suggestions: ImageSuggestion[]
  fallbackUsed: boolean
  error?: string
}

export const useImageGeneration = () => {
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl
  const isGenerating = ref(false)

  const retryHint = 'Versuche es später erneut oder lade ein eigenes Foto hoch.'

  // Map backend error responses to readable German messages
  const mapErrorMessage = (status: number, body: any): string => {
    switch (status) {
      case 400:
        return 'Bitte gib zuerst einen Rezepttitel ein.'
      case 401:
        return 'Du musst eingeloggt sein, um Bildvorschläge zu erhalten.'
      case 404:
        return `Es wurde kein passendes Bild gefunden. ${retryHint}`
      case 429:
        return 'Zu viele Anfragen. Bitte versuche es in Kürze erneut.'
      case 502:
        return `Die Bildquelle ist gerade nicht erreichbar. ${retryHint}`
      case 503:
        return `Die Bildersuche ist momentan nicht verfügbar. ${retryHint}`
      default:
        return body?.error ? `${body.error}. ${retryHint}` : `Bildvorschläge konnten nicht geladen werden. ${retryHint}`
    }
  }

  const getAccessToken = (): string | null => {
    const session = useSupabaseSession()
    return session.value?.access_token || null
  }

  const buildQuery = (recipeTitle: string, ingredients: string[] = []): string => {
    return [
      recipeTitle,
      ...ingredients.slice(0, 2).map(i =>
        i.replace(/^\d[\d.,/\s]*\s*[a-zäöü]{0,3}\s*/i, '').trim()
      ),
    ].join(' ')
  }

  const fetchSuggestions = async (
    recipeTitle: string,
    ingredients: string[] = [],
    options: { count?: number; prefer?: 'unsplash' } = {}
  ): Promise<SuggestResult> => {
    if (!recipeTitle || process.server) {
      return { suggestions: [], fallbackUsed: false, error: 'Bitte gib zuerst einen Rezepttitel ein.' }
    }

    isGenerating.value = true

    try {
      const token = getAccessToken()
      if (!token) {
        return { suggestions: [], fallbackUsed: false, error: 'Du musst eingeloggt sein, um Bildvorschläge zu erhalten.' }
      }

      const query = buildQuery(recipeTitle, ingredients)

      const response = await fetch(`${backendUrl}/api/recipe-image/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          count: options.count ?? 3,
          ...(options.prefer ? { prefer: options.prefer } : {}),
        }),
      })

      if (!response.ok) {
        let body: any = null
        try { body = await response.json() } catch { /* ignore */ }
        return { suggestions: [], fallbackUsed: false, error: mapErrorMessage(response.status, body) }
      }

      const data = await response.json()
      return {
        suggestions: data.suggestions || [],
        fallbackUsed: !!data.fallbackUsed,
      }
    } catch (error) {
      console.error('Image suggestion error:', error)
      return { suggestions: [], fallbackUsed: false, error: `Verbindung zum Server fehlgeschlagen. ${retryHint}` }
    } finally {
      isGenerating.value = false
    }
  }

  const persistPollinations = async (url: string): Promise<{ imageUrl: string } | { error: string }> => {
    if (process.server) return { error: 'Nicht verfügbar.' }

    try {
      const token = getAccessToken()
      if (!token) {
        return { error: 'Du musst eingeloggt sein, um ein Bild zu übernehmen.' }
      }

      const response = await fetch(`${backendUrl}/api/recipe-image/persist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        let body: any = null
        try { body = await response.json() } catch { /* ignore */ }
        return { error: `${body?.error || 'Bild konnte nicht übernommen werden.'} ${retryHint}` }
      }

      const data = await response.json()
      return { imageUrl: data.imageUrl }
    } catch (error) {
      console.error('Image persist error:', error)
      return { error: `Verbindung zum Server fehlgeschlagen. ${retryHint}` }
    }
  }

  return {
    fetchSuggestions,
    persistPollinations,
    isGenerating,
  }
}
