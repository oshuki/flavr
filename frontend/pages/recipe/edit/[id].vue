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

        <!-- Image -->
        <div class="form-section">
          <label class="form-label">Bild (optional)</label>

          <!-- Preview -->
          <div v-if="formData.imageUrl" class="image-preview">
            <img :src="formData.imageUrl" alt="Vorschau">
            <button type="button" class="btn-remove-img" @click="formData.imageUrl = ''">✕</button>
          </div>

          <div v-if="!formData.imageUrl" class="image-actions">
            <!-- Upload -->
            <label class="btn-upload">
              {{ uploading ? '⏳ Lädt hoch…' : '📷 Eigenes Foto' }}
              <input
                type="file"
                accept="image/*"
                style="display:none"
                :disabled="uploading"
                @change="handleImageUpload"
              >
            </label>

            <!-- KI-Bild -->
            <button
              type="button"
              class="btn-ai"
              @click="handleGenerateImage"
              :disabled="!formData.title || isGeneratingImage"
            >
              {{ isGeneratingImage ? '🎨 Generiere…' : '✨ KI-Bild' }}
            </button>
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
const { generateRecipeImage, isGenerating: isGeneratingImage } = useImageGeneration()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const uploading = ref(false)

const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const ext = file.name.split('.').pop()
    const path = `${user.value?.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('recipe-images').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(path)
    formData.value.imageUrl = data.publicUrl
  } catch (e: any) {
    alert('Upload fehlgeschlagen: ' + e.message)
  } finally {
    uploading.value = false
  }
}

// Check if recipe exists to determine edit mode
const existingRecipe = computed(() => {
  const id = route.params.id as string
  return recipes.value.find(r => r.id === id)
})

const isEdit = computed(() => !!existingRecipe.value)
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

const handleGenerateImage = async () => {
  if (!formData.value.title) return
  
  const imageUrl = await generateRecipeImage(
    formData.value.title,
    formData.value.ingredients?.filter(i => i.trim()) || []
  )
  
  if (imageUrl) {
    formData.value.imageUrl = imageUrl
  } else {
    alert('Bildgenerierung fehlgeschlagen. Bitte versuche es erneut.')
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  saving.value = true

  try {
    // Check if user is logged in
    const user = useSupabaseUser()
    if (!user.value) {
      alert('Du musst eingeloggt sein um Rezepte zu speichern!')
      navigateTo('/auth')
      return
    }

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
      id: route.params.id as string,
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

    console.log('Saving recipe:', recipe)
    await saveRecipe(recipe)
    console.log('Recipe saved successfully')
    navigateTo('/recipes')
  } catch (error: any) {
    console.error('Save error:', error)
    console.error('Error message:', error?.message)
    console.error('Error details:', error?.details || error?.hint)
    alert(`Fehler beim Speichern: ${error?.message || 'Unbekannter Fehler'}`)
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
  if (existingRecipe.value) {
    formData.value = {
      ...existingRecipe.value,
      ingredients: [...existingRecipe.value.ingredients],
      steps: [...existingRecipe.value.steps],
      tags: [...existingRecipe.value.tags],
    }
    tagsInput.value = existingRecipe.value.tags?.join(', ') || ''
  }
  
  // Add ESC key listener (browser only)
  if (process.client) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  // Clean up event listener (browser only)
  if (process.client) {
    window.removeEventListener('keydown', handleKeydown)
  }
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
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  max-width: 300px;
  margin-bottom: 12px;
}
.image-preview img { width: 100%; height: auto; display: block; }
.btn-remove-img {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,0.55); color: #fff;
  border: none; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.image-actions {
  display: flex; gap: 10px; flex-wrap: wrap;
}

.btn-upload {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 20px; border-radius: 12px;
  background: var(--surface2); border: 1.5px dashed var(--border);
  font-size: 14px; font-weight: 600; color: var(--text-mid);
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.btn-upload:hover { border-color: var(--primary); background: var(--primary-light); }

.btn-ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-ai:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-ai:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
