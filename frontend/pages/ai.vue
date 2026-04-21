<template>
  <div class="ai-page">
    <div class="ai-hero">
      <div class="ai-hero-icon">🤖</div>
      <h1 class="ai-hero-title">Was kann ich kochen?</h1>
      <p class="ai-hero-sub">
        Gib deine Zutaten ein — die KI schlägt passende Rezepte vor
      </p>
    </div>

    <div class="ai-content">
      <!-- Ingredient Input -->
      <div class="ai-section">
        <label class="form-label">Welche Zutaten hast du?</label>
        
        <!-- Simple Input Fallback -->
        <div class="ingredient-input-fallback">
          <div class="input-row">
            <input
              v-model="newIngredient"
              type="text"
              class="form-input"
              placeholder="z.B. Eier, Kartoffeln, Käse..."
              @keydown.enter.prevent="addIngredient"
            >
            <button type="button" class="btn-add" @click="addIngredient">
              ＋ Hinzufügen
            </button>
          </div>
          
          <div v-if="ingredients.length > 0" class="ingredients-list">
            <div v-for="(ingredient, index) in ingredients" :key="index" class="ingredient-chip">
              <span>{{ ingredient }}</span>
              <button type="button" @click="removeIngredient(index)" class="chip-remove">✕</button>
            </div>
          </div>
          
          <div v-else class="empty-hint">
            Füge Zutaten hinzu, um Rezeptvorschläge zu erhalten
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="ai-actions">
        <button
          class="btn-primary btn-large"
          :disabled="ingredients.length === 0 || loading"
          @click="getSuggestions"
        >
          {{ loading ? '🤔 KI denkt nach...' : '✨ Rezepte vorschlagen' }}
        </button>
        
        <button
          class="btn-secondary btn-large"
          :disabled="loading"
          @click="analyzePhoto"
        >
          📸 Zutaten fotografieren
        </button>
      </div>

      <!-- Photo Upload (hidden) -->
      <input
        ref="photoInput"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="handlePhotoUpload"
      >

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <p>❌ {{ error }}</p>
        <button class="btn-secondary" @click="error = ''">
          Erneut versuchen
        </button>
      </div>

      <!-- Suggestions -->
      <div v-if="suggestions.length > 0" class="suggestions-section">
        <h2>💡 Vorgeschlagene Rezepte</h2>
        <p class="suggestions-intro">
          Die KI hat {{ suggestions.length }} Rezepte für deine Zutaten gefunden:
        </p>

        <div class="suggestions-grid">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-card"
          >
            <div class="suggestion-header">
              <h3>{{ suggestion.title }}</h3>
              <div class="suggestion-meta">
                <span v-if="suggestion.duration">⏱️ {{ suggestion.duration }} Min.</span>
                <span v-if="suggestion.servings">👥 {{ suggestion.servings }} Pers.</span>
              </div>
            </div>

            <div class="suggestion-preview">
              <div class="preview-section">
                <strong>Zutaten:</strong>
                <ul class="preview-list">
                  <li v-for="(ing, i) in suggestion.ingredients.slice(0, 4)" :key="i">
                    {{ ing }}
                  </li>
                  <li v-if="suggestion.ingredients.length > 4" class="preview-more">
                    +{{ suggestion.ingredients.length - 4 }} weitere
                  </li>
                </ul>
              </div>

              <div class="preview-section">
                <strong>Schritte:</strong>
                <ol class="preview-list">
                  <li v-for="(step, i) in suggestion.steps.slice(0, 2)" :key="i">
                    {{ step.substring(0, 80) }}{{ step.length > 80 ? '...' : '' }}
                  </li>
                  <li v-if="suggestion.steps.length > 2" class="preview-more">
                    +{{ suggestion.steps.length - 2 }} weitere Schritte
                  </li>
                </ol>
              </div>
            </div>

            <button
              class="btn-primary"
              @click="createFromSuggestion(index)"
            >
              ✅ Rezept speichern
            </button>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div v-if="!loading && !error && suggestions.length === 0" class="tips-section">
        <h3>💡 Tipps</h3>
        <ul class="tips-list">
          <li>Gib mindestens 2-3 Hauptzutaten ein für bessere Vorschläge</li>
          <li>Du kannst auch Gewürze und Beilagen angeben</li>
          <li>Die KI berücksichtigt automatisch deine bestehenden Rezepte</li>
          <li>Nutze die Kamera-Funktion, um Zutaten aus einem Foto zu erkennen</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIRecipeSuggestion } from '~/types'

const { suggestRecipes, parseRecipeFromImage } = useAI()
const { saveRecipe } = useRecipes()
const { categorizeRecipe } = useCategories()

const ingredients = ref<string[]>([])
const suggestions = ref<AIRecipeSuggestion[]>([])
const loading = ref(false)
const loadingMessage = ref('')
const error = ref('')
const photoInput = ref<HTMLInputElement>()
const newIngredient = ref('')

const addIngredient = () => {
  const value = newIngredient.value.trim()
  if (!value) return
  
  // Split by comma if multiple ingredients
  const items = value.split(',').map(i => i.trim()).filter(i => i)
  if (items.length > 0) {
    ingredients.value = [...ingredients.value, ...items]
    newIngredient.value = ''
  }
}

const removeIngredient = (index: number) => {
  ingredients.value.splice(index, 1)
}

const getSuggestions = async () => {
  if (ingredients.value.length === 0) return

  loading.value = true
  loadingMessage.value = 'KI analysiert deine Zutaten...'
  error.value = ''
  suggestions.value = []

  try {
    const result = await suggestRecipes(ingredients.value)
    suggestions.value = result
    
    if (result.length === 0) {
      error.value = 'Keine Rezepte gefunden. Versuche andere Zutaten.'
    }
  } catch (e: any) {
    console.error('Suggestion error:', e)
    error.value = e.message || 'Fehler bei der KI-Anfrage. Bitte versuche es erneut.'
  } finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

const analyzePhoto = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  loading.value = true
  loadingMessage.value = 'Foto wird analysiert...'
  error.value = ''

  try {
    // Convert to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string)?.split(',')[1]
        if (!base64) throw new Error('Fehler beim Lesen des Fotos')

        loadingMessage.value = 'KI erkennt Zutaten...'
        
        // Parse image via Claude Vision
        const result = await parseRecipeFromImage(base64)
        
        if (result && result.ingredients && result.ingredients.length > 0) {
          // Add new ingredients (avoid duplicates)
          const newIngredients = result.ingredients.filter(
            (ing: string) => !ingredients.value.includes(ing)
          )
          ingredients.value = [...ingredients.value, ...newIngredients]
          
          // Show success message
          loadingMessage.value = `${newIngredients.length} Zutaten erkannt!`
          setTimeout(() => {
            loadingMessage.value = ''
            loading.value = false
          }, 2000)
          
          // Auto-suggest after photo analysis
          if (ingredients.value.length > 0) {
            await getSuggestions()
          }
        } else {
          error.value = 'Keine Zutaten im Foto erkannt. Versuche ein klareres Foto oder gib die Zutaten manuell ein.'
          loading.value = false
          loadingMessage.value = ''
        }
      } catch (e: any) {
        console.error('Photo analysis error:', e)
        // Show specific error message
        const errorMsg = e.data?.error?.message || e.data?.error || e.message || ''
        if (errorMsg.includes('API key') || errorMsg.includes('authentication')) {
          error.value = 'KI-Service nicht verfügbar. Bitte versuche es später erneut.'
        } else if (errorMsg.includes('rate limit')) {
          error.value = 'Zu viele Anfragen. Bitte warte einen Moment.'
        } else if (e.statusCode === 500 || e.status === 500) {
          error.value = 'Server-Fehler. Bitte versuche es später erneut oder gib die Zutaten manuell ein.'
        } else {
          error.value = 'Fehler bei der Foto-Analyse. Bitte versuche ein anderes Foto oder gib die Zutaten manuell ein.'
        }
        loading.value = false
        loadingMessage.value = ''
      } finally {
        input.value = '' // Reset input
      }
    }
    
    reader.onerror = () => {
      error.value = 'Fehler beim Laden des Fotos. Bitte versuche es erneut.'
      loading.value = false
      loadingMessage.value = ''
    }
    
    reader.readAsDataURL(file)
  } catch (e: any) {
    console.error('Photo upload error:', e)
    error.value = 'Fehler beim Hochladen des Fotos.'
    loading.value = false
    loadingMessage.value = ''
  }
}

const createFromSuggestion = async (index: number) => {
  const suggestion = suggestions.value[index]
  if (!suggestion) return

  try {
    // Parse duration: extract number from strings like "30 Minuten" or "1 Stunde"
    let duration = 30
    if (typeof suggestion.duration === 'number') {
      duration = suggestion.duration
    } else if (typeof suggestion.duration === 'string') {
      const match = suggestion.duration.match(/(\d+)/)
      if (match) {
        duration = parseInt(match[1], 10)
        // Convert hours to minutes if needed
        if (suggestion.duration.toLowerCase().includes('stunde')) {
          duration = duration * 60
        }
      }
    }
    
    // Parse servings: extract number
    let servings = 2
    if (typeof suggestion.servings === 'number') {
      servings = suggestion.servings
    } else if (typeof suggestion.servings === 'string') {
      const match = suggestion.servings.match(/(\d+)/)
      if (match) {
        servings = parseInt(match[1], 10)
      }
    }

    const recipe = {
      id: crypto.randomUUID(),
      title: suggestion.title,
      category: categorizeRecipe(suggestion),
      duration,
      servings,
      ingredients: suggestion.ingredients,
      steps: suggestion.steps,
      tags: ['KI-generiert', ...ingredients.value.slice(0, 3)],
      isFavorite: false,
      sourceApp: 'KI-Koch',
      createdAt: Date.now(),
    }

    await saveRecipe(recipe)
    
    // Navigate to recipe detail
    navigateTo(`/recipe/${recipe.id}`)
  } catch (e: any) {
    console.error('Save error:', e)
    alert('Fehler beim Speichern des Rezepts')
  }
}
</script>

<style scoped>
.ai-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.ai-hero {
  text-align: center;
  margin-bottom: 48px;
}

.ai-hero-icon {
  font-size: 80px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.ai-hero-title {
  font-size: 36px;
  margin-bottom: 12px;
}

.ai-hero-sub {
  font-size: 18px;
  color: var(--muted);
}

.ai-content {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.ai-section {
  margin-bottom: 32px;
}

.ingredient-input-fallback {
  margin-top: 12px;
}

.input-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.input-row .form-input {
  flex: 1;
}

.btn-add {
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add:hover {
  background: #e64d2e;
  transform: translateY(-2px);
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.ingredient-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 20px;
  font-size: 14px;
}

.chip-remove {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.chip-remove:hover {
  color: #c33;
}

.empty-hint {
  color: var(--muted);
  font-size: 14px;
  font-style: italic;
  padding: 12px;
  text-align: center;
  background: var(--bg);
  border-radius: 12px;
}

.ai-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.btn-large {
  flex: 1;
  min-width: 200px;
  padding: 16px 24px;
  font-size: 16px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state p,
.error-state p {
  margin-top: 16px;
  color: var(--muted);
  font-size: 16px;
}

.error-state p {
  color: #c33;
}

.error-state button {
  margin-top: 16px;
}

.suggestions-section {
  margin-top: 48px;
}

.suggestions-section h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.suggestions-intro {
  color: var(--muted);
  margin-bottom: 24px;
}

.suggestions-grid {
  display: grid;
  gap: 24px;
}

.suggestion-card {
  background: var(--bg);
  padding: 24px;
  border-radius: 16px;
  border: 2px solid var(--border);
  transition: all 0.3s;
}

.suggestion-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.15);
}

.suggestion-header h3 {
  font-size: 22px;
  margin-bottom: 8px;
}

.suggestion-meta {
  display: flex;
  gap: 16px;
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 16px;
}

.suggestion-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.preview-section {
  background: white;
  padding: 16px;
  border-radius: 12px;
}

.preview-section strong {
  display: block;
  margin-bottom: 8px;
  color: var(--text);
}

.preview-list {
  padding-left: 20px;
  margin: 0;
}

.preview-list li {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
}

.preview-more {
  color: var(--muted);
  font-style: italic;
  list-style: none;
  margin-left: -20px;
}

.suggestion-card .btn-primary {
  width: 100%;
}

.tips-section {
  background: var(--bg);
  padding: 24px;
  border-radius: 16px;
  margin-top: 32px;
}

.tips-section h3 {
  margin-bottom: 12px;
}

.tips-list {
  list-style: none;
  padding: 0;
}

.tips-list li {
  padding: 8px 0 8px 28px;
  position: relative;
  line-height: 1.6;
}

.tips-list li:before {
  content: '💡';
  position: absolute;
  left: 0;
}

@media (max-width: 768px) {
  .ai-hero-title {
    font-size: 28px;
  }

  .ai-content {
    padding: 20px;
  }

  .ai-actions {
    flex-direction: column;
  }

  .btn-large {
    width: 100%;
  }

  .suggestion-preview {
    grid-template-columns: 1fr;
  }
}
</style>
