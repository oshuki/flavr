<template>
  <div class="ai-page">
    <!-- Hero -->
    <div class="ai-hero">
      <img src="/flavr-logo-2.png" alt="flavr" class="ai-logo" @click="navigateTo('/recipes')" style="cursor: pointer;">
      <h1 class="ai-title">Was ist im Kühlschrank?</h1>
      <p class="ai-sub">Zutaten eingeben – die KI schlägt passende Rezepte vor.</p>
    </div>

    <div class="ai-body">
      <!-- Ingredient section -->
      <section class="ai-section">
        <label class="form-label">Deine Zutaten</label>

        <!-- Stories-style chips when ingredients exist -->
        <div v-if="ingredients.length" class="ingredient-stories">
          <div
            v-for="(ing, i) in ingredients"
            :key="i"
            class="story-chip"
          >
            <div class="story-circle">{{ ing.charAt(0).toUpperCase() }}</div>
            <span class="story-label">{{ ing }}</span>
            <button class="story-remove" @click="removeIngredient(i)" aria-label="Entfernen">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
          </div>
          <!-- Add more -->
          <div class="story-add" @click="focusInput">
            <div class="story-circle add">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            </div>
            <span class="story-label">Mehr</span>
          </div>
        </div>

        <!-- Input row -->
        <div class="input-row">
          <input
            ref="inputRef"
            v-model="newIngredient"
            type="text"
            class="form-input"
            placeholder="z.B. Eier, Kartoffeln, Käse…"
            @keydown.enter.prevent="addIngredient"
          >
          <button type="button" class="btn-add" @click="addIngredient" :disabled="!newIngredient.trim()">
            Hinzufügen
          </button>
        </div>
      </section>

      <!-- Action buttons -->
      <div class="ai-actions">
        <button
          class="btn-primary btn-suggest"
          :disabled="ingredients.length === 0 || loading"
          @click="getSuggestions"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            <path d="M20 3v4"/><path d="M22 5h-4"/>
          </svg>
          {{ loading ? 'KI denkt nach…' : 'Rezepte vorschlagen' }}
        </button>
        <button class="btn-secondary btn-camera" @click="analyzePhoto" :disabled="loading">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
          </svg>
          Foto scannen
        </button>
      </div>

      <input ref="photoInput" type="file" accept="image/*" capture="environment" style="display:none" @change="handlePhotoUpload">

      <!-- Loading -->
      <div v-if="loading" class="state-loading">
        <div class="spinner"></div>
        <p>{{ loadingMessage || 'Rezepte werden gesucht…' }}</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="state-error">
        <p>{{ error }}</p>
        <button class="btn-secondary" @click="error = ''">Erneut versuchen</button>
      </div>

      <!-- Local matches -->
      <section v-if="localMatches.length" class="suggestions">
        <div class="local-header">
          <h2 class="section-title">{{ localMatches.length }} Treffer in deiner Sammlung</h2>
          <button class="btn-ask-ai" @click="forceAI" :disabled="loading">✨ KI fragen</button>
        </div>
        <div class="suggestion-list">
          <div
            v-for="r in localMatches"
            :key="r.id"
            class="suggestion-card local-card"
            @click="navigateTo(`/recipe/${r.id}`)"
          >
            <div class="suggestion-content">
              <h3 class="suggestion-name">{{ r.title }}</h3>
              <div class="suggestion-meta">
                <span v-if="r.duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {{ r.duration }} Min.
                </span>
                <span v-if="r.servings">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {{ r.servings }} Pers.
                </span>
                <span class="local-badge">📚 Gespeichert</span>
              </div>
              <div class="suggestion-ings">
                <span v-for="tag in r.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      </section>

      <!-- AI Suggestions -->
      <section v-if="suggestions.length" class="suggestions">
        <h2 class="section-title">{{ suggestions.length }} KI-Vorschläge</h2>
        <div class="suggestion-list">
          <div
            v-for="(s, i) in suggestions"
            :key="i"
            class="suggestion-card"
          >
            <div class="suggestion-content">
              <h3 class="suggestion-name">{{ s.title }}</h3>
              <div class="suggestion-meta">
                <span v-if="s.duration">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {{ s.duration }} Min.
                </span>
                <span v-if="s.servings">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {{ s.servings }} Pers.
                </span>
                <span v-if="ingredients.length" class="match-badge">
                  {{ getAvailableIngredients(s).length }}/{{ s.ingredients.length }} vorhanden
                </span>
              </div>
              <div class="suggestion-ings">
                <span
                  v-for="(ing, j) in s.ingredients.slice(0, 5)"
                  :key="j"
                  class="tag"
                  :class="ingredients.length ? (getMissingIngredients(s).includes(ing) ? 'tag-missing' : 'tag-have') : ''"
                >{{ ing }}</span>
                <span v-if="s.ingredients.length > 5" class="tag tag-more">+{{ s.ingredients.length - 5 }}</span>
              </div>
            </div>
            <button class="btn-save" @click="createFromSuggestion(i)" :disabled="loading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              Speichern
            </button>
          </div>
        </div>
      </section>

      <!-- Tips (empty state) -->
      <div v-if="!loading && !error && suggestions.length === 0 && ingredients.length === 0" class="tips">
        <p class="tip-item">Mindestens 2–3 Hauptzutaten für bessere Vorschläge</p>
        <p class="tip-item">Gewürze und Beilagen verfeinern das Ergebnis</p>
        <p class="tip-item">Nutze die Kamera, um Zutaten zu scannen</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AIRecipeSuggestion } from '~/types'

const { suggestRecipes, parseRecipeFromImage } = useAI()
const { saveRecipe, recipes, loadRecipes } = useRecipes()
const { categorizeRecipe } = useCategories()

const ingredients    = ref<string[]>([])
const suggestions    = ref<AIRecipeSuggestion[]>([])
const localMatches   = ref<any[]>([])
const loading        = ref(false)
const loadingMessage = ref('')
const error          = ref('')
const newIngredient  = ref('')
const photoInput     = ref<HTMLInputElement>()
const inputRef       = ref<HTMLInputElement>()

const findLocalMatches = (ings: string[]) => {
  if (!recipes.value.length) return []
  const terms = ings.map(i => i.toLowerCase())
  return recipes.value
    .map(r => {
      const text = `${r.title} ${r.ingredients.join(' ')} ${r.tags.join(' ')}`.toLowerCase()
      const hits = terms.filter(t => text.includes(t)).length
      return { recipe: r, hits }
    })
    .filter(({ hits }) => hits >= Math.min(2, terms.length))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4)
    .map(({ recipe }) => recipe)
}

const focusInput = () => inputRef.value?.focus()

const addIngredient = () => {
  const items = newIngredient.value.split(',').map(i => i.trim()).filter(Boolean)
  if (items.length) { ingredients.value = [...ingredients.value, ...items]; newIngredient.value = ''; localMatches.value = []; suggestions.value = [] }
}

const removeIngredient = (i: number) => { ingredients.value.splice(i, 1); localMatches.value = []; suggestions.value = [] }

const getSuggestions = async () => {
  if (!ingredients.value.length) return
  error.value = ''; suggestions.value = []

  if (!recipes.value.length) await loadRecipes()
  const matches = findLocalMatches(ingredients.value)
  if (matches.length) {
    localMatches.value = matches
    return
  }

  await callAI()
}

const forceAI = async () => {
  localMatches.value = []
  await callAI()
}

const callAI = async () => {
  loading.value = true; loadingMessage.value = 'KI analysiert deine Zutaten…'
  try {
    const result = await suggestRecipes(ingredients.value)
    suggestions.value = result
    if (!result.length) error.value = 'Keine Rezepte gefunden. Versuche andere Zutaten.'
  } catch (e: any) {
    error.value = e.message || 'Fehler bei der KI-Anfrage.'
  } finally { loading.value = false; loadingMessage.value = '' }
}

const analyzePhoto = () => photoInput.value?.click()

const handlePhotoUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  loading.value = true; loadingMessage.value = 'Foto wird analysiert…'; error.value = ''
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const base64 = (e.target?.result as string)?.split(',')[1]
      if (!base64) throw new Error('Fehler beim Lesen des Fotos')
      loadingMessage.value = 'KI erkennt Zutaten…'
      const result = await parseRecipeFromImage(base64)
      if (result?.ingredients?.length) {
        const newIngs = result.ingredients.filter((i: string) => !ingredients.value.includes(i))
        ingredients.value = [...ingredients.value, ...newIngs]
        if (ingredients.value.length) await getSuggestions()
      } else {
        error.value = 'Keine Zutaten erkannt. Bitte manuell eingeben.'
        loading.value = false
      }
    } catch (e: any) {
      error.value = 'Fehler bei der Foto-Analyse.'
      loading.value = false
    } finally {
      ;(event.target as HTMLInputElement).value = ''
    }
  }
  reader.readAsDataURL(file)
}

const normalizeIngredient = (s: string) =>
  s.toLowerCase().replace(/^\d[\d.,/\s]*\s*[a-zäöü]{0,3}\s*/i, '').trim()

const getMissingIngredients = (suggestion: AIRecipeSuggestion) => {
  const have = ingredients.value.map(normalizeIngredient)
  return suggestion.ingredients.filter(ing => {
    const norm = normalizeIngredient(ing)
    return !have.some(h => norm.includes(h) || h.includes(norm))
  })
}

const getAvailableIngredients = (suggestion: AIRecipeSuggestion) => {
  const have = ingredients.value.map(normalizeIngredient)
  return suggestion.ingredients.filter(ing => {
    const norm = normalizeIngredient(ing)
    return have.some(h => norm.includes(h) || h.includes(norm))
  })
}

const createFromSuggestion = async (i: number) => {
  const s = suggestions.value[i]
  if (!s) return
  try {
    let duration = typeof s.duration === 'number' ? s.duration : parseInt(String(s.duration || '30'))
    let servings = typeof s.servings === 'number' ? s.servings : parseInt(String(s.servings || '4'))
    if (isNaN(duration)) duration = 30
    if (isNaN(servings)) servings = 4
    const recipe = { id: crypto.randomUUID(), title: s.title, category: categorizeRecipe(s), duration, servings, ingredients: s.ingredients, steps: s.steps, tags: ['KI-generiert', ...ingredients.value.slice(0, 3)], isFavorite: false, sourceApp: 'KI-Koch', createdAt: Date.now() }
    await saveRecipe(recipe)
    navigateTo(`/recipe/${recipe.id}`)
  } catch (e: any) { error.value = 'Fehler beim Speichern.' }
}
</script>

<style scoped>
.ai-page { min-height: 100dvh; background: var(--bg); }

/* Hero */
.ai-hero {
  padding: calc(env(safe-area-inset-top) + 24px) 20px 28px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}
.ai-logo { height: 32px; margin: 0 auto 16px; display: block; }
.ai-title { font-size: 24px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 6px; }
.ai-sub   { color: var(--muted); font-size: 15px; }

/* Body */
.ai-body { padding: 24px 16px; max-width: 680px; margin: 0 auto; }

.ai-section { margin-bottom: 20px; }

/* Stories-style chips */
.ingredient-stories {
  display: flex; gap: 12px; overflow-x: auto;
  padding: 8px 0 12px; scrollbar-width: none;
}
.ingredient-stories::-webkit-scrollbar { display: none; }

.story-chip, .story-add {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  flex-shrink: 0; cursor: pointer; position: relative;
}

.story-circle {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-mid));
  color: #fff; font-weight: 800; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--primary);
}
.story-circle.add {
  background: var(--surface2);
  border: 2px dashed var(--border);
  color: var(--muted);
}

.story-label {
  font-size: 10px; font-weight: 600; color: var(--text-mid);
  max-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  text-align: center;
}

.story-remove {
  position: absolute; top: -2px; right: -2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--text); color: #fff;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

/* Input row */
.input-row { display: flex; gap: 8px; margin-top: 10px; }
.input-row .form-input { flex: 1; }
.btn-add {
  flex-shrink: 0; padding: 13px 16px;
  background: var(--primary); color: #fff;
  border: none; border-radius: var(--radius);
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  transition: background 0.15s;
}
.btn-add:hover { background: var(--primary-mid); }
.btn-add:disabled { opacity: 0.4; cursor: default; }

/* Actions */
.ai-actions { display: flex; gap: 10px; margin-bottom: 24px; }
.btn-suggest { flex: 2; }
.btn-camera  { flex: 1; }

/* States */
.state-loading, .state-error { text-align: center; padding: 32px 20px; }
.state-loading p, .state-error p { color: var(--muted); margin-top: 12px; font-size: 15px; }
.state-error p { color: var(--danger); }
.state-error .btn-secondary { margin-top: 12px; }

/* Suggestions */
.section-title { font-size: 18px; font-weight: 800; margin-bottom: 14px; letter-spacing: -0.4px; }

.suggestion-list { display: flex; flex-direction: column; gap: 10px; }

.suggestion-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.suggestion-card:hover { border-color: var(--primary); box-shadow: 0 2px 12px rgba(26,122,70,0.1); }

.suggestion-name {
  font-size: 16px; font-weight: 700; letter-spacing: -0.3px;
  margin-bottom: 6px;
}
.suggestion-meta {
  display: flex; gap: 12px; font-size: 13px; color: var(--muted);
  margin-bottom: 8px; align-items: center;
}
.suggestion-meta span { display: flex; align-items: center; gap: 4px; font-weight: 500; }
.suggestion-ings { display: flex; flex-wrap: wrap; gap: 5px; }

.btn-save {
  flex-shrink: 0;
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px;
  background: var(--primary-light);
  color: var(--primary);
  border: none; border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  transition: background 0.15s;
}
.btn-save:hover { background: var(--primary); color: #fff; }
.btn-save:disabled { opacity: 0.5; cursor: default; }

/* Local matches */
.local-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.local-header .section-title { margin-bottom: 0; }
.btn-ask-ai {
  padding: 7px 14px; border-radius: 20px;
  background: var(--primary-light); color: var(--primary);
  border: 1px solid var(--primary); font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
}
.btn-ask-ai:hover { background: var(--primary); color: #fff; }
.btn-ask-ai:disabled { opacity: 0.4; cursor: default; }
.local-card { cursor: pointer; }
.local-card:hover { border-color: var(--primary); }
.local-badge { font-size: 11px; color: var(--primary); font-weight: 600; }

.match-badge {
  font-size: 11px; font-weight: 700;
  color: var(--primary); background: var(--primary-light);
  padding: 2px 8px; border-radius: 10px;
}

.tag-have {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid rgba(26,122,70,0.25);
}

.tag-missing {
  background: var(--surface2);
  color: var(--muted);
  border: 1px dashed var(--border);
  opacity: 0.8;
}

/* Tips */
.tips { margin-top: 24px; display: flex; flex-direction: column; gap: 8px; }
.tip-item {
  padding: 10px 16px;
  background: var(--surface2);
  border-radius: var(--radius);
  font-size: 14px; color: var(--muted);
  border-left: 3px solid var(--primary-light);
}

@media (max-width: 480px) {
  .ai-actions { flex-direction: column; }
}
</style>
