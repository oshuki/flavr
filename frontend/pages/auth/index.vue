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

      <button @click="signInWithGoogle" class="btn-google">
        Mit Google anmelden
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

const signInWithGoogle = async () => {
  const { error: googleError } = await client.auth.signInWithOAuth({
    provider: 'google',
  })
  if (googleError) {
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
}

.auth-divider::before { left: 0; }
.auth-divider::after { right: 0; }

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
