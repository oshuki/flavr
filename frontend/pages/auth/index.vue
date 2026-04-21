<template>
  <div class="auth-page">
    <div class="auth-card card">
      <img src="/flavr-logo-2.png" alt="Flavr" class="auth-logo">
      
      <h2>{{ isSignUp ? 'Registrieren' : 'Willkommen zurück' }}</h2>
      <p class="auth-sub">
        {{ isSignUp ? 'Erstelle einen Account' : 'Melde dich an, um deine Rezepte zu sehen' }}
      </p>

      <div v-if="error" class="auth-error">{{ error }}</div>

      <form @submit.prevent="handleAuth">
        <div class="form-group">
          <label class="form-label">E-Mail</label>
          <input 
            v-model="email" 
            type="email" 
            class="form-input" 
            placeholder="du@beispiel.de"
            required
          >
        </div>

        <div class="form-group">
          <label class="form-label">Passwort</label>
          <input 
            v-model="password" 
            type="password" 
            class="form-input"
            placeholder="••••••••"
            required
          >
        </div>

        <button type="submit" class="btn-primary" style="width: 100%">
          {{ isSignUp ? 'Registrieren' : 'Anmelden' }}
        </button>
      </form>

      <div class="auth-divider">oder</div>

      <button @click="signInWithGoogle" class="btn-google" :disabled="loading">
        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loading ? 'Lädt...' : 'Mit Google anmelden' }}
      </button>

      <div class="auth-toggle">
        <span>{{ isSignUp ? 'Schon ein Konto?' : 'Noch kein Konto?' }}</span>
        <a @click="isSignUp = !isSignUp"> 
          {{ isSignUp ? 'Anmelden' : 'Registrieren' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const loading = ref(false)
const client = useSupabaseClient()
const user = useSupabaseUser()
const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const error = ref('')

// Wenn User bereits eingeloggt ist
onMounted(() => {
  if (user.value) {
    navigateTo('/')
  }
})

const handleAuth = async () => {
  error.value = ''
  
  try {
    if (isSignUp.value) {
      const { error: signUpError } = await client.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (signUpError) throw signUpError
      alert('Account erstellt! Bitte bestätige deine E-Mail.')
    } else {
      const { error: signInError } = await client.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (signInError) throw signInError
      navigateTo('/')
    }
  } catch (e: any) {
    error.value = e.message || 'Ein Fehler ist aufgetreten'
  }
}

coloading.value = true
  error.value = ''
  
  try {
    const { error: googleError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (googleError) {
      error.value = googleError.message
      loading.value = false
    }
    // Wird zu Google redirected, loading bleibt true
  } catch (e: any) {
    error.value = e.message || 'Google Login fehlgeschlagen'
    loading.value = fals
    error.value = googleError.message
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  max-width: 400px;
  width: 100%;
}

.auth-logo {
  display: block;
  margin: 0 auto 24px;
  height: 60px;
}

h2 {
  text-align: center;
  margin-bottom: 8px;
}

.auth-sub {
  text-align: center;
  color: var(--muted);
  margin-bottom: 24px;
}

.auth-error {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.auth-divider {
  text-align: center;
  color: var(--muted);
  margin: 20px 0;
  position: relative;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-google:hover:not(:disabled) {
  border-color: #4285F4;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  flex-shrink: 00; }

.btn-google {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-google:hover {
  border-color: var(--primary);
}

.auth-toggle {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.auth-toggle a {
  color: var(--primary);
  cursor: pointer;
  text-decoration: none;
}

.auth-toggle a:hover {
  text-decoration: underline;
}
</style>
