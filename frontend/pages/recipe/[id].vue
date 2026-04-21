<template>
  <div class="detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Lade Rezept...</p>
    </div>

    <div v-else-if="!recipe" class="error-container">
      <h2>😕 Rezept nicht gefunden</h2>
      <p>Das Rezept existiert nicht oder wurde gelöscht.</p>
      <button class="btn-primary" @click="navigateTo('/recipes')">
        Zurück zur Übersicht
      </button>
    </div>

    <div v-else class="recipe-detail">
      <!-- Header with Image -->
      <div class="detail-header">
        <button class="back-btn" @click="navigateTo('/recipes')" title="Zurück">
          ← Zurück
        </button>
        
        <div v-if="recipe.imageUrl" class="detail-hero">
          <img :src="recipe.imageUrl" :alt="recipe.title">
          <div class="hero-overlay">
            <button class="fav-btn-hero" @click="toggleFavorite(recipe.id)">
              {{ recipe.isFavorite ? '⭐' : '☆' }}
            </button>
          </div>
        </div>

        <div class="detail-title-section">
          <h1>{{ recipe.title }}</h1>
          <div class="detail-meta-row">
            <span class="category-badge">
              {{ emoji[recipe.category] }} {{ recipe.category }}
            </span>
            <div class="meta-items">
              <span v-if="recipe.duration">⏱️ {{ recipe.duration }} Min.</span>
              <span v-if="recipe.servings">👥 {{ recipe.servings }} Pers.</span>
            </div>
          </div>
          
          <div v-if="recipe.tags && recipe.tags.length" class="detail-tags">
            <span v-for="tag in recipe.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="detail-content">
        <!-- Ingredients -->
        <div class="content-section">
          <h2>🥘 Zutaten</h2>
          <ul class="ingredient-list">
            <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
              {{ ingredient }}
            </li>
          </ul>
        </div>

        <!-- Steps -->
        <div class="content-section">
          <h2>👨‍🍳 Zubereitung</h2>
          <ol class="steps-list">
            <li v-for="(step, index) in recipe.steps" :key="index">
              {{ step }}
            </li>
          </ol>
        </div>

        <!-- Notes -->
        <div v-if="recipe.notes" class="content-section">
          <h2>📝 Notizen</h2>
          <p class="notes-text">{{ recipe.notes }}</p>
        </div>

        <!-- Source -->
        <div v-if="recipe.sourceApp" class="content-section">
          <div class="source-info">
            📱 Importiert aus: {{ recipe.sourceApp }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="detail-actions">
        <ClientOnly>
          <button
            v-if="bringConnected && selectedList"
            class="btn-primary"
            @click="exportToBring"
            :disabled="exportingToBring"
          >
            {{ exportingToBring ? '📤 Exportiere...' : '🛒 Zu Bring! hinzufügen' }}
          </button>
        </ClientOnly>
        
        <button class="btn-secondary" @click="editRecipe">
          ✏️ Bearbeiten
        </button>
        <button 
          v-if="recipe.sourceApp !== 'KI-Koch'"
          class="btn-secondary" 
          @click="duplicateRecipe"
        >
          📋 Duplizieren
        </button>
        <button class="btn-secondary btn-danger" @click="confirmDelete">
          🗑️ Löschen
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>Rezept löschen?</h3>
        <p>Möchtest du "{{ recipe?.title }}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">
            Abbrechen
          </button>
          <button class="btn-primary btn-danger" @click="handleDelete">
            Löschen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types'

const route = useRoute()
const { recipes, loadRecipes, deleteRecipe, toggleFavorite } = useRecipes()
const { emoji } = useCategories()

// Bring! composable
const {
  isConnected: bringConnected,
  selectedList,
  bringAddItems,
  loadBringData,
} = useBring()

const loading = ref(true)
const showDeleteModal = ref(false)
const exportingToBring = ref(false)



const recipe = computed(() => {
  const id = route.params.id as string
  return recipes.value.find(r => r.id === id)
})

const editRecipe = () => {
  navigateTo(`/recipe/edit/${route.params.id}`)
}

const duplicateRecipe = () => {
  if (!recipe.value) return
  
  const duplicate: Recipe = {
    ...recipe.value,
    id: crypto.randomUUID(),
    title: `${recipe.value.title} (Kopie)`,
    createdAt: Date.now(),
  }
  
  // Save via composable
  const { saveRecipe } = useRecipes()
  saveRecipe(duplicate)
  
  navigateTo('/')
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!recipe.value) return
  
  try {
    await deleteRecipe(recipe.value.id)
    navigateTo('/recipes')
  } catch (error) {
    console.error('Delete error:', error)
    alert('Fehler beim Löschen')
  }
}

const exportToBring = async () => {
  if (!recipe.value || !bringConnected.value || !selectedList.value) return
  
  exportingToBring.value = true
  
  try {
    // Convert ingredients to Bring! format
    const items = recipe.value.ingredients.map(ingredient => {
      // Try to split amount and name (e.g., "200g Mehl" -> name: "Mehl", spec: "200g")
      const match = ingredient.match(/^([\d.]+\s*[a-zA-Z]*)\s+(.+)$/)
      
      if (match) {
        return {
          name: match[2],
          spec: match[1],
        }
      } else {
        return {
          name: ingredient,
          spec: '',
        }
      }
    })
    
    const result = await bringAddItems(items)
    
    if (result.success) {
      alert(`✅ ${items.length} Zutaten zu "${selectedList.value.name}" hinzugefügt!`)
    } else {
      throw new Error(result.error || 'Fehler beim Exportieren')
    }
  } catch (error: any) {
    console.error('Bring export error:', error)
    alert('❌ Fehler beim Exportieren: ' + error.message)
  } finally {
    exportingToBring.value = false
  }
}

// ESC key handler for back navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    navigateTo('/recipes')
  }
}

onMounted(async () => {
  if (recipes.value.length === 0) {
    await loadRecipes()
  }
  loading.value = false
  
  // Load Bring! data
  loadBringData()
  
  // Add ESC key listener
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up event listener
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.error-container h2 {
  margin-bottom: 16px;
}

.error-container p {
  color: var(--muted);
  margin-bottom: 24px;
}

.back-btn {
  background: white;
  border: 1px solid var(--border);
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.detail-hero {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.detail-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 50%);
}

.fav-btn-hero {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.fav-btn-hero:hover {
  transform: scale(1.1);
}

.detail-title-section h1 {
  font-size: 32px;
  margin-bottom: 16px;
  line-height: 1.2;
}

.detail-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.category-badge {
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.meta-items {
  display: flex;
  gap: 16px;
  color: var(--muted);
  font-size: 16px;
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: var(--bg);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
}

.detail-content {
  margin-top: 40px;
}

.content-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.content-section h2 {
  font-size: 20px;
  margin-bottom: 16px;
}

.ingredient-list {
  list-style: none;
  padding: 0;
}

.ingredient-list li {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  position: relative;
  padding-left: 32px;
}

.ingredient-list li:last-child {
  border-bottom: none;
}

.ingredient-list li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

.steps-list {
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
}

.steps-list li {
  counter-increment: step-counter;
  padding: 16px 0 16px 48px;
  position: relative;
  border-bottom: 1px solid var(--border);
  line-height: 1.6;
}

.steps-list li:last-child {
  border-bottom: none;
}

.steps-list li:before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 16px;
  background: var(--primary);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.notes-text {
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
}

.source-info {
  color: var(--muted);
  font-size: 14px;
  font-style: italic;
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 24px 0;
}

.detail-actions button {
  flex: 1;
  min-width: 140px;
}

.btn-danger {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  border-color: #c82333;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
}

.modal-content h3 {
  margin-bottom: 12px;
}

.modal-content p {
  color: var(--muted);
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
}
</style>
