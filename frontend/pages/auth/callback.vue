<template>
  <div class="callback-page">
    <div class="callback-card">
      <div class="spinner"></div>
      <p>Authentifizierung läuft...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const user = useSupabaseUser()

// Warte bis User-Session geladen ist
watch(user, async (newUser) => {
  if (newUser) {
    // User ist eingeloggt, leite zur Homepage weiter
    await navigateTo('/')
  }
}, { immediate: true })

// Fallback: Nach 3 Sekunden weiterleiten wenn noch kein User
setTimeout(() => {
  if (!user.value) {
    navigateTo('/auth')
  }
}, 3000)
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
}

.callback-card {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  color: var(--muted);
  font-size: 14px;
}
</style>
