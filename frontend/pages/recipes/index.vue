<template>
  <div class="home-page">
    <div class="container">
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="🔍 Suchen…" 
          class="form-input"
        >
        <button 
          @click="onlyFavs = !onlyFavs" 
          :class="['fav-filter-btn', { active: onlyFavs }]"
        >
          ⭐
        </button>
      </div>

      <div class="categories">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="setCategory(cat)"
          :class="['cat-chip', { active: activeCategory === cat }]"
        >
          {{ emoji[cat] }} {{ cat }}
        </button>
      </div>

      <div v-if="loading" class="text-center">
        <div class="spinner"></div>
      </div>

      <div v-else class="recipe-grid">
        <RecipeCard
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          :recipe="recipe"
          @click="navigateTo(`/recipe/${recipe.id}`)"
          @toggle-fav="toggleFavorite(recipe.id)"
        />
      </div>

      <button class="fab" @click="createNewRecipe">
        ✚
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { recipes, loadRecipes, loading, toggleFavorite } = useRecipes()
const { categories, emoji, activeCategory, setCategory } = useCategories()

const searchQuery = ref('')
const onlyFavs = ref(false)

const createNewRecipe = () => {
  // Generate UUID for new recipe (browser API, works in SPA mode)
  const newId = crypto.randomUUID()
  navigateTo(`/recipe/edit/${newId}`)
}

const filteredRecipes = computed(() => {
  return recipes.value.filter(r => {
    const matchesCategory = activeCategory.value === 'Alle' || r.category === activeCategory.value
    const matchesSearch = !searchQuery.value || 
      r.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.ingredients.some(i => i.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesFavs = !onlyFavs.value || r.isFavorite
    
    return matchesCategory && matchesSearch && matchesFavs
  })
})

onMounted(() => {
  loadRecipes()
})
</script>

<style scoped>
.home-page {
  padding: 20px 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.fav-filter-btn {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.fav-filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
}

.categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.cat-chip {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 8px 16px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.recipe-card {
  cursor: pointer;
  position: relative;
}

.recipe-image {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.fab {
  position: fixed;
  bottom: 100px; /* Space for bottom nav */
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  font-size: 32px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 50;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.text-center {
  text-align: center;
}
</style>
