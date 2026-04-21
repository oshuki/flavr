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

const client = useSupabaseClient()
const user = useSupabaseUser()
const message = ref('Authentifizierung läuft...')
const route = useRoute()

// Process OAuth callback
onMounted(async () => {
  try {
    // Get code and state from URL
    const code = route.query.code as string
    
    if (!code) {
      console.error('No code in callback URL')
      message.value = 'Fehler: Kein Code erhalten'
      setTimeout(() => navigateTo('/auth'), 2000)
      return
    }

    console.log('Processing OAuth callback with code:', code.substring(0, 10) + '...')
    
    // Exchange code for session
    const { data, error } = await client.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth error:', error)
      message.value = `Login fehlgeschlagen: ${error.message}`
      setTimeout(() => navigateTo('/auth'), 3000)
      return
    }
    
    if (data?.session) {
      console.log('Session created successfully')
      message.value = 'Erfolgreich angemeldet! Weiterleitung...'
      await navigateTo('/')
    } else {
      console.error('No session after code exchange')
      message.value = 'Login fehlgeschlagen - keine Session'
      setTimeout(() => navigateTo('/auth'), 3000)
    }
  } catch (e: any) {
    console.error('Callback error:', e)
    message.value = `Fehler: ${e.message}`
    setTimeout(() => navigateTo('/auth'), 3000)
  }
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

