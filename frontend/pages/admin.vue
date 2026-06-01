<template>
  <div class="admin-page">
    <div class="admin-header">
      <button class="back-btn" @click="navigateTo('/settings')">← Zurück</button>
      <h1>Benutzerverwaltung</h1>
    </div>

    <div class="admin-body">
      <div v-if="loading" class="state-center">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="summary">
          <span class="num">{{ profiles.length }}</span> Accounts ·
          <span class="num approved">{{ profiles.filter(p => p.is_approved).length }}</span> freigegeben ·
          <span class="num pending">{{ profiles.filter(p => !p.is_approved).length }}</span> ausstehend
        </div>

        <!-- Pending first -->
        <div v-if="pending.length" class="group">
          <div class="group-label">⏳ Ausstehend</div>
          <div v-for="p in pending" :key="p.id" class="user-row">
            <div class="user-info">
              <div class="user-email">{{ p.email }}</div>
              <div class="user-meta">Registriert {{ formatDate(p.created_at) }}</div>
            </div>
            <button class="btn-approve" @click="approve(p.id)" :disabled="saving === p.id">
              {{ saving === p.id ? '…' : '✓ Freigeben' }}
            </button>
          </div>
        </div>

        <!-- Approved -->
        <div v-if="approved.length" class="group">
          <div class="group-label">✅ Freigegeben</div>
          <div v-for="p in approved" :key="p.id" class="user-row">
            <div class="user-info">
              <div class="user-email">
                {{ p.email }}
                <span v-if="p.is_admin" class="admin-badge">Admin</span>
              </div>
              <div class="user-meta">Registriert {{ formatDate(p.created_at) }}</div>
            </div>
            <button
              v-if="!p.is_admin"
              class="btn-revoke"
              @click="revoke(p.id)"
              :disabled="saving === p.id"
            >
              {{ saving === p.id ? '…' : 'Sperren' }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()

// Guard: only admin can see this page
onMounted(() => {
  if (user.value?.email !== 'oshuki@gmail.com') navigateTo('/')
})

const { allProfiles, setApproved } = useProfile()

const loading  = ref(true)
const saving   = ref<string | null>(null)
const profiles = ref<any[]>([])

const pending  = computed(() => profiles.value.filter(p => !p.is_approved))
const approved = computed(() => profiles.value.filter(p => p.is_approved))

const load = async () => {
  loading.value = true
  profiles.value = await allProfiles()
  loading.value = false
}

const approve = async (id: string) => {
  saving.value = id
  await setApproved(id, true)
  await load()
  saving.value = null
}

const revoke = async (id: string) => {
  if (!confirm('Zugang wirklich sperren?')) return
  saving.value = id
  await setApproved(id, false)
  await load()
  saving.value = null
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(load)
</script>

<style scoped>
.admin-page { min-height: 100dvh; background: var(--bg); padding-bottom: 40px; }

.admin-header {
  position: sticky; top: 0; z-index: 10;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: calc(env(safe-area-inset-top) + 12px) 16px 12px;
  display: flex; align-items: center; gap: 14px;
}
.admin-header h1 { font-size: 18px; font-weight: 800; }
.back-btn {
  background: var(--surface2); border: none; border-radius: 10px;
  padding: 8px 12px; font-size: 14px; font-weight: 600;
  color: var(--text-mid); cursor: pointer;
}

.admin-body { padding: 20px 16px; max-width: 680px; margin: 0 auto; }

.state-center { display: flex; justify-content: center; padding: 48px; }

.summary {
  font-size: 14px; color: var(--muted); margin-bottom: 20px;
  padding: 12px 16px; background: var(--surface2); border-radius: var(--radius);
}
.num { font-weight: 800; font-size: 16px; color: var(--text); }
.num.approved { color: var(--primary); }
.num.pending  { color: #D97706; }

.group { margin-bottom: 20px; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.group-label {
  padding: 10px 14px; background: var(--surface2);
  font-size: 12px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}
.user-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
  background: var(--bg);
}
.user-row:last-child { border-bottom: none; }

.user-email { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 2px; display: flex; align-items: center; gap: 8px; }
.user-meta  { font-size: 12px; color: var(--muted); }
.admin-badge {
  font-size: 10px; font-weight: 700; padding: 2px 7px;
  background: var(--primary-light); color: var(--primary);
  border-radius: 20px;
}

.btn-approve {
  flex-shrink: 0; padding: 8px 14px; border-radius: var(--radius-sm);
  background: var(--primary); color: #fff; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap; transition: opacity 0.15s;
}
.btn-approve:hover { opacity: 0.85; }
.btn-approve:disabled { opacity: 0.5; cursor: default; }

.btn-revoke {
  flex-shrink: 0; padding: 8px 14px; border-radius: var(--radius-sm);
  background: var(--surface2); border: 1px solid var(--border);
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  color: var(--muted); cursor: pointer; white-space: nowrap;
}
.btn-revoke:hover { border-color: #DC2626; color: #DC2626; background: #FEE2E2; }
.btn-revoke:disabled { opacity: 0.5; cursor: default; }
</style>
