<template>
  <div class="recipes-page">
    <!-- Header -->
    <div class="page-header">
      <img src="/flavr-logo-2.png" alt="flavr" class="header-logo">
      <div class="header-actions">
        <button class="icon-btn" :class="{ active: onlyFavs }" @click="onlyFavs = !onlyFavs" aria-label="Favoriten">
          <svg width="18" height="18" viewBox="0 0 24 24" :fill="onlyFavs ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="icon-btn" :class="{ active: showSearch }" @click="showSearch = !showSearch" aria-label="Suchen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Search bar (collapsible) -->
    <div v-if="showSearch" class="search-bar">
      <input
        v-model="searchQuery"
        type="search"
        class="form-input search-input"
        placeholder="Rezepte oder Zutaten suchen…"
        autofocus
      >
    </div>

    <!-- Category circles (stories-style) -->
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
const { categories, emoji, activeCategory, setCategory } = useCategories()

const searchQuery   = ref('')
const onlyFavs      = ref(false)
const showSearch    = ref(false)

const createNewRecipe = () => {
  navigateTo(`/recipe/edit/${crypto.randomUUID()}`)
}

const filteredRecipes = computed(() => {
  return recipes.value.filter(r => {
    const matchesCat    = activeCategory.value === 'Alle' || r.category === activeCategory.value
    const matchesSearch = !searchQuery.value ||
      r.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.ingredients.some(i => i.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesFavs   = !onlyFavs.value || r.isFavorite
    return matchesCat && matchesSearch && matchesFavs
  })
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

.header-logo { height: 28px; width: auto; }

.header-actions { display: flex; gap: 8px; }

.icon-btn {
  width: 36px; height: 36px;
  background: var(--surface2);
  border: none; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--muted);
  transition: background 0.15s, color 0.15s;
}
.icon-btn:hover  { background: var(--primary-light); color: var(--primary); }
.icon-btn.active { background: var(--primary-light); color: var(--primary); }

/* Search */
.search-bar { padding: 10px 16px 0; }
.search-input { border-radius: 10px; }

/* Category circles */
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
