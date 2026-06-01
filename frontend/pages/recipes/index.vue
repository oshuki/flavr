<template>
  <div class="recipes-page">
    <!-- Header -->
    <div class="page-header">
      <img src="/flavr-logo-2.png" alt="flavr" class="header-logo" @click="navigateTo('/recipes')" style="cursor: pointer;">
      <div class="header-search">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          class="header-search-input"
          placeholder="Suchen…"
        >
      </div>
    </div>

    <!-- Quick filters + sort -->
    <div class="quick-filters">
      <div class="filter-chips">
        <button class="chip" :class="{ active: quickFilter === 'fast' }" @click="toggleQuickFilter('fast')">⚡ &lt; 30 Min.</button>
        <button class="chip" :class="{ active: quickFilter === 'ai' }" @click="toggleQuickFilter('ai')">✨ KI-generiert</button>
        <button class="chip" :class="{ active: onlyFavs }" @click="onlyFavs = !onlyFavs">♥ Favoriten</button>
      </div>
      <select v-model="sortBy" class="sort-select">
        <option value="newest">Neueste</option>
        <option value="oldest">Älteste</option>
        <option value="az">A – Z</option>
        <option value="duration">Kürzeste Zeit</option>
      </select>
    </div>

    <!-- Category circles (stories-style) -->
    <div class="cat-scroll-wrap">
      <div class="cat-scroll">
        <button
          v-for="cat in categories"
          :key="cat"
          class="cat-circle"
          :class="{ active: activeCategory === cat }"
          @click="setCategory(cat)"
        >
          <div class="cat-circle-inner">
            <span class="cat-emoji">{{ emoji[cat] || '🍽️' }}</span>
          </div>
          <span class="cat-label">{{ cat }}</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredRecipes.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted-light)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
      <p>Keine Rezepte gefunden</p>
    </div>

    <!-- Recipe grid -->
    <div v-else class="recipe-grid">
      <RecipeCard
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
        @click="navigateTo(`/recipe/${recipe.id}`)"
        @toggle-fav="toggleFavorite(recipe.id)"
      />
    </div>

    <!-- FAB -->
    <button class="fab" @click="createNewRecipe" aria-label="Neues Rezept">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14"/><path d="M5 12h14"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const { recipes, loadRecipes, loading, toggleFavorite } = useRecipes()
const { categories, emoji, activeCategory, setCategory, tags: catTags } = useCategories()

const searchQuery  = ref('')
const onlyFavs     = ref(false)
const sortBy       = ref('newest')
const quickFilter  = ref<'fast' | 'ai' | null>(null)

const toggleQuickFilter = (f: 'fast' | 'ai') => {
  quickFilter.value = quickFilter.value === f ? null : f
}

const createNewRecipe = () => {
  navigateTo(`/recipe/edit/${crypto.randomUUID()}`)
}

const filteredRecipes = computed(() => {
  const q = searchQuery.value.toLowerCase()
  let result = recipes.value.filter(r => {
    const recipeText = `${r.title} ${r.ingredients.join(' ')} ${r.tags.join(' ')}`.toLowerCase()
    const keywords = catTags[activeCategory.value]
    const matchesCat = activeCategory.value === 'Alle'
      || r.category === activeCategory.value
      || (keywords ? keywords.some(kw => recipeText.includes(kw)) : false)
    const matchesSearch = !q
      || r.title.toLowerCase().includes(q)
      || r.ingredients.some(i => i.toLowerCase().includes(q))
      || r.tags.some(t => t.toLowerCase().includes(q))
    const matchesFavs  = !onlyFavs.value || r.isFavorite
    const matchesFast  = quickFilter.value !== 'fast' || (!!r.duration && r.duration <= 30)
    const matchesAI    = quickFilter.value !== 'ai' || r.tags.some(t => t.toLowerCase() === 'ki-generiert')
    return matchesCat && matchesSearch && matchesFavs && matchesFast && matchesAI
  })

  if (sortBy.value === 'oldest')   result = [...result].sort((a, b) => a.createdAt - b.createdAt)
  else if (sortBy.value === 'az')  result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'de'))
  else if (sortBy.value === 'duration') result = [...result].sort((a, b) => (a.duration || 999) - (b.duration || 999))
  else                             result = [...result].sort((a, b) => b.createdAt - a.createdAt)

  return result
})

onMounted(() => { loadRecipes() })
</script>

<style scoped>
.recipes-page {
  padding: 0 0 80px;
  min-height: 100dvh;
  position: relative;
}

/* Header */
.page-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  display: flex; align-items: center; justify-content: space-between;
}

.header-logo { height: 28px; width: auto; flex-shrink: 0; }

.header-search {
  flex: 1; max-width: 280px;
  display: flex; align-items: center; gap: 8px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 10px; padding: 0 12px; height: 36px;
}
.search-icon { color: var(--muted); flex-shrink: 0; }
.header-search-input {
  flex: 1; border: none; background: transparent;
  font-size: 14px; font-family: 'DM Sans', sans-serif;
  color: var(--text); outline: none;
}
.header-search-input::placeholder { color: var(--muted-light); }

/* Quick filters */
.quick-filters {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 6px 12px 10px;
}
.filter-chips { display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
.filter-chips::-webkit-scrollbar { display: none; }
.chip {
  padding: 6px 12px; border-radius: 20px;
  background: var(--surface2); border: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--muted);
  white-space: nowrap; cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.chip.active {
  background: var(--primary-light); border-color: var(--primary); color: var(--primary);
}
.sort-select {
  flex-shrink: 0; padding: 6px 10px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--surface2);
  font-size: 12px; font-weight: 600; color: var(--muted);
  font-family: 'DM Sans', sans-serif; cursor: pointer;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center;
  padding-right: 26px;
}

/* Category circles */
.cat-scroll-wrap {
  position: relative;
}
.cat-scroll-wrap::after {
  content: '';
  position: absolute; top: 0; right: 0; bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, var(--bg));
  pointer-events: none;
}
.cat-scroll {
  display: flex; gap: 14px;
  overflow-x: auto; padding: 14px 16px;
  scrollbar-width: none;
}
.cat-scroll::-webkit-scrollbar { display: none; }

.cat-circle {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  flex-shrink: 0; background: none; border: none; cursor: pointer; padding: 0;
}

.cat-circle-inner {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--surface2);
  border: 2px solid transparent;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s, background 0.15s;
}

.cat-circle.active .cat-circle-inner {
  background: var(--primary-light);
  border-color: var(--primary);
}

.cat-emoji { font-size: 24px; line-height: 1; }

.cat-label {
  font-size: 10px; font-weight: 600;
  color: var(--muted);
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
  transition: color 0.15s;
}
.cat-circle.active .cat-label { color: var(--primary); }

/* States */
.loading-state { padding: 60px 20px; text-align: center; }

.empty-state {
  padding: 60px 20px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  color: var(--muted); font-size: 15px;
}

/* Grid */
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 12px 12px;
}
@media (min-width: 520px) {
  .recipe-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 900px) {
  .recipe-grid { grid-template-columns: repeat(4, 1fr); }
}

/* FAB */
.fab {
  position: fixed;
  right: 20px;
  bottom: calc(env(safe-area-inset-bottom) + 80px);
  width: 54px; height: 54px;
  background: var(--primary);
  color: #fff; border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(26,122,70,0.45);
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 50;
}
.fab:hover  { transform: scale(1.08); box-shadow: 0 6px 28px rgba(26,122,70,0.5); }
.fab:active { transform: scale(0.95); }
</style>
