<template>
  <div class="planner-page">
    <!-- Header -->
    <div class="planner-header">
      <button class="week-nav" @click="prevWeek">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="week-info">
        <span class="week-label">KW {{ getKW(weekStart) }}</span>
        <span class="week-dates">{{ formatWeekRange(weekStart) }}</span>
      </div>
      <button class="week-nav" @click="nextWeek">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-loading">
      <div class="spinner"></div>
    </div>

    <!-- Week grid -->
    <div v-else class="week-grid">
      <div v-for="(day, i) in DAYS" :key="day" class="day-col">
        <div class="day-label" :class="{ today: isToday(weekStart, i) }">
          {{ DAY_LABELS[i] }}
          <span class="day-date">{{ getDayDate(weekStart, i) }}</span>
        </div>

        <!-- Frühstück -->
        <div class="meal-slot">
          <div class="slot-label">🌅</div>
          <div
            v-if="plan.meals[day]?.breakfast"
            class="meal-card"
            @click="openMealOptions(day, 'breakfast')"
          >
            <span class="meal-emoji">{{ emoji[getRecipe(plan.meals[day].breakfast!)?.category || ''] || '🍽️' }}</span>
            <p class="meal-title">{{ getRecipe(plan.meals[day].breakfast!)?.title }}</p>
          </div>
          <button v-else class="slot-add" @click="openPicker(day, 'breakfast')">+</button>
        </div>

        <!-- Abendessen -->
        <div class="meal-slot">
          <div class="slot-label">🌙</div>
          <div
            v-if="plan.meals[day]?.dinner"
            class="meal-card"
            @click="openMealOptions(day, 'dinner')"
          >
            <span class="meal-emoji">{{ emoji[getRecipe(plan.meals[day].dinner!)?.category || ''] || '🍽️' }}</span>
            <p class="meal-title">{{ getRecipe(plan.meals[day].dinner!)?.title }}</p>
          </div>
          <button v-else class="slot-add" @click="openPicker(day, 'dinner')">+</button>
        </div>
      </div>
    </div>

    <!-- Recipe Picker Bottom Sheet -->
    <Transition name="sheet">
      <div v-if="pickerOpen" class="sheet-overlay" @click="closePicker">
        <div class="sheet" @click.stop>
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">Rezept wählen</h3>
          <input
            v-model="pickerSearch"
            type="search"
            class="sheet-search"
            placeholder="Suchen…"
            autofocus
          >
          <div class="sheet-list">
            <div
              v-for="r in filteredPickerRecipes"
              :key="r.id"
              class="sheet-item"
              @click="selectRecipe(r.id)"
            >
              <span class="sheet-emoji">{{ emoji[r.category] || '🍽️' }}</span>
              <div class="sheet-item-info">
                <p class="sheet-item-title">{{ r.title }}</p>
                <p class="sheet-item-meta">{{ r.category }}{{ r.duration ? ' · ' + r.duration + ' Min.' : '' }}</p>
              </div>
            </div>
            <p v-if="!filteredPickerRecipes.length" class="sheet-empty">Keine Rezepte gefunden</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Meal Options Modal -->
    <Transition name="sheet">
      <div v-if="mealOptions" class="sheet-overlay" @click="mealOptions = null">
        <div class="sheet sheet-small" @click.stop>
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">{{ getRecipe(getMealId(mealOptions.day, mealOptions.slot))?.title }}</h3>
          <div class="meal-option-btns">
            <button class="btn-secondary" @click="viewRecipe(mealOptions!)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Rezept öffnen
            </button>
            <button class="btn-secondary" @click="replaceMeal(mealOptions!)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Ersetzen
            </button>
            <button class="btn-secondary btn-danger" @click="removeMeal(mealOptions!)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              Entfernen
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { MealPlanDay } from '~/types'

type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type Slot = keyof MealPlanDay

const { recipes, loadRecipes } = useRecipes()
const { emoji } = useCategories()
const { weekStart, plan, loading, DAYS, loadPlan, saveMeal, prevWeek, nextWeek, getKW } = useMealPlan()

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const pickerOpen    = ref(false)
const pickerSearch  = ref('')
const pickerTarget  = ref<{ day: Day; slot: Slot } | null>(null)
const mealOptions   = ref<{ day: Day; slot: Slot } | null>(null)

const getRecipe = (id: string | undefined) => {
  if (!id) return null
  return recipes.value.find(r => r.id === id) || null
}

const getMealId = (day: Day, slot: Slot) => plan.value.meals[day]?.[slot]

const formatWeekRange = (monday: string) => {
  const start = new Date(monday)
  const end   = new Date(monday)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.`
  return `${fmt(start)} – ${fmt(end)}`
}

const getDayDate = (monday: string, offset: number) => {
  const d = new Date(monday)
  d.setDate(d.getDate() + offset)
  return `${d.getDate()}.${d.getMonth() + 1}.`
}

const isToday = (monday: string, offset: number) => {
  const d = new Date(monday)
  d.setDate(d.getDate() + offset)
  const t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

const filteredPickerRecipes = computed(() => {
  const q = pickerSearch.value.toLowerCase()
  return recipes.value.filter(r =>
    !q || r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  )
})

const openPicker = (day: Day, slot: Slot) => {
  pickerTarget.value = { day, slot }
  pickerSearch.value = ''
  pickerOpen.value = true
}

const closePicker = () => {
  pickerOpen.value = false
  pickerTarget.value = null
}

const selectRecipe = async (id: string) => {
  if (!pickerTarget.value) return
  await saveMeal(pickerTarget.value.day, pickerTarget.value.slot, id)
  closePicker()
}

const openMealOptions = (day: Day, slot: Slot) => {
  mealOptions.value = { day, slot }
}

const viewRecipe = (opts: { day: Day; slot: Slot }) => {
  const id = getMealId(opts.day, opts.slot)
  mealOptions.value = null
  if (id) navigateTo(`/recipe/${id}`)
}

const replaceMeal = (opts: { day: Day; slot: Slot }) => {
  mealOptions.value = null
  openPicker(opts.day, opts.slot)
}

const removeMeal = async (opts: { day: Day; slot: Slot }) => {
  mealOptions.value = null
  await saveMeal(opts.day, opts.slot, null)
}

onMounted(async () => {
  if (!recipes.value.length) await loadRecipes()
  await loadPlan(weekStart.value)
})
</script>

<style scoped>
.planner-page {
  min-height: 100dvh;
  background: var(--bg);
  padding-bottom: 80px;
}

/* Header */
.planner-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  display: flex; align-items: center; justify-content: space-between;
}

.week-nav {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--surface2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-mid);
  transition: background 0.15s, border-color 0.15s;
}
.week-nav:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

.week-info { text-align: center; }
.week-label { display: block; font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
.week-dates { font-size: 12px; color: var(--muted); font-weight: 500; }

/* Loading */
.state-loading { display: flex; justify-content: center; padding: 60px; }

/* Week grid — horizontal scroll on mobile */
.week-grid {
  display: flex;
  gap: 0;
  overflow-x: auto;
  padding: 12px 8px 12px;
  scrollbar-width: none;
}
.week-grid::-webkit-scrollbar { display: none; }

.day-col {
  flex: 0 0 calc((100vw - 32px) / 3.5);
  min-width: 88px;
  max-width: 140px;
  display: flex; flex-direction: column; gap: 8px;
  padding: 0 4px;
}

.day-label {
  font-size: 11px; font-weight: 700; color: var(--muted);
  text-align: center; padding: 4px 0; text-transform: uppercase;
  letter-spacing: 0.5px;
}
.day-label.today { color: var(--primary); }
.day-date { display: block; font-size: 10px; font-weight: 500; color: var(--muted-light); text-transform: none; letter-spacing: 0; }

/* Meal slot */
.meal-slot {
  display: flex; flex-direction: column; gap: 4px; align-items: center;
}

.slot-label { font-size: 16px; line-height: 1; }

.meal-card {
  width: 100%; min-height: 72px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 8px 6px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  cursor: pointer; text-align: center;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.meal-card:hover { border-color: var(--primary); box-shadow: 0 2px 8px rgba(26,122,70,0.1); }

.meal-emoji { font-size: 22px; line-height: 1; }
.meal-title {
  font-size: 10px; font-weight: 700; color: var(--text);
  line-height: 1.3;
  overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

.slot-add {
  width: 100%; min-height: 72px;
  background: var(--surface2);
  border: 1.5px dashed var(--border);
  border-radius: var(--radius);
  font-size: 20px; color: var(--muted-light);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.slot-add:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

/* Bottom Sheet */
.sheet-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex; align-items: flex-end;
}

.sheet {
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 16px 20px calc(20px + env(safe-area-inset-bottom));
  width: 100%; max-height: 75dvh;
  display: flex; flex-direction: column;
}

.sheet-small { max-height: 50dvh; }

.sheet-handle {
  width: 40px; height: 4px; border-radius: 2px;
  background: var(--border); margin: 0 auto 16px;
}

.sheet-title {
  font-size: 17px; font-weight: 800; margin-bottom: 14px;
  letter-spacing: -0.3px;
}

.sheet-search {
  width: 100%; box-sizing: border-box;
  padding: 10px 14px; border: 1.5px solid var(--border);
  border-radius: var(--radius); background: var(--surface2);
  font-family: 'DM Sans', sans-serif; font-size: 14px;
  color: var(--text); outline: none; margin-bottom: 12px;
  transition: border-color 0.15s;
}
.sheet-search:focus { border-color: var(--primary); }

.sheet-list {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 4px;
}

.sheet-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: var(--radius);
  cursor: pointer; transition: background 0.1s;
}
.sheet-item:hover { background: var(--surface2); }

.sheet-emoji { font-size: 24px; flex-shrink: 0; }
.sheet-item-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 1px; }
.sheet-item-meta  { font-size: 12px; color: var(--muted); font-weight: 500; }

.sheet-empty { padding: 20px; text-align: center; color: var(--muted); font-size: 14px; }

.meal-option-btns {
  display: flex; flex-direction: column; gap: 8px;
}
.meal-option-btns button { width: 100%; justify-content: center; display: flex; align-items: center; gap: 8px; }

/* Transitions */
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.2s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform 0.25s cubic-bezier(0.32,0.72,0,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
