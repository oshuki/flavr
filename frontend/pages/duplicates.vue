<template>
  <div class="dup-page">
    <div class="dup-header">
      <button class="back-btn" @click="navigateTo('/settings')">← Zurück</button>
      <h1>Duplikat-Scanner</h1>
    </div>

    <div class="dup-body">
      <div v-if="loading" class="state-center">
        <div class="spinner"></div>
        <p>Scanne {{ total }} Rezepte…</p>
      </div>

      <div v-else-if="!scanned" class="state-center">
        <p class="info">Analysiert alle deine Rezepte auf doppelte oder sehr ähnliche Titel.</p>
        <button class="btn-primary" @click="scan">Scan starten</button>
      </div>

      <template v-else>
        <div class="summary">
          <span class="summary-num">{{ total }}</span> Rezepte gescannt –
          <span class="summary-num dup">{{ groups.length }}</span> Duplikat-Gruppen gefunden
          <span v-if="deleted > 0" class="deleted-info"> · {{ deleted }} gelöscht</span>
        </div>

        <div v-if="groups.length === 0" class="state-center">
          <p>✅ Keine Duplikate gefunden!</p>
        </div>

        <div v-for="(group, gi) in groups" :key="gi" class="dup-group">
          <div class="group-label">Gruppe {{ gi + 1 }} – {{ group.length }} ähnliche Rezepte</div>
          <div
            v-for="r in group"
            :key="r.id"
            class="dup-row"
            :class="{ 'marked': markedForDelete.has(r.id) }"
          >
            <div class="dup-info">
              <div class="dup-title">{{ r.title }}</div>
              <div class="dup-meta">{{ r.created_at?.slice(0, 10) }} · {{ r.ingredients?.length || 0 }} Zutaten · {{ r.steps?.length || 0 }} Schritte</div>
            </div>
            <div class="dup-actions">
              <button class="btn-view" @click="navigateTo(`/recipe/${r.id}`)">Ansehen</button>
              <button
                class="btn-mark"
                :class="{ active: markedForDelete.has(r.id) }"
                @click="toggleMark(r.id)"
              >
                {{ markedForDelete.has(r.id) ? '✓ Markiert' : 'Löschen' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="markedForDelete.size > 0" class="delete-bar">
          <span>{{ markedForDelete.size }} Rezept(e) zum Löschen markiert</span>
          <button class="btn-danger-confirm" @click="deleteMarked" :disabled="deleting">
            {{ deleting ? 'Lösche…' : 'Jetzt löschen' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { recipes, loadRecipes, deleteRecipe } = useRecipes()

const loading  = ref(false)
const scanned  = ref(false)
const deleting = ref(false)
const deleted  = ref(0)
const groups   = ref<any[][]>([])
const total    = ref(0)
const markedForDelete = ref<Set<string>>(new Set())

function normalize(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9äöüß]/g, ' ').replace(/\s+/g, ' ').trim()
}

function similarity(a: string, b: string) {
  const wordsA = new Set(a.split(' ').filter(w => w.length > 2))
  const wordsB = new Set(b.split(' ').filter(w => w.length > 2))
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length
  const union = new Set([...wordsA, ...wordsB]).size
  return union === 0 ? 0 : intersection / union
}

const scan = async () => {
  loading.value = true
  if (!recipes.value.length) await loadRecipes()
  const data = recipes.value
  total.value = data.length

  const result: any[][] = []
  const matched = new Set<number>()

  for (let i = 0; i < data.length; i++) {
    if (matched.has(i)) continue
    const group = [data[i]]
    const na = normalize(data[i].title)
    for (let j = i + 1; j < data.length; j++) {
      if (matched.has(j)) continue
      const nb = normalize(data[j].title)
      if (similarity(na, nb) >= 0.6) {
        group.push(data[j])
        matched.add(j)
      }
    }
    if (group.length > 1) {
      matched.add(i)
      result.push(group)
    }
  }

  groups.value = result
  loading.value = false
  scanned.value = true
}

const toggleMark = (id: string) => {
  const s = new Set(markedForDelete.value)
  s.has(id) ? s.delete(id) : s.add(id)
  markedForDelete.value = s
}

const deleteMarked = async () => {
  if (!confirm(`${markedForDelete.value.size} Rezepte wirklich löschen?`)) return
  deleting.value = true
  for (const id of markedForDelete.value) {
    await deleteRecipe(id)
    deleted.value++
  }
  markedForDelete.value = new Set()
  deleting.value = false
  // Re-scan nach dem Löschen
  scanned.value = false
  groups.value = []
  await scan()
}
</script>

<style scoped>
.dup-page { min-height: 100dvh; background: var(--bg); padding-bottom: 100px; }

.dup-header {
  position: sticky; top: 0; z-index: 10;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: calc(env(safe-area-inset-top) + 12px) 16px 12px;
  display: flex; align-items: center; gap: 14px;
}
.dup-header h1 { font-size: 18px; font-weight: 800; }
.back-btn {
  background: var(--surface2); border: none; border-radius: 10px;
  padding: 8px 12px; font-size: 14px; font-weight: 600;
  color: var(--text-mid); cursor: pointer;
}

.dup-body { padding: 20px 16px; max-width: 680px; margin: 0 auto; }

.state-center {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 48px 20px; text-align: center; color: var(--muted);
}
.info { font-size: 15px; color: var(--muted); max-width: 360px; line-height: 1.6; }

.summary {
  font-size: 15px; color: var(--muted); margin-bottom: 20px;
  padding: 12px 16px; background: var(--surface2); border-radius: var(--radius);
}
.summary-num { font-weight: 800; color: var(--text); font-size: 17px; }
.summary-num.dup { color: var(--danger, #DC2626); }
.deleted-info { color: var(--primary); font-weight: 600; }

.dup-group {
  margin-bottom: 20px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg); overflow: hidden;
}
.group-label {
  padding: 10px 14px;
  background: var(--surface2);
  font-size: 12px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}
.dup-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  background: var(--bg); transition: background 0.15s;
}
.dup-row:last-child { border-bottom: none; }
.dup-row.marked { background: #FEF2F2; }

.dup-info { min-width: 0; }
.dup-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
.dup-meta { font-size: 12px; color: var(--muted); }

.dup-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-view {
  padding: 6px 12px; border-radius: var(--radius-sm);
  background: var(--surface2); border: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--text-mid);
  cursor: pointer;
}
.btn-mark {
  padding: 6px 12px; border-radius: var(--radius-sm);
  background: var(--surface2); border: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--muted);
  cursor: pointer; transition: all 0.15s;
}
.btn-mark.active {
  background: #FEE2E2; border-color: #DC2626; color: #DC2626;
}

.delete-bar {
  position: fixed; bottom: calc(env(safe-area-inset-bottom) + 76px); left: 0; right: 0;
  background: #1C1C1C; color: #fff;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; gap: 16px; z-index: 100;
}
.delete-bar span { font-size: 14px; font-weight: 600; }
.btn-danger-confirm {
  padding: 10px 20px; border-radius: var(--radius-sm);
  background: #DC2626; color: #fff; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer;
}
.btn-danger-confirm:disabled { opacity: 0.5; cursor: default; }
</style>
