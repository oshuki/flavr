<template>
  <div class="app-layout">
    <main class="main-content">
      <slot />
    </main>

    <nav class="bottom-nav">
      <NuxtLink to="/ai" class="nav-item">
        <span class="nav-icon">🤖</span>
        <span class="nav-label">KI-Koch</span>
      </NuxtLink>
      <NuxtLink to="/recipes" class="nav-item">
        <span class="nav-icon">📖</span>
        <span class="nav-label">Rezepte</span>
      </NuxtLink>
      <NuxtLink to="/settings" class="nav-item">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">Einstellungen</span>
      </NuxtLink>
    </nav>
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
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-bottom: 80px; /* Space for bottom nav */
  overflow-y: auto;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: white;
  border-top: 1px solid var(--border);
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--muted);
  transition: all 0.2s;
  min-width: 80px;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: var(--primary);
}

.nav-icon {
  font-size: 24px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
