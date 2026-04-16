<script setup lang="ts">
// Redirect to edit page with 'new' ID
definePageMeta({
  middleware: () => {
    return navigateTo('/recipe/new/edit')
  }
})
</script>
