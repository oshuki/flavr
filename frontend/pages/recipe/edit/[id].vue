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
            <button type="button" class="btn-remove-img" @click="clearImage" aria-label="Bild entfernen">✕</button>
          </div>
          <p v-if="formData.imageSource === 'unsplash' && formData.imageCredit" class="unsplash-credit">
            Foto von <a :href="formData.imageCreditUrl" target="_blank" rel="noopener">{{ formData.imageCredit }}</a>
            auf <a href="https://unsplash.com/?utm_source=flavr&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>
          </p>

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

            <!-- Bildvorschlag -->
            <button
              type="button"
              class="btn-ai"
              @click="handleSuggestImage"
              :disabled="!formData.title || isGeneratingImage"
            >
              {{ isGeneratingImage ? '🎨 Lädt Vorschläge…' : '✨ Bild vorschlagen' }}
            </button>
          </div>

          <!-- Fehler / Hinweise -->
          <p v-if="suggestionError" class="image-hint image-hint--error">
            {{ suggestionError }}
          </p>

          <!-- Vorschlags-Galerie -->
          <div v-if="showGallery" class="suggestion-gallery">
            <div class="gallery-header">
              <h3>Bildvorschläge</h3>
              <button type="button" class="btn-close-gallery" @click="closeGallery" aria-label="Galerie schließen">✕</button>
            </div>

            <div v-if="suggestions.length" class="gallery-grid">
              <button
                v-for="(s, i) in suggestions"
                :key="i"
                type="button"
                class="gallery-tile"
                :disabled="persisting"
                @click="selectSuggestion(s)"
              >
                <div v-if="!loadedTiles[i] && !erroredTiles[i]" class="tile-spinner">
                  <div class="spinner small"></div>
                </div>
                <img
                  v-if="!erroredTiles[i]"
                  :src="s.thumbUrl || s.url"
                  :alt="`Bildvorschlag ${i + 1}`"
                  class="tile-img"
                  :class="{ 'tile-img--loading': !loadedTiles[i] }"
                  @load="onTileLoad(i)"
                  @error="onTileError(i)"
                  loading="lazy"
                >
                <span v-if="s.source === 'unsplash'" class="tile-badge">Unsplash</span>
              </button>
            </div>

            <p v-if="persisting" class="image-hint">Bild wird übernommen…</p>
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
import type { ImageSuggestion } from '~/composables/useImageGeneration'

const route = useRoute()
const { recipes, saveRecipe } = useRecipes()
const { categories, emoji, categorizeRecipe } = useCategories()
const { fetchSuggestions, persistPollinations, isGenerating: isGeneratingImage } = useImageGeneration()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const uploading = ref(false)

// Image suggestion gallery state
const showGallery = ref(false)
const suggestions = ref<ImageSuggestion[]>([])
const suggestionError = ref<string | null>(null)
const persisting = ref(false)
const loadedTiles = ref<Record<number, boolean>>({})
const erroredTiles = ref<Record<number, boolean>>({})
let unsplashFallbackTried = false

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
    formData.value.imageSource = 'upload'
    formData.value.imageCredit = undefined
    formData.value.imageCreditUrl = undefined
  } catch (e: any) {
    alert('Upload fehlgeschlagen: ' + e.message)
  } finally {
    uploading.value = false
  }
}

const clearImage = () => {
  formData.value.imageUrl = ''
  formData.value.imageSource = undefined
  formData.value.imageCredit = undefined
  formData.value.imageCreditUrl = undefined
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

const resetTileState = () => {
  loadedTiles.value = {}
  erroredTiles.value = {}
}

const loadSuggestions = async (prefer?: 'unsplash') => {
  if (!formData.value.title) return

  suggestionError.value = null

  const result = await fetchSuggestions(
    formData.value.title,
    formData.value.ingredients?.filter(i => i.trim()) || [],
    { count: 3, ...(prefer ? { prefer } : {}) }
  )

  if (result.error) {
    suggestionError.value = result.error
    suggestions.value = []
    showGallery.value = false
    return
  }

  if (!result.suggestions.length) {
    suggestionError.value = 'Es wurden keine Bildvorschläge gefunden. Versuche es später erneut oder lade ein eigenes Foto hoch.'
    suggestions.value = []
    showGallery.value = false
    return
  }

  suggestions.value = result.suggestions
  resetTileState()
  showGallery.value = true
}

const handleSuggestImage = async () => {
  if (!formData.value.title) return
  unsplashFallbackTried = false
  await loadSuggestions()
}

const onTileLoad = (index: number) => {
  loadedTiles.value = { ...loadedTiles.value, [index]: true }
}

const onTileError = async (index: number) => {
  erroredTiles.value = { ...erroredTiles.value, [index]: true }

  // If a Pollinations image fails to load, fall back to Unsplash suggestions once
  const failedSuggestion = suggestions.value[index]
  if (!unsplashFallbackTried && failedSuggestion?.source === 'pollinations') {
    unsplashFallbackTried = true
    await loadSuggestions('unsplash')
  }
}

const closeGallery = () => {
  showGallery.value = false
  suggestions.value = []
  suggestionError.value = null
}

const selectSuggestion = async (suggestion: ImageSuggestion) => {
  if (persisting.value) return

  if (suggestion.source === 'pollinations') {
    persisting.value = true
    try {
      const result = await persistPollinations(suggestion.url)
      if ('error' in result) {
        suggestionError.value = result.error
        return
      }
      formData.value.imageUrl = result.imageUrl
      formData.value.imageSource = 'pollinations'
      formData.value.imageCredit = undefined
      formData.value.imageCreditUrl = undefined
      closeGallery()
    } finally {
      persisting.value = false
    }
  } else {
    formData.value.imageUrl = suggestion.url
    formData.value.imageSource = 'unsplash'
    formData.value.imageCredit = suggestion.credit || undefined
    formData.value.imageCreditUrl = suggestion.creditUrl || undefined
    closeGallery()
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
      imageSource: formData.value.imageUrl ? formData.value.imageSource : undefined,
      imageCredit: formData.value.imageUrl ? formData.value.imageCredit : undefined,
      imageCreditUrl: formData.value.imageUrl ? formData.value.imageCreditUrl : undefined,
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

.unsplash-credit {
  font-size: 12px; color: var(--muted); margin-top: 6px;
}
.unsplash-credit a {
  color: var(--muted); text-decoration: underline;
}

.image-hint {
  font-size: 13px; color: var(--muted); margin-top: 10px; line-height: 1.5;
}
.image-hint--error {
  color: #c33;
}

.suggestion-gallery {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface2);
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.gallery-header h3 {
  font-size: 15px;
  margin: 0;
  font-weight: 700;
}

.btn-close-gallery {
  background: white;
  border: 1px solid var(--border);
  color: var(--muted);
  width: 28px; height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.btn-close-gallery:hover {
  background: #fee; border-color: #c33; color: #c33;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.gallery-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid var(--border);
  background: var(--surface);
  padding: 0;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.gallery-tile:hover:not(:disabled) {
  border-color: var(--primary);
  transform: translateY(-2px);
}
.gallery-tile:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tile-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.tile-img--loading {
  opacity: 0;
}

.tile-spinner {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2);
}

.spinner.small {
  width: 22px; height: 22px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tile-badge {
  position: absolute;
  bottom: 4px; right: 4px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}

@media (max-width: 600px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
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
