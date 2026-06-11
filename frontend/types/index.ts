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
  imageSource?: 'pollinations' | 'unsplash' | 'upload'
  imageCredit?: string
  imageCreditUrl?: string
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
  image_source?: 'pollinations' | 'unsplash' | 'upload'
  image_credit?: string
  image_credit_url?: string
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

export interface MealPlanDay {
  breakfast?: string  // Recipe ID
  dinner?: string     // Recipe ID
}

export interface MealPlan {
  id?: string
  weekStart: string  // ISO date "2026-06-02" (Monday)
  meals: Record<string, MealPlanDay>  // key: "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"
}
