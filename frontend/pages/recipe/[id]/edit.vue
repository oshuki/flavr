<template>
  <div class="form-page">
    <div class="form-container">
      <div class="form-header">
        <button class="back-btn" @click="handleCancel">
          ← Abbrechen
        </button>
        <h1>{{ isEdit ? 'Rezept bearbeiten' : 'Neues Rezept' }}</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="recipe-form">
        <!-- Basic Info -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label" for="title">Titel *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="z.B. Spaghetti Carbonara"
              required
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="category">Kategorie</label>
              <select id="category" v-model="formData.category" class="form-input">
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ emoji[cat] }} {{ cat }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="duration">Dauer (Min.)</label>
              <input
                id="duration"
                v-model.number="formData.duration"
                type="number"
                class="form-input"
                placeholder="30"
                min="0"
              >
            </div>

            <div class="form-group">
              <label class="form-label" for="servings">Portionen</label>
              <input
                id="servings"
                v-model.number="formData.servings"
                type="number"
                class="form-input"
                placeholder="2"
                min="1"
              >
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="form-section">
          <div class="section-header">
            <h2>🥘 Zutaten</h2>
            <button type="button" class="btn-add" @click="addIngredient">
              + Zutat
            </button>
          </div>

          <div class="list-items">
            <div
              v-for="(ingredient, index) in formData.ingredients"
              :key="index"
              class="list-item"
            >
              <input
                v-model="formData.ingredients[index]"
                type="text"
                class="form-input"
                :placeholder="`Zutat ${index + 1}`"
              >
              <button
                type="button"
                class="btn-remove"
                @click="removeIngredient(index)"
                title="Entfernen"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Steps -->
        <div class="form-section">
          <div class="section-header">
            <h2>👨‍🍳 Zubereitung</h2>
            <button type="button" class="btn-add" @click="addStep">
              + Schritt
            </button>
          </div>

          <div class="list-items">
            <div
              v-for="(step, index) in formData.steps"
              :key="index"
              class="list-item"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <textarea
                v-model="formData.steps[index]"
                class="form-textarea"
                :placeholder="`Schritt ${index + 1}`"
                rows="2"
              ></textarea>
              <button
                type="button"
                class="btn-remove"
                @click="removeStep(index)"
                title="Entfernen"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label" for="tags">Tags (durch Komma getrennt)</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              class="form-input"
              placeholder="vegetarisch, schnell, italienisch"
            >
          </div>
        </div>

        <!-- Notes -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label" for="notes">Notizen</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              class="form-textarea"
              placeholder="Zusätzliche Hinweise, Tipps, Variationen..."
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Image URL (optional) -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label" for="imageUrl">Bild-URL (optional)</label>
            <input
              id="imageUrl"
              v-model="formData.imageUrl"
              type="url"
              class="form-input"
              placeholder="https://..."
            >
            <div v-if="formData.imageUrl" class="image-preview">
              <img :src="formData.imageUrl" alt="Vorschau">
            </div>
          </div>
        </div>

        <!-- Submit Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="handleCancel">
            Abbrechen
          </button>
          <button type="submit" class="btn-primary" :disabled="!canSubmit || saving">
            {{ saving ? 'Speichern...' : (isEdit ? 'Änderungen speichern' : 'Rezept erstellen') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types'

const route = useRoute()
const { recipes, saveRecipe } = useRecipes()
const { categories, emoji, categorizeRecipe } = useCategories()

const isEdit = computed(() => route.params.id !== 'new')
const saving = ref(false)

const formData = ref<Partial<Recipe>>({
  title: '',
  category: 'Abendessen',
  duration: 0,
  servings: 2,
  ingredients: [''],
  steps: [''],
  tags: [],
  notes: '',
  imageUrl: '',
  isFavorite: false,
})

const tagsInput = ref('')

const canSubmit = computed(() => {
  return formData.value.title?.trim() &&
         formData.value.ingredients?.some(i => i.trim()) &&
         formData.value.steps?.some(s => s.trim())
})

const addIngredient = () => {
  formData.value.ingredients?.push('')
}

const removeIngredient = (index: number) => {
  formData.value.ingredients?.splice(index, 1)
}

const addStep = () => {
  formData.value.steps?.push('')
}

const removeStep = (index: number) => {
  formData.value.steps?.splice(index, 1)
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  saving.value = true

  try {
    // Parse tags
    const tags = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t)

    // Auto-categorize if not manually selected
    let category = formData.value.category
    if (!category || category === 'Alle') {
      category = categorizeRecipe(formData.value)
    }

    const recipe: Recipe = {
      id: isEdit.value ? (route.params.id as string) : crypto.randomUUID(),
      title: formData.value.title!,
      category: category || 'Abendessen',
      duration: formData.value.duration || 0,
      servings: formData.value.servings || 2,
      ingredients: formData.value.ingredients?.filter(i => i.trim()) || [],
      steps: formData.value.steps?.filter(s => s.trim()) || [],
      tags,
      notes: formData.value.notes || undefined,
      imageUrl: formData.value.imageUrl || undefined,
      isFavorite: formData.value.isFavorite || false,
      createdAt: formData.value.createdAt || Date.now(),
    }

    await saveRecipe(recipe)
    navigateTo('/recipes')
  } catch (error) {
    console.error('Save error:', error)
    alert('Fehler beim Speichern')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  if (confirm('Änderungen verwerfen?')) {
    navigateTo(isEdit.value ? `/recipe/${route.params.id}` : '/recipes')
  }
}

// ESC key handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleCancel()
  }
}

// Load existing recipe for edit
onMounted(() => {
  if (isEdit.value) {
    const id = route.params.id as string
    const existing = recipes.value.find(r => r.id === id)
    
    if (existing) {
      formData.value = { ...existing }
      tagsInput.value = existing.tags?.join(', ') || ''
    } else {
      navigateTo('/recipes')
    }
  }
  
  // Add ESC key listener
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up event listener
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.form-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h1 {
  font-size: 28px;
  margin-top: 16px;
}

.back-btn {
  background: white;
  border: 1px solid var(--border);
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.recipe-form {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border);
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 20px;
  margin: 0;
}

.btn-add {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--primary-dark);
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.list-item .form-input,
.list-item .form-textarea {
  flex: 1;
  margin: 0;
}

.step-number {
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
  flex-shrink: 0;
  margin-top: 6px;
}

.btn-remove {
  background: white;
  border: 1px solid var(--border);
  color: var(--muted);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 6px;
}

.btn-remove:hover {
  background: #fee;
  border-color: #c33;
  color: #c33;
}

.image-preview {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.form-actions button {
  flex: 1;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .recipe-form {
    padding: 20px;
  }
}
</style>
