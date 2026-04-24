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
    :aria-label="label"
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
  border: 1px solid var(--drp-border);
  border-radius: 6px;
  background: transparent;
  color: var(--drp-text);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}

.drp-nav-arrow:hover:not(:disabled) {
  background: var(--drp-accent-subtle);
  border-color: var(--drp-accent);
}

.drp-nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
