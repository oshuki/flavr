import type { AIRecipeSuggestion } from '~/types'

export const useAI = () => {
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  const callClaude = async (messages: any[], system?: string) => {
    const body: any = {
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages
    }
    if (system) {
      body.system = [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
    }
    const response = await $fetch(`${backendUrl}/api/claude`, {
      method: 'POST',
      body
    })
    return response
  }

  const parseRecipeFromText = async (text: string): Promise<any> => {
    const systemPrompt = `Extract recipe from text. Return JSON with: title, ingredients (array), steps (array), duration (minutes), servings.`

    const response = await callClaude([
      { role: 'user', content: text }
    ], systemPrompt)
    
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
    const systemPrompt = `Du bist ein Rezept-Assistent. Schlage 3 Rezepte auf Deutsch vor.

WICHTIG: Antworte NUR mit einem JSON-Array (kein Markdown, kein Text). Exaktes Format:
[{
  "title": "Rezeptname",
  "ingredients": ["200g Zutat 1", "3 EL Zutat 2", "1 Prise Zutat 3"],
  "steps": ["Schritt 1", "Schritt 2"],
  "duration": 30,
  "servings": 4
}]

Regeln:
- duration muss eine ZAHL sein (Minuten als Integer)
- servings muss eine ZAHL sein (Integer, Standard 4)
- ingredients müssen MENGENANGABEN enthalten (z.B. "200g Mehl", "3 Eier", "1 TL Salz")
- Auf Deutsch schreiben
- Genau 3 verschiedene Rezepte
- Immer für 4 Personen, außer die Zutatenmengen lassen weniger vermuten`

    const response = await callClaude([
      { role: 'user', content: `Zutaten: ${ingredients.join(', ')}` }
    ], systemPrompt)
    
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
    const systemPrompt = `Extrahiere Zutaten oder Rezepte aus Bildern. Antworte NUR mit JSON: { title, ingredients (array), steps (array), duration (Minuten), servings }.`

    const response = await callClaude([
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
          },
          { type: 'text', text: 'Was siehst du? Extrahiere das Rezept.' }
        ]
      }
    ], systemPrompt)
    
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
