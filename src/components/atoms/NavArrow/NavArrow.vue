<script lang="ts" setup>
import type { NavArrowProps } from './types'

defineProps<NavArrowProps>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="drp-nav-arrow"
    :class="`drp-nav-arrow--${direction}`"
    :disabled="disabled"
    :aria-label="direction === 'left' ? 'Mois précédent' : 'Mois suivant'"
    @click="$emit('click')"
  >
    <span aria-hidden="true">{{ direction === 'left' ? '‹' : '›' }}</span>
  </button>
</template>

<style scoped>
.drp-nav-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--drp-border, var(--border, #e5e4e7));
  border-radius: 6px;
  background: transparent;
  color: var(--drp-text, var(--text-h, #08060d));
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}

.drp-nav-arrow:hover:not(:disabled) {
  background: var(--drp-nav-hover-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
  border-color: var(--drp-accent, var(--accent-border, rgba(170, 59, 255, 0.5)));
}

.drp-nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
