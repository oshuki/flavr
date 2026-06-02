<template>
  <div class="app-layout">
    <main class="main-content">
      <slot />
    </main>

    <nav class="bottom-nav">
      <NuxtLink to="/ai" class="nav-item">
        <div class="nav-icon-wrap">
          <!-- Sparkles icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            <path d="M20 3v4"/><path d="M22 5h-4"/>
            <path d="M4 17v2"/><path d="M5 18H3"/>
          </svg>
        </div>
        <span class="nav-label">KI-Koch</span>
      </NuxtLink>

      <NuxtLink to="/recipes" class="nav-item">
        <div class="nav-icon-wrap">
          <!-- BookOpen icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <span class="nav-label">Rezepte</span>
      </NuxtLink>

      <NuxtLink to="/planner" class="nav-item">
        <div class="nav-icon-wrap">
          <!-- Calendar icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <span class="nav-label">Planer</span>
      </NuxtLink>

      <NuxtLink to="/settings" class="nav-item">
        <div class="nav-icon-wrap">
          <!-- Settings icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <span class="nav-label">Einstellungen</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

onMounted(() => {
  if (process.client) {
    watch(user, (newUser) => {
      const route = useRoute()
      if (!newUser && route.path !== '/auth' && !route.path.startsWith('/auth/')) {
        navigateTo('/auth')
      }
    }, { immediate: true })
  }
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.main-content {
  flex: 1;
  padding-bottom: calc(72px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

/* ── Bottom Navigation ── */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-top: 1px solid var(--border);
  padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -1px 12px rgba(0,0,0,0.05);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 0;
  text-decoration: none;
  color: var(--muted);
  position: relative;
  transition: color 0.15s;
}

/* Active indicator — line on top */
.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: var(--primary);
  border-radius: 99px;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: var(--primary);
}

.nav-icon-wrap {
  width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Thicker stroke for active state */
.nav-item.router-link-active .nav-icon-wrap svg {
  stroke-width: 2.25;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
}

.nav-item.router-link-active .nav-label {
  font-weight: 700;
}
</style>
