export interface UnsplashCredit {
  name: string
  creditUrl: string
  unsplashUrl: string
}

export const useImageGeneration = () => {
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl
  const isGenerating = ref(false)
  const lastCredit = ref<UnsplashCredit | null>(null)

  const generateRecipeImage = async (
    recipeTitle: string,
    ingredients: string[] = []
  ): Promise<string | null> => {
    if (!recipeTitle || process.server) return null

    isGenerating.value = true
    lastCredit.value = null

    try {
      const query = [
        recipeTitle,
        ...ingredients.slice(0, 2).map(i =>
          i.replace(/^\d[\d.,/\s]*\s*[a-zäöü]{0,3}\s*/i, '').trim()
        ),
      ].join(' ')

      const response = await fetch(`${backendUrl}/api/unsplash-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) return null

      const data = await response.json()

      if (data.credit) {
        lastCredit.value = {
          name: data.credit,
          creditUrl: data.creditUrl,
          unsplashUrl: data.unsplashUrl,
        }
      }

      return data.url || null
    } catch (error) {
      console.error('Image generation error:', error)
      return null
    } finally {
      isGenerating.value = false
    }
  }

  return {
    generateRecipeImage,
    isGenerating,
    lastCredit,
  }
}
