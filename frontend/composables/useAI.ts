import type { AIRecipeSuggestion } from '~/types'

export const useAI = () => {
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  const callClaude = async (messages: any[]) => {
    const response = await $fetch(`${backendUrl}/api/claude`, {
      method: 'POST',
      body: {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        messages
      }
    })
    return response
  }

  const parseRecipeFromText = async (text: string): Promise<any> => {
    const systemPrompt = `Extract recipe from text. Return JSON with: title, ingredients (array), steps (array), duration (minutes), servings.`
    
    const response = await callClaude([
      { role: 'user', content: `${systemPrompt}\n\n${text}` }
    ])
    
    try {
      const content = response.content[0]?.text || '{}'
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
    }
    
    return null
  }

  const suggestRecipes = async (ingredients: string[]): Promise<AIRecipeSuggestion[]> => {
    const ingredientsText = ingredients.join(', ')
    const systemPrompt = `Given these ingredients: ${ingredientsText}, suggest 3 recipes. Return JSON array with: [{ title, ingredients, steps, duration, servings }]`
    
    const response = await callClaude([
      { role: 'user', content: systemPrompt }
    ])
    
    try {
      const content = response.content[0]?.text || '[]'
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse AI suggestions:', e)
    }
    
    return []
  }

  const parseRecipeFromImage = async (imageBase64: string): Promise<any> => {
    const response = await callClaude([
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: 'Extract recipe from this image. Return JSON with: title, ingredients (array), steps (array), duration, servings.'
          }
        ]
      }
    ])
    
    try {
      const content = response.content[0]?.text || '{}'
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse image recipe:', e)
    }
    
    return null
  }

  return {
    callClaude,
    parseRecipeFromText,
    suggestRecipes,
    parseRecipeFromImage,
  }
}
