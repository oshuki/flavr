<script setup lang="ts">
// Redirect to AI page on client only
onMounted(() => {
  if (process.client) {
    navigateTo('/ai')
  }
})
</script>

<template>
  <div class="redirect-page">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.redirect-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color, #007bff);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
