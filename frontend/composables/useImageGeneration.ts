export const useImageGeneration = () => {
  // Only run on client
  if (process.server) {
    return {
      generateRecipeImage: async () => null,
      isGenerating: useState<boolean>('image-generating-server', () => false),
    }
  }

  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl
  const isGenerating = useState<boolean>('image-generating', () => false)

  /**
   * Generate a recipe image using Pollinations AI
   * @param recipeTitle - The title of the recipe
   * @param ingredients - Array of ingredients (optional, for better prompts)
   * @returns URL of the generated image or null
   */
  const generateRecipeImage = async (
    recipeTitle: string,
    ingredients: string[] = []
  ): Promise<string | null> => {
    if (!recipeTitle) return null

    isGenerating.value = true

    try {
      // Create a detailed prompt for food photography
      const mainIngredient = ingredients.length > 0 
        ? ingredients[0].split(' ').slice(1).join(' ') // Remove amount, keep ingredient name
        : ''
      
      const prompt = mainIngredient
        ? `Professional food photography of ${recipeTitle}, featuring ${mainIngredient}, beautifully plated, studio lighting, appetizing, high quality, detailed`
        : `Professional food photography of ${recipeTitle}, beautifully plated, studio lighting, appetizing, high quality, detailed`

      // Pollinations API URL with parameters
      const encodedPrompt = encodeURIComponent(prompt)
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&seed=${Date.now()}&nologo=true`

      // Use backend proxy to avoid CORS issues
      const response = await fetch(`${backendUrl}/api/image-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pollinationsUrl }),
      })

      if (!response.ok) {
        throw new Error('Image generation failed')
      }

      // Convert blob to base64 for storing in Supabase
      const blob = await response.blob()
      
      // For now, return the Pollinations URL directly
      // In production, you might want to upload to Supabase Storage
      return pollinationsUrl
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
  }
}
