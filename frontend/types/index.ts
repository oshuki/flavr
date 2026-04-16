export interface Recipe {
  id: string
  title: string
  category: string
  duration: number
  servings: number
  ingredients: string[]
  steps: string[]
  tags: string[]
  notes?: string
  imageUrl?: string
  isFavorite: boolean
  sourceApp?: string
  createdAt: number
}

export interface RecipeRow {
  id: string
  user_id: string
  title: string
  category: string
  duration: number
  servings: number
  ingredients: string[]
  steps: string[]
  tags: string[]
  notes?: string
  image_url?: string
  is_favorite: boolean
  source_app?: string
  created_at: string
}

export interface AIRecipeSuggestion {
  title: string
  ingredients: string[]
  steps: string[]
  duration?: number
  servings?: number
}

export interface User {
  id: string
  email: string
}
