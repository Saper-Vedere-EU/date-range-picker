<script lang="ts" setup>
import type { CalendarMonthCellProps } from './types'

defineProps<CalendarMonthCellProps>()
const emit = defineEmits<{ click: [month: number] }>()
</script>

<template>
  <button
    type="button"
    class="drp-month-cell"
    :class="{ 'drp-month-cell--current': isCurrent }"
    @click="emit('click', month)"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.drp-month-cell {
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

.drp-month-cell:hover:not(.drp-month-cell--current) {
  background: var(--drp-accent-subtle);
}

.drp-month-cell--current {
  background: var(--drp-accent);
  color: var(--drp-on-accent);
}
</style>
