# 🚀 Nuxt 3 Migration Plan

**Ziel:** Migration der monolithischen PWA zu einer modernen Nuxt 3 Architektur

**Aktueller Stand:**
- ~2233 Zeilen JavaScript in einer Datei
- 50+ Funktionen
- Monolithisches index.html
- Direkter Supabase CDN-Import
- Service Worker für PWA

**Ziel-Architektur:**
- Nuxt 3 mit Composition API
- Component-basierte Architektur
- Typed Composables
- Server-Side API Routes
- Nuxt PWA Module
- Vitest für Testing

---

## 📊 Phase 2.1: Setup & Grundstruktur

### 1. Nuxt 3 Projekt initialisieren

```bash
# Neues Nuxt Projekt im Unterordner erstellen
npx nuxi@latest init frontend

cd frontend
npm install
```

### 2. Dependencies installieren

```bash
# Core
npm install -D @nuxtjs/tailwindcss  # Optional: für Styling
npm install @pinia/nuxt pinia       # State Management

# Supabase
npm install @nuxtjs/supabase

# PWA
npm install @vite-pwa/nuxt

# Sentry
npm install @sentry/vue

# Testing
npm install -D vitest @vue/test-utils happy-dom
```

### 3. Nuxt Config (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    // Server-only secrets
    public: {
      backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
      sentryDsn: process.env.SENTRY_DSN_FRONTEND,
    }
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/auth',
      callback: '/auth/callback',
      exclude: [],
    }
  },

  pwa: {
    manifest: {
      name: 'Flavr',
      short_name: 'Flavr',
      description: 'Deine persönliche Rezeptverwaltung',
      theme_color: '#FFF6EE',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      navigateFallback: '/',
    }
  },

  devtools: { enabled: true },
})
```

---

## 📁 Phase 2.2: Folder Structure

```
frontend/
├── .nuxt/                    # Build output (gitignored)
├── .output/                  # Production build (gitignored)
├── assets/
│   └── css/
│       └── main.css          # Global styles (aus styles.css migriert)
├── components/
│   ├── recipe/
│   │   ├── RecipeCard.vue
│   │   ├── RecipeDetail.vue
│   │   ├── RecipeForm.vue
│   │   └── RecipeHeroSlider.vue
│   ├── ui/
│   │   ├── SearchBar.vue
│   │   ├── CategoryScroll.vue
│   │   ├── IngredientChips.vue
│   │   └── Modal.vue
│   └── auth/
│       ├── AuthOverlay.vue
│       └── GoogleSignIn.vue
├── composables/
│   ├── useRecipes.ts         # Recipe CRUD logic
│   ├── useAuth.ts            # Supabase Auth
│   ├── useAI.ts              # Claude API calls
│   ├── useCategories.ts      # Category logic
│   └── useImageUpload.ts     # Image handling
├── layouts/
│   └── default.vue           # Main layout mit Nav
├── pages/
│   ├── index.vue             # Rezeptübersicht
│   ├── ai.vue                # KI-Koch Seite
│   ├── settings.vue          # Einstellungen
│   ├── recipe/
│   │   └── [id].vue          # Recipe Detail (dynamic route)
│   └── auth/
│       ├── index.vue         # Login/Register
│       └── callback.vue      # OAuth callback
├── plugins/
│   └── sentry.client.ts      # Sentry init
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── flavr-logo-2.png
├── server/
│   ├── api/
│   │   └── health.ts         # Falls nötig: Server-Routes
│   └── middleware/           # Server Middleware
├── stores/
│   ├── recipes.ts            # Pinia Store
│   └── ui.ts                 # UI State (modals, sheets)
├── types/
│   └── index.ts              # TypeScript Interfaces
├── nuxt.config.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🧩 Phase 2.3: Component Breakdown

### Aktueller Monolith → Komponenten

| Aktuelle Funktion(en) | Neue Komponente | Beschreibung |
|----------------------|-----------------|--------------|
| `renderRecipes()` | `RecipeCard.vue` | Einzelne Rezept-Karte |
| Hero Slider HTML | `RecipeHeroSlider.vue` | Hero-Slider mit Swiper |
| Search Bar HTML | `SearchBar.vue` | Suche + Favoriten-Filter |
| `renderCats()` | `CategoryScroll.vue` | Kategorie-Chips |
| `openDetail()` | `RecipeDetail.vue` | Detail-Ansicht als Modal |
| `openEdit()`, `saveRecipe()` | `RecipeForm.vue` | Formular für Create/Edit |
| `renderFormLists()` | `IngredientList.vue`, `StepList.vue` | Zutaten/Schritte-Input |
| Auth Overlay | `AuthOverlay.vue` | Login/Register Modal |
| Import Sheet | `ImportSheet.vue` | URL/Text/Foto Import |
| AI Page | `pages/ai.vue` | KI-Koch Seite |
| Settings | `pages/settings.vue` | Export/Import/Delete |

---

## 🔧 Phase 2.4: Composables (Logic Extraction)

### `composables/useRecipes.ts`

```typescript
import type { Recipe } from '~/types'

export const useRecipes = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const recipes = useState<Recipe[]>('recipes', () => [])
  const loading = useState<boolean>('recipes-loading', () => false)

  const loadRecipes = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Load error:', error)
      return
    }
    
    recipes.value = data.map(rowToRecipe)
    loading.value = false
  }

  const saveRecipe = async (recipe: Recipe) => {
    const row = recipeToRow(recipe)
    const { data, error } = await supabase
      .from('recipes')
      .upsert(row)
      .select()
      .single()
    
    if (error) throw error
    return rowToRecipe(data)
  }

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    recipes.value = recipes.value.filter(r => r.id !== id)
  }

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
```

### `composables/useAI.ts`

```typescript
export const useAI = () => {
  const config = useRuntimeConfig()
  const backendUrl = config.public.backendUrl

  const callClaude = async (messages: any[]) => {
    const response = await $fetch(`${backendUrl}/api/claude`, {
      method: 'POST',
      body: {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages
      }
    })
    return response
  }

  const parseRecipeFromText = async (text: string) => {
    const messages = [
      { role: 'user', content: `Parse this recipe: ${text}` }
    ]
    const response = await callClaude(messages)
    // ... parse JSON response
    return recipe
  }

  const suggestRecipes = async (ingredients: string[]) => {
    // ... AI logic
  }

  return {
    callClaude,
    parseRecipeFromText,
    suggestRecipes,
  }
}
```

### `composables/useCategories.ts`

```typescript
export const useCategories = () => {
  const CATS = ['Alle','Rind & Kalb', 'Geflügel', /* ... */]
  const CAT_EMOJI = { /* ... */ }
  
  const activeCategory = useState<string>('activeCategory', () => 'Alle')
  
  const setCategory = (cat: string) => {
    activeCategory.value = cat
  }

  const categorizeRecipe = (recipe: Recipe): string => {
    // Auto-categorization logic aus CAT_TAGS
    return 'Abendessen'
  }

  return {
    categories: CATS,
    emoji: CAT_EMOJI,
    activeCategory: readonly(activeCategory),
    setCategory,
    categorizeRecipe,
  }
}
```

---

## 🎨 Phase 2.5: TypeScript Types

### `types/index.ts`

```typescript
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
}
```

---

## 🗺️ Phase 2.6: Pages & Routing

### `pages/index.vue` (Rezeptübersicht)

```vue
<template>
  <div>
    <RecipeHeroSlider :recipes="heroRecipes" />
    <SearchBar v-model="searchQuery" :only-favs="onlyFavs" @toggle-favs="onlyFavs = !onlyFavs" />
    <CategoryScroll :active="activeCategory" @select="setCategory" />
    
    <div class="recipe-grid">
      <RecipeCard
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
        @click="openDetail(recipe.id)"
        @toggle-fav="toggleFavorite(recipe.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { recipes, loadRecipes, toggleFavorite } = useRecipes()
const { activeCategory, setCategory } = useCategories()

const searchQuery = ref('')
const onlyFavs = ref(false)

const filteredRecipes = computed(() => {
  return recipes.value.filter(r => {
    const matchesCategory = activeCategory.value === 'Alle' || r.category === activeCategory.value
    const matchesSearch = !searchQuery.value || r.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFavs = !onlyFavs.value || r.isFavorite
    return matchesCategory && matchesSearch && matchesFavs
  })
})

const heroRecipes = computed(() => recipes.value.filter(r => r.imageUrl).slice(0, 5))

onMounted(() => {
  loadRecipes()
})
</script>
```

### `pages/ai.vue` (KI-Koch)

```vue
<template>
  <div class="ai-page">
    <div class="ai-hero">
      <div class="ai-hero-icon">🤖</div>
      <div class="ai-hero-title">Was kann ich kochen?</div>
    </div>

    <IngredientChips v-model="ingredients" />
    
    <button @click="getSuggestions" :disabled="loading">
      {{ loading ? 'Denke nach...' : '✨ Vorschläge' }}
    </button>

    <div v-if="suggestions.length">
      <RecipeSuggestionCard
        v-for="(s, i) in suggestions"
        :key="i"
        :suggestion="s"
        @create="createFromSuggestion(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { suggestRecipes } = useAI()
const { saveRecipe } = useRecipes()

const ingredients = ref<string[]>([])
const suggestions = ref([])
const loading = ref(false)

const getSuggestions = async () => {
  loading.value = true
  suggestions.value = await suggestRecipes(ingredients.value)
  loading.value = false
}

const createFromSuggestion = async (index: number) => {
  const suggestion = suggestions.value[index]
  await saveRecipe({
    id: crypto.randomUUID(),
    ...suggestion,
    isFavorite: false,
    createdAt: Date.now()
  })
  navigateTo('/')
}
</script>
```

---

## 🔐 Phase 2.7: Auth Integration

### Nuxt Supabase Module

Das `@nuxtjs/supabase` Modul handhabt automatisch:
- Session Management
- Redirects
- Auto-refresh

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <nav>
      <img src="/flavr-logo-2.png" alt="Flavr">
      <button v-if="user" @click="logout">Abmelden</button>
    </nav>
    
    <slot />
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/auth')
}

// Redirect if not logged in
watch(user, (newUser) => {
  if (!newUser && useRoute().path !== '/auth') {
    navigateTo('/auth')
  }
})
</script>
```

---

## 🧪 Phase 2.8: Testing Strategy

### Component Tests

```typescript
// components/recipe/RecipeCard.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RecipeCard from './RecipeCard.vue'

describe('RecipeCard', () => {
  it('renders recipe title', () => {
    const wrapper = mount(RecipeCard, {
      props: {
        recipe: {
          id: '1',
          title: 'Test Burger',
          category: 'Burger',
          duration: 30,
          servings: 2,
          ingredients: [],
          steps: [],
          tags: [],
          isFavorite: false,
          createdAt: Date.now()
        }
      }
    })
    
    expect(wrapper.text()).toContain('Test Burger')
  })

  it('emits toggle-fav on favorite click', async () => {
    const wrapper = mount(RecipeCard, { /* ... */ })
    await wrapper.find('.fav-btn').trigger('click')
    expect(wrapper.emitted('toggle-fav')).toBeTruthy()
  })
})
```

### Composable Tests

```typescript
// composables/useRecipes.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useRecipes } from './useRecipes'

describe('useRecipes', () => {
  it('loads recipes from Supabase', async () => {
    const { recipes, loadRecipes } = useRecipes()
    await loadRecipes()
    expect(recipes.value.length).toBeGreaterThan(0)
  })
})
```

---

## 📦 Phase 2.9: Migration Steps (Execution Plan)

### Step 1: Parallel Development (Empfohlen)
```bash
# Projekt-Struktur:
rezepte-project/
├── index.html          # Alte App (bleibt live)
├── js/app.js           # Alte App
├── backend/            # Bestehend
└── frontend/           # Neue Nuxt App
```

**Vorteile:**
- Alte App bleibt funktional
- Schrittweise Migration möglich
- Feature-Parität verifizierbar

### Step 2: Feature-für-Feature Migration

**Phase A: Core Features (Week 1-2)**
- [ ] Auth (Login, Register, Google Sign-In)
- [ ] Recipe List + Filter
- [ ] Recipe Detail View
- [ ] Category Navigation

**Phase B: CRUD Features (Week 3)**
- [ ] Create Recipe
- [ ] Edit Recipe
- [ ] Delete Recipe
- [ ] Toggle Favorite

**Phase C: Advanced Features (Week 4)**
- [ ] Image Upload & Generation
- [ ] Import (URL, Text, Photo)
- [ ] Export/Import Data
- [ ] Search

**Phase D: AI Features (Week 5)**
- [ ] KI-Koch (Ingredient → Suggestions)
- [ ] Photo Analysis
- [ ] Recipe Parsing from Text

**Phase E: Polish & Deploy (Week 6)**
- [ ] PWA Settings
- [ ] Sentry Integration
- [ ] Tests (80%+ Coverage)
- [ ] Deploy Pipeline
- [ ] Performance Optimization

### Step 3: Cutover Strategy

**Option A: Hard Cutover**
- Deploy neue Nuxt App auf neue URL
- Teste gründlich
- Redirect von alter URL zur neuen

**Option B: Gradual Rollout**
- A/B Test mit 10% Traffic
- Schrittweise erhöhen
- Monitoring via Sentry

---

## 🚀 Phase 2.10: Deployment

### Build & Deploy

```bash
# Frontend Build
cd frontend
npm run build

# Output: .output/public (static files für Netlify)
```

### Updated CI/CD (`.github/workflows/deploy.yml`)

```yaml
deploy-frontend:
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    
    - name: Install Frontend Dependencies
      run: cd frontend && npm ci
    
    - name: Build Nuxt App
      run: cd frontend && npm run build
      env:
        SENTRY_DSN_FRONTEND: ${{ secrets.SENTRY_DSN_FRONTEND }}
        BACKEND_URL: ${{ secrets.BACKEND_URL }}
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v3.0
      with:
        publish-dir: 'frontend/.output/public'
        production-branch: main
```

### Environment Variables

**Netlify:**
- `BACKEND_URL` → Railway Backend URL
- `SENTRY_DSN_FRONTEND`
- `SUPABASE_URL`
- `SUPABASE_KEY`

---

## 📊 Migration Checklist

- [ ] **Phase 2.1:** Nuxt 3 Setup
- [ ] **Phase 2.2:** Folder Structure
- [ ] **Phase 2.3:** Component Breakdown
- [ ] **Phase 2.4:** Composables erstellen
- [ ] **Phase 2.5:** TypeScript Types definieren
- [ ] **Phase 2.6:** Pages & Routing
- [ ] **Phase 2.7:** Auth Integration
- [ ] **Phase 2.8:** Testing Setup
- [ ] **Phase 2.9:** Feature Migration (A→E)
- [ ] **Phase 2.10:** Deployment Pipeline

---

## 🎯 Success Metrics

**Technisch:**
- ✅ 100% Feature-Parität mit alter App
- ✅ <3s Initial Load Time
- ✅ 80%+ Test Coverage
- ✅ Lighthouse Score >90

**User Experience:**
- ✅ Keine Datenverluste
- ✅ Smooth Migration für bestehende User
- ✅ Offline-Funktionalität erhalten

---

## 🔗 Ressourcen

- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Nuxt Supabase Module](https://supabase.nuxtjs.org/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Nuxt PWA](https://vite-pwa-org.netlify.app/frameworks/nuxt.html)
- [Vue Test Utils](https://test-utils.vuejs.org/)

---

**Nächster Schritt:** Soll ich mit Phase 2.1 (Setup) starten?
