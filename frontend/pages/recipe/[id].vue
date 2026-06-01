<template>
  <div class="detail-page">
    <div v-if="loading" class="state-loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!recipe" class="state-error">
      <p>Rezept nicht gefunden.</p>
      <button class="btn-primary" @click="navigateTo('/recipes')">Zur Übersicht</button>
    </div>

    <template v-else>
      <!-- Hero image -->
      <div class="detail-hero">
        <img v-if="recipe.imageUrl && !heroImageError" :src="recipe.imageUrl" :alt="recipe.title" class="hero-img" @error="heroImageError = true">
        <div v-else class="hero-placeholder">
          <span class="hero-emoji">{{ emoji[recipe.category] || '🍽️' }}</span>
        </div>

        <!-- Overlay gradient -->
        <div class="hero-gradient"></div>

        <!-- Back button -->
        <button class="hero-back" @click="navigateTo('/recipes')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>

        <!-- Fav button -->
        <button class="hero-fav" :class="{ active: recipe.isFavorite }" @click="toggleFavorite(recipe.id)">
          <svg width="18" height="18" viewBox="0 0 24 24" :fill="recipe.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <!-- Pull-up content card -->
      <div class="detail-card">
        <!-- Title & meta -->
        <h1 class="detail-title">{{ recipe.title }}</h1>

        <div class="detail-meta">
          <div v-if="recipe.duration" class="meta-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {{ recipe.duration }} Min.
          </div>
          <div v-if="recipe.servings" class="meta-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            {{ recipe.servings }} Pers.
          </div>
          <div class="meta-pill meta-pill--accent">{{ recipe.category }}</div>
        </div>

        <!-- Tags -->
        <div v-if="recipe.tags?.length" class="detail-tags">
          <span v-for="tag in recipe.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <!-- Bring! button -->
        <ClientOnly>
          <button v-if="bringConnected && selectedList" class="btn-bring" @click="exportToBring" :disabled="exportingToBring">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {{ exportingToBring ? 'Exportiere…' : 'Zu Bring! hinzufügen' }}
          </button>
        </ClientOnly>

        <!-- Divider -->
        <div class="section-divider"></div>

        <!-- Ingredients -->
        <section class="content-section">
          <div class="section-heading-row">
            <h2 class="section-heading">Zutaten</h2>
            <div class="serving-control">
              <button class="serving-btn" @click="servings = Math.max(1, servings - 1)">−</button>
              <span class="serving-count">{{ servings }} Pers.</span>
              <button class="serving-btn" @click="servings++">+</button>
            </div>
          </div>
          <ul class="ingredient-list">
            <li v-for="(ing, i) in scaledIngredients" :key="i" class="ingredient-item">
              <div class="ingredient-dot"></div>
              <span>{{ ing }}</span>
            </li>
          </ul>
        </section>

        <div class="section-divider"></div>

        <!-- Steps -->
        <section class="content-section">
          <h2 class="section-heading">Zubereitung</h2>
          <ol class="steps-list">
            <li v-for="(step, i) in recipe.steps" :key="i" class="step-item">
              <div class="step-num">{{ i + 1 }}</div>
              <p class="step-text">{{ step }}</p>
            </li>
          </ol>
        </section>

        <!-- Notes -->
        <div v-if="recipe.notes" class="section-divider"></div>
        <section v-if="recipe.notes" class="content-section">
          <h2 class="section-heading">Notizen</h2>
          <p class="notes-text">{{ recipe.notes }}</p>
        </section>

        <!-- Source -->
        <p v-if="recipe.sourceApp" class="source-info">Importiert aus: {{ recipe.sourceApp }}</p>

        <!-- Similar recipes -->
        <template v-if="similarRecipes.length">
          <div class="section-divider"></div>
          <section class="content-section">
            <h2 class="section-heading">Ähnliche Rezepte</h2>
            <div class="similar-grid">
              <div
                v-for="r in similarRecipes"
                :key="r.id"
                class="similar-card"
                @click="navigateTo(`/recipe/${r.id}`)"
              >
                <div class="similar-img">
                  <img v-if="r.imageUrl" :src="r.imageUrl" :alt="r.title" @error="(e) => (e.target as HTMLImageElement).style.display='none'">
                  <span v-else class="similar-emoji">{{ emoji[r.category] || '🍽️' }}</span>
                </div>
                <div class="similar-body">
                  <p class="similar-title">{{ r.title }}</p>
                  <p class="similar-meta">{{ r.duration ? r.duration + ' Min.' : '' }}{{ r.duration && r.servings ? ' · ' : '' }}{{ r.servings ? r.servings + ' Pers.' : '' }}</p>
                </div>
              </div>
            </div>
          </section>
        </template>

        <!-- Actions -->
        <div class="detail-actions">
          <button class="btn-secondary" @click="editRecipe">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Bearbeiten
          </button>
          <button v-if="recipe.sourceApp !== 'KI-Koch'" class="btn-secondary" @click="duplicateRecipe">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Duplizieren
          </button>
          <button class="btn-secondary btn-danger" @click="confirmDelete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Löschen
          </button>
        </div>
      </div>
    </template>

    <!-- Delete modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <h3>Rezept löschen?</h3>
        <p>„{{ recipe?.title }}" wird unwiderruflich gelöscht.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">Abbrechen</button>
          <button class="btn-primary btn-danger" @click="handleDelete">Löschen</button>
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
const { isConnected: bringConnected, selectedList, bringAddItems, loadBringData } = useBring()

const loading          = ref(true)
const showDeleteModal  = ref(false)
const exportingToBring = ref(false)
const heroImageError   = ref(false)

const recipe = computed(() => recipes.value.find(r => r.id === route.params.id))

const servings = ref(1)
watch(recipe, r => { if (r?.servings) servings.value = r.servings }, { immediate: true })

const similarRecipes = computed(() => {
  if (!recipe.value) return []
  return recipes.value
    .filter(r => r.id !== recipe.value!.id && r.category === recipe.value!.category)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
})

const scaledIngredients = computed(() => {
  if (!recipe.value) return []
  const base = recipe.value.servings || 1
  const factor = servings.value / base
  if (factor === 1) return recipe.value.ingredients
  return recipe.value.ingredients.map(ing => {
    return ing.replace(/(\d+([.,]\d+)?)/g, (_, num) => {
      const scaled = parseFloat(num.replace(',', '.')) * factor
      const rounded = Math.round(scaled * 10) / 10
      return rounded % 1 === 0 ? String(rounded) : String(rounded).replace('.', ',')
    })
  })
})

const editRecipe = () => navigateTo(`/recipe/edit/${route.params.id}`)

const duplicateRecipe = () => {
  if (!recipe.value) return
  const { saveRecipe } = useRecipes()
  saveRecipe({ ...recipe.value, id: crypto.randomUUID(), title: `${recipe.value.title} (Kopie)`, createdAt: Date.now() })
  navigateTo('/')
}

const confirmDelete = () => { showDeleteModal.value = true }
const handleDelete  = async () => {
  if (!recipe.value) return
  await deleteRecipe(recipe.value.id)
  navigateTo('/recipes')
}

const exportToBring = async () => {
  if (!recipe.value) return
  exportingToBring.value = true
  try {
    const items = recipe.value.ingredients.map(ing => {
      const m = ing.match(/^([\d.]+\s*[a-zA-Z]*)\s+(.+)$/)
      return m ? { name: m[2], spec: m[1] } : { name: ing, spec: '' }
    })
    const result = await bringAddItems(items)
    if (result.success) alert(`✅ ${items.length} Zutaten zu „${selectedList.value?.name}" hinzugefügt!`)
    else throw new Error(result.error)
  } catch (e: any) {
    alert('❌ ' + e.message)
  } finally { exportingToBring.value = false }
}

const handleKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') navigateTo('/recipes') }

onMounted(async () => {
  if (!recipes.value.length) await loadRecipes()
  loading.value = false
  loadBringData()
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.detail-page { background: var(--bg); min-height: 100dvh; }

/* States */
.state-loading, .state-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }

/* Hero */
.detail-hero {
  position: relative; width: 100%;
  height: min(320px, 42vw);
  min-height: 220px;
  background: var(--surface2); overflow: hidden;
}
.hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: var(--primary-light);
}
.hero-emoji { font-size: 72px; opacity: 0.6; }

.hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%);
  pointer-events: none;
}

.hero-back, .hero-fav {
  position: absolute; top: calc(env(safe-area-inset-top) + 12px);
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.hero-back { left: 16px; }
.hero-fav  { right: 16px; }
.hero-fav.active { background: #DC2626; }
.hero-back:hover, .hero-fav:hover { background: rgba(0,0,0,0.55); }

/* Pull-up card */
.detail-card {
  background: var(--bg);
  border-radius: 24px 24px 0 0;
  margin-top: -22px;
  position: relative; z-index: 2;
  padding: 22px 20px 40px;
  min-height: 60vh;
}

.detail-title {
  font-size: 26px; font-weight: 800;
  letter-spacing: -0.8px; line-height: 1.2;
  margin-bottom: 12px;
}

.detail-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.meta-pill {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: var(--radius-sm);
  background: var(--surface2);
  font-size: 13px; font-weight: 600; color: var(--muted);
}
.meta-pill--accent { background: var(--primary-light); color: var(--primary); }

.detail-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }

/* Bring */
.btn-bring {
  width: 100%; margin-bottom: 16px;
  padding: 14px; background: #FEDB00; color: #1C1C1C;
  border: none; border-radius: var(--radius);
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.15s;
}
.btn-bring:hover { opacity: 0.88; }
.btn-bring:disabled { opacity: 0.5; cursor: default; }

/* Divider */
.section-divider { height: 1px; background: var(--border); margin: 20px 0; }

/* Content sections */
.section-heading {
  font-size: 18px; font-weight: 800;
  letter-spacing: -0.4px; margin-bottom: 14px;
}

.section-heading-row {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
}
.section-heading-row .section-heading { margin-bottom: 0; }

.serving-control {
  display: flex; align-items: center; gap: 10px;
  background: var(--surface2); border-radius: var(--radius-sm); padding: 4px 6px;
}
.serving-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--bg); border: 1px solid var(--border);
  font-size: 16px; font-weight: 700; color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.serving-btn:hover { background: var(--primary-light); }
.serving-count { font-size: 13px; font-weight: 700; color: var(--text); min-width: 52px; text-align: center; }

/* Ingredients */
.ingredient-list { list-style: none; padding: 0; }
.ingredient-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--border);
  font-size: 15px;
}
.ingredient-item:last-child { border-bottom: none; }
.ingredient-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--primary); flex-shrink: 0;
}

/* Steps */
.steps-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.step-item {
  display: flex; gap: 14px;
  padding: 14px; background: var(--surface);
  border-radius: var(--radius); border: 1px solid var(--border);
}
.step-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; flex-shrink: 0;
}
.step-text { font-size: 14px; line-height: 1.65; color: var(--text-mid); padding-top: 3px; }

.notes-text { font-size: 14px; line-height: 1.7; color: var(--text-mid); white-space: pre-wrap; }

.source-info { font-size: 13px; color: var(--muted); font-style: italic; margin-top: 8px; }

/* Actions */
.detail-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
.detail-actions button { flex: 1; min-width: 120px; }

/* Similar recipes */
.similar-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
.similar-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius);
  border: 1px solid var(--border); background: var(--surface);
  cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s;
}
.similar-card:hover { border-color: var(--primary); box-shadow: 0 2px 10px rgba(26,122,70,0.1); }
.similar-img {
  width: 52px; height: 52px; border-radius: 10px;
  overflow: hidden; flex-shrink: 0;
  background: var(--surface2);
  display: flex; align-items: center; justify-content: center;
}
.similar-img img { width: 100%; height: 100%; object-fit: cover; }
.similar-emoji { font-size: 24px; }
.similar-body { min-width: 0; }
.similar-title {
  font-size: 13px; font-weight: 700; color: var(--text);
  line-height: 1.3; margin-bottom: 3px;
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.similar-meta { font-size: 11px; color: var(--muted); font-weight: 500; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 20px;
}
.modal {
  background: #fff; padding: 28px;
  border-radius: var(--radius-lg); max-width: 380px; width: 100%;
}
.modal h3 { margin-bottom: 8px; font-size: 18px; font-weight: 800; }
.modal p  { color: var(--muted); font-size: 14px; margin-bottom: 20px; line-height: 1.6; }
.modal-actions { display: flex; gap: 10px; }
.modal-actions button { flex: 1; }
</style>
