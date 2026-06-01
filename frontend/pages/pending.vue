<template>
  <div class="pending-page">
    <div class="pending-card">
      <img src="/flavr-logo-2.png" alt="flavr" class="pending-logo">
      <div class="pending-icon">⏳</div>
      <h1>Zugang beantragt</h1>
      <p>Dein Account wurde registriert. Der Administrator muss deinen Zugang noch freischalten.</p>
      <p class="pending-email">{{ user?.email }}</p>
      <button class="btn-signout" @click="signOut">Abmelden</button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const client = useSupabaseClient()
const user   = useSupabaseUser()

const signOut = async () => {
  await client.auth.signOut()
  navigateTo('/auth')
}
</script>

<style scoped>
.pending-page {
  min-height: 100dvh;
  display: flex; align-items: center; justify-content: center;
  padding: 24px; background: var(--bg);
}
.pending-card {
  width: 100%; max-width: 360px;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.pending-logo { height: 40px; margin-bottom: 8px; }
.pending-icon { font-size: 56px; }
h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
p  { font-size: 15px; color: var(--muted); line-height: 1.6; max-width: 300px; }
.pending-email {
  font-size: 14px; font-weight: 700;
  color: var(--text); background: var(--surface2);
  padding: 8px 16px; border-radius: var(--radius-sm);
}
.btn-signout {
  margin-top: 8px; padding: 12px 28px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius); font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 700; color: var(--muted);
  cursor: pointer; transition: background 0.15s;
}
.btn-signout:hover { background: var(--border); }
</style>
