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
        <div
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          class="recipe-card card"
          @click="navigateTo(`/recipe/${recipe.id}`)"
        >
          <div v-if="recipe.imageUrl" class="recipe-image">
            <img :src="recipe.imageUrl" :alt="recipe.title">
          </div>
          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <div class="recipe-meta">
              ⏱️ {{ recipe.duration }} Min. · 👥 {{ recipe.servings }} Pers.
            </div>
            <button 
              class="fav-btn"
              @click.stop="toggleFavorite(recipe.id)"
            >
              {{ recipe.isFavorite ? '⭐' : '☆' }}
            </button>
          </div>
        </div>
      </div>

      <button class="fab" @click="navigateTo('/recipe/new')">
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

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.recipe-meta {
  font-size: 14px;
  color: var(--muted);
}

.fav-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  transition: all 0.2s;
}

.fab:hover {
  transform: scale(1.1);
}
</style>
