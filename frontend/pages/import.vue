<template>
  <div class="import-page">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="navigateTo('/recipes')">← Zurück</button>
      <h1>Rezept importieren</h1>
    </div>

    <!-- Loading -->
    <div v-if="state === 'loading'" class="status-state">
      <div class="spinner"></div>
      <p>Rezept wird geladen…</p>
    </div>

    <!-- Error -->
    <div v-else-if="state === 'error'" class="status-state error">
      <span class="status-icon">⚠️</span>
      <p>{{ errorMessage }}</p>
      <button class="btn-primary" @click="navigateTo('/recipes')">Zur Übersicht</button>
    </div>

    <!-- Preview -->
    <div v-else-if="state === 'preview' && recipe" class="preview">
      <div class="preview-badge">
        <span>Aus Claude Chat</span>
      </div>

      <div class="recipe-card-preview">
        <h2>{{ recipe.title }}</h2>

        <div class="meta-row">
          <span class="meta-chip">{{ emoji[recipe.category] || '🍽️' }} {{ recipe.category }}</span>
          <span class="meta-chip">⏱ {{ recipe.duration }} Min.</span>
          <span class="meta-chip">👤 {{ recipe.servings }} Portionen</span>
        </div>

        <div class="section">
          <h3>🥘 Zutaten</h3>
          <ul class="ingredient-list">
            <li v-for="(ing, i) in recipe.ingredients" :key="i">{{ ing }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>👨‍🍳 Zubereitung</h3>
          <ol class="steps-list">
            <li v-for="(step, i) in recipe.steps" :key="i">{{ step }}</li>
          </ol>
        </div>

        <div v-if="recipe.notes" class="section">
          <h3>📝 Notizen</h3>
          <p class="notes-text">{{ recipe.notes }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-bar">
        <button class="btn-secondary" @click="navigateTo('/recipes')">Abbrechen</button>
        <button class="btn-primary" :disabled="saving" @click="handleSave">
          <span v-if="saving">Wird gespeichert…</span>
          <span v-else>✓ In Flavr speichern</span>
        </button>
      </div>
    </div>

    <!-- Success -->
    <div v-else-if="state === 'success'" class="status-state success">
      <span class="status-icon">✅</span>
      <p><strong>{{ recipe?.title }}</strong> wurde gespeichert!</p>
      <button class="btn-primary" @click="navigateTo(`/recipe/${savedId}`)">Rezept ansehen</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types'

const route = useRoute()
const { saveRecipe } = useRecipes()
const { emoji } = useCategories()

type State = 'loading' | 'preview' | 'saving' | 'success' | 'error'
const state = ref<State>('loading')
const recipe = ref<Recipe | null>(null)
const saving = ref(false)
const savedId = ref<string | null>(null)
const errorMessage = ref('Ungültige Rezeptdaten.')

onMounted(() => {
  try {
    const raw = route.query.data as string
    if (!raw) throw new Error('Keine Daten übergeben')

    const decoded = JSON.parse(atob(decodeURIComponent(raw)))

    // Map incoming fields to Recipe type
    recipe.value = {
      id: crypto.randomUUID(),
      title: decoded.title || 'Unbekanntes Rezept',
      category: decoded.category || 'Abendessen',
      duration: Number(decoded.duration) || 0,
      servings: Number(decoded.servings) || 2,
      ingredients: decoded.ingredients || [],
      steps: decoded.steps || [],
      tags: decoded.tags || [],
      notes: decoded.notes || '',
      imageUrl: undefined,
      isFavorite: false,
      sourceApp: 'Claude Chat',
      createdAt: Date.now()
    }

    state.value = 'preview'
  } catch (e) {
    errorMessage.value = 'Das Rezept konnte nicht gelesen werden. Bitte erneut versuchen.'
    state.value = 'error'
  }
})

const handleSave = async () => {
  if (!recipe.value) return
  saving.value = true
  try {
    const saved = await saveRecipe(recipe.value)
    savedId.value = saved?.id || recipe.value.id
    state.value = 'success'
  } catch (e) {
    errorMessage.value = 'Fehler beim Speichern. Bist du eingeloggt?'
    state.value = 'error'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.import-page {
  padding: 0 0 80px;
  min-height: 100dvh;
}

.page-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  display: flex; align-items: center; gap: 12px;
}
.page-header h1 { font-size: 18px; font-weight: 700; }
.back-btn {
  background: none; border: none; cursor: pointer;
  color: var(--primary); font-size: 15px; font-weight: 600;
  white-space: nowrap;
}

/* Status states */
.status-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 80px 24px; text-align: center;
}
.status-state.error { color: var(--danger); }
.status-state.success { color: var(--primary); }
.status-icon { font-size: 48px; }

/* Preview */
.preview { padding: 16px; }

.preview-badge {
  display: inline-flex; align-items: center;
  background: var(--primary-light); color: var(--primary);
  font-size: 12px; font-weight: 600;
  padding: 4px 10px; border-radius: 20px;
  margin-bottom: 12px;
}

.recipe-card-preview {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 16px;
}
.recipe-card-preview h2 { font-size: 22px; font-weight: 800; }

.meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
.meta-chip {
  background: var(--surface2); border-radius: 20px;
  padding: 4px 10px; font-size: 13px; font-weight: 500;
}

.section h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }

.ingredient-list {
  list-style: none; display: flex; flex-direction: column; gap: 6px;
}
.ingredient-list li {
  padding: 8px 12px;
  background: var(--surface2); border-radius: var(--radius-sm);
  font-size: 14px;
}
.ingredient-list li::before { content: '• '; color: var(--primary); }

.steps-list {
  padding-left: 20px; display: flex; flex-direction: column; gap: 8px;
}
.steps-list li { font-size: 14px; line-height: 1.5; }

.notes-text {
  font-size: 14px; color: var(--text-mid);
  background: var(--warning-bg); border-radius: var(--radius-sm);
  padding: 10px 12px;
}

/* Actions */
.action-bar {
  display: flex; gap: 10px; margin-top: 20px;
}
.btn-secondary {
  flex: 1; padding: 14px;
  background: var(--surface2); border: none;
  border-radius: var(--radius); font-weight: 700;
  font-size: 15px; cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.btn-primary { flex: 2; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
