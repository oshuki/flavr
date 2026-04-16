<template>
  <div class="ingredient-chips-container">
    <div class="chips-input-row">
      <input
        v-model="newIngredient"
        type="text"
        class="form-input"
        :placeholder="placeholder"
        @keydown.enter.prevent="addChip"
        @keydown.comma.prevent="addChip"
      >
      <button type="button" class="btn-add-chip" @click="addChip">
        ＋
      </button>
    </div>

    <div v-if="modelValue.length > 0" class="chips-display">
      <div
        v-for="(ingredient, index) in modelValue"
        :key="index"
        class="chip"
      >
        <span class="chip-text">{{ ingredient }}</span>
        <button
          type="button"
          class="chip-remove"
          @click="removeChip(index)"
          title="Entfernen"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-if="modelValue.length === 0" class="empty-state">
      {{ emptyText }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string[]
  placeholder?: string
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Zutat hinzufügen...',
  emptyText: 'Noch keine Zutaten hinzugefügt'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const newIngredient = ref('')

const addChip = () => {
  const value = newIngredient.value.trim()
  if (!value) return

  // Split by comma if multiple ingredients entered
  const ingredients = value.split(',').map(i => i.trim()).filter(i => i)
  
  if (ingredients.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...ingredients])
    newIngredient.value = ''
  }
}

const removeChip = (index: number) => {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}
</script>

<style scoped>
.ingredient-chips-container {
  width: 100%;
}

.chips-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.chips-input-row .form-input {
  flex: 1;
  margin: 0;
}

.btn-add-chip {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 20px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 48px;
}

.btn-add-chip:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.chips-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.chip {
  background: var(--primary);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  animation: chipIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes chipIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.chip-text {
  font-weight: 500;
}

.chip-remove {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.chip-remove:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  color: var(--muted);
  padding: 20px;
  font-size: 14px;
  font-style: italic;
}
</style>
