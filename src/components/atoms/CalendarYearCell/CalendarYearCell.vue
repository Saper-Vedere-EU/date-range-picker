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
  color: var(--drp-day-color, var(--text-h, #08060d));
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.drp-year-cell:hover:not(.drp-year-cell--current) {
  background: var(--drp-day-hover-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
}

.drp-year-cell--current {
  background: var(--drp-accent, var(--accent, #aa3bff));
  color: #fff;
}
</style>
