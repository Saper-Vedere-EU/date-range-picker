<script lang="ts" setup>
import type { CalendarYearCellProps } from './types'

defineProps<CalendarYearCellProps>()
const emit = defineEmits<{ click: [year: number] }>()
</script>

<template>
  <button
    type="button"
    class="drp-year-cell"
    :class="{ 'drp-year-cell--current': isCurrent }"
    @click="emit('click', year)"
  >
    {{ year }}
  </button>
</template>

<style scoped>
.drp-year-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--drp-text);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.drp-year-cell:hover:not(.drp-year-cell--current) {
  background: var(--drp-accent-subtle);
}

.drp-year-cell--current {
  background: var(--drp-accent);
  color: var(--drp-on-accent);
}
</style>
