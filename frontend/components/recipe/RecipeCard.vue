<template>
  <div class="recipe-card" @click="$emit('click')">
    <div v-if="recipe.imageUrl" class="recipe-image">
      <img :src="recipe.imageUrl" :alt="recipe.title" loading="lazy">
      <div class="recipe-image-overlay">
        <button 
          class="fav-btn-overlay"
          @click.stop="$emit('toggle-fav')"
          :title="recipe.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
        >
          {{ recipe.isFavorite ? '⭐' : '☆' }}
        </button>
      </div>
    </div>
    
    <div class="recipe-content">
      <div class="recipe-header">
        <h3 class="recipe-title">{{ recipe.title }}</h3>
        <button 
          v-if="!recipe.imageUrl"
          class="fav-btn-inline"
          @click.stop="$emit('toggle-fav')"
          :title="recipe.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'"
        >
          {{ recipe.isFavorite ? '⭐' : '☆' }}
        </button>
      </div>
      
      <div class="recipe-category">
        {{ emoji[recipe.category] || '📖' }} {{ recipe.category }}
      </div>
      
      <div class="recipe-meta">
        <span v-if="recipe.duration">⏱️ {{ recipe.duration }} Min.</span>
        <span v-if="recipe.servings">👥 {{ recipe.servings }} Pers.</span>
      </div>
      
      <div v-if="recipe.tags && recipe.tags.length" class="recipe-tags">
        <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
        <span v-if="recipe.tags.length > 3" class="tag-more">
          +{{ recipe.tags.length - 3 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types'

interface Props {
  recipe: Recipe
}

defineProps<Props>()
defineEmits<{
  (e: 'click'): void
  (e: 'toggle-fav'): void
}>()

const { emoji } = useCategories()
</script>

<style scoped>
.recipe-card {
  background: var(--card);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--border);
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.recipe-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.recipe-card:hover .recipe-image-overlay {
  opacity: 1;
}

.fav-btn-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-btn-overlay:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.recipe-content {
  padding: 16px;
}

.recipe-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.recipe-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.fav-btn-inline {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: transform 0.2s;
}

.fav-btn-inline:hover {
  transform: scale(1.2);
}

.recipe-category {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 8px;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 8px;
}

.recipe-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag {
  background: var(--bg);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: var(--text);
}

.tag-more {
  background: var(--border);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}
</style>
