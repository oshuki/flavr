import type { Recipe, RecipeRow } from '~/types'

export const useRecipes = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const recipes = useState<Recipe[]>('recipes', () => [])
  const loading = useState<boolean>('recipes-loading', () => false)

  // Convert DB row to Recipe object
  const rowToRecipe = (row: RecipeRow): Recipe => {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      duration: row.duration,
      servings: row.servings,
      ingredients: row.ingredients || [],
      steps: row.steps || [],
      tags: row.tags || [],
      notes: row.notes,
      imageUrl: row.image_url,
      isFavorite: row.is_favorite,
      sourceApp: row.source_app,
      createdAt: new Date(row.created_at).getTime()
    }
  }

  // Convert Recipe object to DB row
  const recipeToRow = (recipe: Recipe): Partial<RecipeRow> => {
    if (!user.value) throw new Error('User not authenticated')
    
    // Get user ID from either .id or .sub (JWT format)
    const userId = user.value.id || (user.value as any).sub
    if (!userId) throw new Error('User ID not found')
    
    return {
      id: recipe.id,
      user_id: userId,
      title: recipe.title,
      category: recipe.category || 'Abendessen',
      duration: recipe.duration || 0,
      servings: recipe.servings || 2,
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      tags: recipe.tags || [],
      notes: recipe.notes || null,
      image_url: recipe.imageUrl || null,
      is_favorite: recipe.isFavorite || false,
      source_app: recipe.sourceApp || null,
      created_at: recipe.createdAt ? new Date(recipe.createdAt).toISOString() : new Date().toISOString()
    }
  }

  // Load all recipes from Supabase
  const loadRecipes = async () => {
    if (!user.value) return
    
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Load error:', error)
        return
      }
      
      recipes.value = (data || []).map(rowToRecipe)
    } finally {
      loading.value = false
    }
  }

  // Save (create or update) recipe
  const saveRecipe = async (recipe: Recipe) => {
    if (!user.value) throw new Error('User not authenticated')
    
    const userId = user.value.id || (user.value as any).sub

    const row = recipeToRow(recipe)
    
    const { data, error } = await supabase
      .from('recipes')
      .upsert(row)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    const savedRecipe = rowToRecipe(data)
    
    // Update local state
    const index = recipes.value.findIndex(r => r.id === savedRecipe.id)
    if (index >= 0) {
      recipes.value[index] = savedRecipe
    } else {
      recipes.value.unshift(savedRecipe)
    }
    
    return savedRecipe
  }

  // Delete recipe
  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    recipes.value = recipes.value.filter(r => r.id !== id)
  }

  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    const recipe = recipes.value.find(r => r.id === id)
    if (!recipe) return
    
    recipe.isFavorite = !recipe.isFavorite
    await saveRecipe(recipe)
  }

  return {
    recipes: readonly(recipes),
    loading: readonly(loading),
    loadRecipes,
    saveRecipe,
    deleteRecipe,
    toggleFavorite,
  }
}
