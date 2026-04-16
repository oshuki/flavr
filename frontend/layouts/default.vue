<template>
  <div>
    <nav class="nav">
      <img class="nav-logo" src="/flavr-logo-2.png" alt="Flavr">
      <div class="nav-actions">
        <NuxtLink to="/ai" class="nav-link">🤖 KI-Koch</NuxtLink>
        <NuxtLink to="/settings" class="nav-link">⚙️</NuxtLink>
        <button v-if="user" @click="logout" class="nav-btn">Abmelden</button>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/auth')
}

// Redirect to auth if not logged in
watch(user, (newUser) => {
  const route = useRoute()
  if (!newUser && route.path !== '/auth' && !route.path.startsWith('/auth/')) {
    navigateTo('/auth')
  }
}, { immediate: true })
</script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  height: 32px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-btn {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 14px;
}

.nav-btn:hover {
  color: var(--text);
}

main {
  min-height: calc(100vh - 64px);
}
</style>
