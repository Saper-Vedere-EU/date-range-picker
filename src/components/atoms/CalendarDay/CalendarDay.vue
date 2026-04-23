<script lang="ts" setup>
import type { CalendarDayProps } from "./types";

const props = defineProps<CalendarDayProps>();
const emit = defineEmits<{ click: [] }>();

function handleClick() {
  if (!props.isDisabled) {
    emit("click");
  }
}
</script>

<template>
  <button
    type="button"
    class="drp-day"
    :class="{
      'drp-day--today': isToday,
      'drp-day--outside': isOutsideMonth,
      'drp-day--selected': isSelected,
      'drp-day--range-start': isRangeStart,
      'drp-day--range-end': isRangeEnd,
      'drp-day--in-range': isInRange,
      'drp-day--disabled': isDisabled,
    }"
    :disabled="isDisabled"
    @click="handleClick"
  >
    {{ day }}
  </button>
</template>

<style scoped>
.drp-day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--drp-day-color, var(--text-h, #08060d));
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.drp-day:hover:not(.drp-day--disabled):not(.drp-day--selected):not(
    .drp-day--range-start
  ):not(.drp-day--range-end) {
  background: var(--drp-day-hover-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
}

.drp-day--today {
  border: 1px solid var(--drp-today-border, var(--accent-border, rgba(170, 59, 255, 0.5)));
}

.drp-day--outside {
  opacity: 0.3;
}

.drp-day--selected,
.drp-day--range-start,
.drp-day--range-end {
  background: var(--drp-accent, var(--accent, #aa3bff));
  color: #fff;
}

.drp-day--range-start {
  border-radius: 50% 0 0 50%;
}

.drp-day--range-end {
  border-radius: 0 50% 50% 0;
}

.drp-day--range-start.drp-day--range-end {
  border-radius: 50%;
}

.drp-day--in-range {
  background: var(--drp-range-bg, var(--accent-bg, rgba(170, 59, 255, 0.1)));
  border-radius: 0;
}

.drp-day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
