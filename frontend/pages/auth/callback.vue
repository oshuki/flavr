<template>
  <div class="callback-page">
    <div class="callback-card">
      <div class="spinner"></div>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const user = useSupabaseUser()
const message = ref('Authentifizierung läuft...')

// Warte auf User Session nach OAuth Code Exchange
watch(user, async (newUser) => {
  if (newUser) {
    message.value = 'Erfolgreich! Weiterleitung...'
    // User ist eingeloggt, leite zur Homepage weiter
    await navigateTo('/')
  }
}, { immediate: true })

// Fallback: Nach 5 Sekunden zur Auth-Seite wenn noch kein User
setTimeout(() => {
  if (!user.value) {
    message.value = 'Login fehlgeschlagen - weiterleitung...'
    setTimeout(() => {
      navigateTo('/auth')
    }, 1000)
  }
}, 5000)
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
