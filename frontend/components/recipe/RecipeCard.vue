<template>
  <div class="recipe-card" @click="$emit('click')">
    <!-- Image area -->
    <div class="recipe-image">
      <img v-if="recipe.imageUrl && !imageError" :src="recipe.imageUrl" :alt="recipe.title" loading="lazy" @error="imageError = true">
      <div v-else class="recipe-image-placeholder">
        <span class="placeholder-emoji">{{ emoji[recipe.category] || '🍽️' }}</span>
      </div>

      <!-- Favourite button -->
      <button
        class="fav-btn"
        @click.stop="$emit('toggle-fav')"
        :class="{ active: recipe.isFavorite }"
        :aria-label="recipe.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" :fill="recipe.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>

    <!-- Card body -->
    <div class="recipe-body">
      <h3 class="recipe-title">{{ recipe.title }}</h3>
      <div class="recipe-meta">
        <span v-if="recipe.duration" class="meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {{ recipe.duration }} Min.
        </span>
        <span v-if="recipe.servings" class="meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {{ recipe.servings }} Pers.
        </span>
      </div>
      <div v-if="recipe.tags?.length" class="recipe-tags">
        <span v-for="tag in recipe.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
        <span v-if="recipe.tags.length > 2" class="tag tag-more">+{{ recipe.tags.length - 2 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Recipe } from '~/types'

defineProps<{ recipe: Recipe }>()
defineEmits<{ (e: 'click'): void; (e: 'toggle-fav'): void }>()

const { emoji } = useCategories()
const imageError = ref(false)
</script>

<style scoped>
.recipe-card {
  background: var(--card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: box-shadow 0.2s, transform 0.2s;
}
.recipe-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}
.recipe-card:active { transform: scale(0.98); }

/* Image */
.recipe-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface2);
}
.recipe-image img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.recipe-card:hover .recipe-image img { transform: scale(1.04); }

.recipe-image-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2);
}
.placeholder-emoji { font-size: 36px; opacity: 0.6; }

/* Fav button */
.fav-btn {
  position: absolute; top: 10px; right: 10px;
  width: 34px; height: 34px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--muted-light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: color 0.15s, transform 0.15s;
}
.fav-btn:hover { transform: scale(1.1); }
.fav-btn.active { color: #E53E3E; }

/* Body */
.recipe-body { padding: 12px 14px 14px; }

.recipe-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 7px;
  color: var(--text);
  letter-spacing: -0.2px;
}

.recipe-meta {
  display: flex; gap: 10px;
  font-size: 12px; color: var(--muted);
  margin-bottom: 8px;
}
.meta-item {
  display: flex; align-items: center; gap: 4px;
  font-weight: 500;
}

/* Tags */
.recipe-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.tag {
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  background: var(--surface2);
  border: 1px solid var(--border);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-mid);
}
.tag-more {
  background: var(--primary-light);
  border-color: transparent;
  color: var(--primary);
  font-weight: 600;
}
</style>
