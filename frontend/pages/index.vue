<script setup lang="ts">
// Redirect root to AI page (new default)
definePageMeta({
  middleware: () => {
    return navigateTo('/ai')
  }
})
</script>

<template>
  <div></div>
</template>
