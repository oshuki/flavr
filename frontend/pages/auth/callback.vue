<template>
  <div class="callback-page">
    <div class="callback-card">
      <div class="spinner"></div>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const client  = useSupabaseClient()
const message = ref('Authentifizierung läuft...')
const { loadProfile, isApproved } = useProfile()

onMounted(async () => {
  // With implicit flow, Supabase auto-detects the session from the URL hash.
  // We just wait briefly for it to settle, then check approval.
  await new Promise(resolve => setTimeout(resolve, 800))

  const { data: { session } } = await client.auth.getSession()

  if (!session?.user) {
    message.value = 'Login fehlgeschlagen – bitte erneut versuchen.'
    setTimeout(() => navigateTo('/auth'), 3000)
    return
  }

  message.value = 'Erfolgreich angemeldet! Weiterleitung...'

  if (session.user.email === 'oshuki@gmail.com') {
    await navigateTo('/')
    return
  }

  await loadProfile(session.user.id)
  await navigateTo(isApproved.value ? '/' : '/pending')
})
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
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  color: var(--muted);
  margin: 0;
}
</style>

